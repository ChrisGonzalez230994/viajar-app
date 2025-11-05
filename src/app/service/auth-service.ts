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
  private inactivityTime = 60000; // 1 minuto = 60.000 ms
  

  constructor(private http: HttpClient,private router: Router, private ngZone: NgZone) { 
    
  }



  private autenticado = new BehaviorSubject<boolean>(this.isAuthenticated());
  public autenticado$ = this.autenticado.asObservable();
  private userNameSource = new BehaviorSubject<string | null>(null);
  public reservasSubject = new BehaviorSubject<number>(0);
  public reservas$ = this.reservasSubject.asObservable();
  public userName$ = this.userNameSource.asObservable();

    login(username: string, password: string): Observable<Usuario | null> {
      return new Observable((observer) => {
        this.http.get<Usuario[]>(`${this.apiUrl}?username=${username}&password=${password}`).subscribe((usuarios) => {
          const usuario = usuarios[0];
          if (usuario) {
            //this.usuarioLogueado = usuario;
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



/*
    private setupInactivityListener() {
      const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
      this.ngZone.runOutsideAngular(() => {
        events.forEach(event => {
          window.addEventListener(event, () => this.resetTimer());
        });
      });
    
      this.resetTimer(); // inicializa el temporizador
    }*/
    
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
    this.clearUserName(); // limpia el nombre del observable
    this.reservasSubject.next(0);
    this.removeInactivityListeners(); // 🧼 limpia los eventos y el timeout
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

    // Verificar si existe el username
    const urlUsername = `${this.apiUrl}?username=${encodeURIComponent(usuario.username)}`;
    const urlEmail = `${this.apiUrl}?email=${encodeURIComponent(usuario.email)}`;

    return this.http.get<Usuario[]>(urlUsername).pipe(
      switchMap(usuariosPorNombre => {
        if (usuariosPorNombre.length > 0) {
          return throwError(() => new Error('USERNAME_TAKEN'));
        }
        // Si el username está libre, verificar email
        return this.http.get<Usuario[]>(urlEmail);
      }),
      switchMap(usuariosPorEmail => {
        if (usuariosPorEmail.length > 0) {
          return throwError(() => new Error('EMAIL_TAKEN'));
        }
        // Si ambos están libres, crear el usuario
        usuario.idUsuario = Date.now();
        usuario.rol = 'usuario';
        usuario.reservas = [];
        
        return this.http.post<Usuario>(this.apiUrl, usuario);
      }),
      tap(nuevoUsuario => {
        console.log('Usuario registrado exitosamente:', nuevoUsuario);
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

}