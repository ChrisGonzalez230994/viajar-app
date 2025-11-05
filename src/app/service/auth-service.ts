import { Injectable , NgZone} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario';  
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/usuarios';
  private userKey = 'user';
  private timeoutId: any;
  private inactivityTime = 60000;
  
  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {}



  private autenticado = new BehaviorSubject<boolean>(this.isAuthenticated());
  public autenticado$ = this.autenticado.asObservable();
  private userNameSource = new BehaviorSubject<string | null>(null);
  public reservasSubject = new BehaviorSubject<number>(0);
  public reservas$ = this.reservasSubject.asObservable();
  public userName$ = this.userNameSource.asObservable();

    login(username: string, password: string): Observable<Usuario | null> {
      return new Observable((observer) => {
        this.http.get<Usuario[]>(`${this.apiUrl}?username=${encodeURIComponent(username)}`).subscribe({
          next: (usuarios) => {
            const usuario = usuarios.find(u => u.password === password);
            if (usuario) {
              localStorage.setItem('user', JSON.stringify(usuario));
              this.autenticado.next(true);
              this.actualizarCantidadReservas();
              console.log("Usuario logueado:", usuario);
              observer.next(usuario);
              this.setupInactivityListener();
            } else {
              this.autenticado.next(false);
              observer.next(null);
            }
            observer.complete();
          },
          error: (error) => {
            console.error('Error en login:', error);
            observer.error(error);
          }
        });
      });
    }
    private getUsuarioDesdeLocalStorage(): Usuario | null {
      const data = localStorage.getItem('user');
      if (!data) return null;
      
      try {
        return JSON.parse(data);
      } catch (e){
        console.error("Error al parsear usuario del localStorage:", e);
        return null;
      }
    }
    estaAutenticado(): boolean {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user !== null && !!user.email;
      } catch {
        return false;
      }
    }
    getUserName(): string | null {
      return this.getUsuarioDesdeLocalStorage()?.nombre ?? null;
    }
    
    getUserId(): number | null {
      return this.getUsuarioDesdeLocalStorage()?.idUsuario ?? null;
    }



    private events = ['mousemove', 'keydown', 'scroll', 'click'];
    private listeners: (() => void)[] = [];
    
    private setupInactivityListener() {
      this.removeInactivityListeners(); // evita duplicar
    
      this.ngZone.runOutsideAngular(() => {
        this.events.forEach(event => {
          const handler = () => this.resetTimer();
          window.addEventListener(event, handler);
          this.listeners.push(() => window.removeEventListener(event, handler));
        });
      });
    
      this.resetTimer(); // inicializa el temporizador
    }




    
    private resetTimer() {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.logout();
          alert('Sesión cerrada por inactividad');
          this.router.navigate(['/login']);
        });
      }, this.inactivityTime);
    }


    private removeInactivityListeners() {
      this.listeners.forEach(remove => remove());
      this.listeners = [];
      clearTimeout(this.timeoutId);
    }

   
  logout() {
    
    localStorage.removeItem('user');
    this.autenticado.next(false);
    this.clearUserName();
    this.reservasSubject.next(0);
    this.removeInactivityListeners();
    console.log("Usuario deslogueado");
    this.router.navigate(['/login']);
  }

  
  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
  }
  setUserName(name: string) {
    this.userNameSource.next(name);
  }

  clearUserName() {
    this.userNameSource.next(null);
  }
  public getUsuario(): Usuario | null {
    return this.getUsuarioDesdeLocalStorage();
  }




  public actualizarCantidadReservas(): void {
    const usuario = this.getUsuario();
    const cantidad = usuario?.reservas?.length || 0;
    this.reservasSubject.next(cantidad);
  }
  public actualizarUsuarioLocal(usuario: Usuario): void {
    localStorage.setItem('user', JSON.stringify(usuario));
    this.setUserName(usuario.nombre);
    this.reservasSubject.next(usuario.reservas?.length ?? 0);
  }

  public inicializarSesionSiExiste() {
    const usuario = this.getUsuarioDesdeLocalStorage();
    if (usuario) {
      this.autenticado.next(true);
      this.setUserName(usuario.nombre);
      this.setupInactivityListener(); 
    }
  }

  registro(usuario: Partial<Usuario>): Observable<Usuario> {
    if (!usuario.username || !usuario.email) {
      return throwError(() => new Error('INVALID_DATA'));
    }

    const urlUsername = `${this.apiUrl}?username=${encodeURIComponent(usuario.username)}`;
    const urlEmail = `${this.apiUrl}?email=${encodeURIComponent(usuario.email)}`;

    return this.http.get<Usuario[]>(urlUsername).pipe(
      switchMap(usuariosPorNombre => {
        if (usuariosPorNombre.length > 0) {
          return throwError(() => new Error('USERNAME_TAKEN'));
        }
        return this.http.get<Usuario[]>(urlEmail);
      }),
      switchMap(usuariosPorEmail => {
        if (usuariosPorEmail.length > 0) {
          return throwError(() => new Error('EMAIL_TAKEN'));
        }
        const nuevoUsuario: Partial<Usuario> = {
          ...usuario,
          id: Math.random().toString(36).substr(2, 4),
          idUsuario: Date.now(),
          rol: 'usuario',
          reservas: []
        };
        
        return this.http.post<Usuario>(this.apiUrl, nuevoUsuario);
      }),
      tap(nuevoUsuario => {
        console.log('Usuario registrado exitosamente:', nuevoUsuario);
      }),
      catchError(error => {
        if (error.status === 404) {
          console.error('Error 404: Verifica que el servidor json-server esté corriendo');
        }
        console.error('Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

}