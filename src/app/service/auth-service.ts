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
  // Base URL de la API Express (endpoints: /api/auth/login, /api/auth/register)
  private apiUrl = 'http://localhost:3000/api/auth';
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

    // Login usando el endpoint POST /api/auth/login
    // El backend devuelve { status: 'success', token, userData } o { status: 'error', ... }
    login(email: string, password: string): Observable<Usuario | null> {
      return new Observable((observer) => {
        this.http.post<any>(`${this.apiUrl}/login`, { email, password }).subscribe({
          next: (res) => {
            if (res && res.status === 'success') {
              const userData = res.userData || res.user || {};

              // Normalizar campos esperados por la app (nombre, email, idUsuario, reservas...)
              const usuarioAlmacenado: any = {
                nombre: userData.name || userData.nombre || userData.username || '',
                email: userData.email,
                idUsuario: userData.idUsuario || userData.id || userData._id || Date.now(),
                reservas: userData.reservas || []
              };

              localStorage.setItem('user', JSON.stringify(usuarioAlmacenado));
              this.autenticado.next(true);
              this.setUserName(usuarioAlmacenado.nombre);
              this.actualizarCantidadReservas();
              console.log('Usuario logueado:', usuarioAlmacenado);
              observer.next(usuarioAlmacenado as Usuario);
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

  // Registro usando POST /api/auth/register
  // Mapea los campos del formulario a lo que espera el backend (name, email, password)
  registro(usuario: Partial<Usuario>): Observable<any> {
    const nombre = (usuario.nombre || usuario.username || '').trim();
    const email = usuario.email;
    const password = (usuario.password as any) || (usuario as any).contraseña || '';

    if (!nombre || !email || !password) {
      return throwError(() => new Error('INVALID_DATA'));
    }

    const payload = { name: nombre, email: email, password: password };

    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => {
        if (res && res.status === 'success') {
          console.log('Registro exitoso (backend):', res);
        } else {
          console.warn('Registro: respuesta inesperada', res);
        }
      }),
      switchMap((res) => {
        if (res && res.status === 'success') {
          // Devolver el payload como confirmación (la app redirige al login)
          return new Observable((obs) => { obs.next(payload); obs.complete(); });
        }
        return throwError(() => new Error('REGISTRATION_FAILED'));
      }),
      catchError((error) => {
        console.error('Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

}