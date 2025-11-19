import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Base URL de la API Express (endpoints: /api/auth/login, /api/auth/register)
  private apiUrl = `${environment.apiUrl}/auth`;
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
  // Si la API Express no responde se intenta un fallback a json-server (/usuarios)
  login(email: string, password: string): Observable<Usuario | null> {
    return new Observable((observer) => {
      // Intento principal: API Express
      this.http.post<any>(`${this.apiUrl}/login`, { email, password }).subscribe({
        next: (res) => {
          if (res && res.status === 'success') {
            // Guardar el token JWT
            if (res.token) {
              localStorage.setItem('token', res.token);
            }

            const userData = res.userData || res.user || {};
            const usuarioAlmacenado: any = {
              nombre: userData.name || userData.nombre || userData.username || '',
              apellido: userData.apellido || '',
              email: userData.email,
              idUsuario: userData.idUsuario || userData.id || userData._id || Date.now(),
              reservas: userData.reservas || [],
              rol: userData.rol || userData.role || 'user',
              fechaNacimiento: userData.fechaNacimiento || null,
              nacionalidad: userData.nacionalidad || '',
            };

            localStorage.setItem('user', JSON.stringify(usuarioAlmacenado));
            this.autenticado.next(true);
            this.setUserName(usuarioAlmacenado.nombre);
            this.actualizarCantidadReservas();
            observer.next(usuarioAlmacenado as Usuario);
            this.setupInactivityListener();
          } else {
            this.autenticado.next(false);
            observer.next(null);
          }
          observer.complete();
        },
        error: (err) => {
          console.warn(
            'Login /api/auth failed, intentando fallback json-server:',
            err && err.status
          );
          // Fallback json-server: probar por email y password
          const e = encodeURIComponent(email || '');
          const p = encodeURIComponent(password || '');
          this.http
            .get<any[]>(
              `${environment.apiUrl.replace('/api', '')}/usuarios?email=${e}&password=${p}`
            )
            .subscribe({
              next: (res2) => {
                const usuario = res2 && res2[0];
                if (usuario) {
                  const usuarioAlmacenado: any = {
                    nombre: usuario.nombre || usuario.name || usuario.username || '',
                    apellido: usuario.apellido || '',
                    email: usuario.email,
                    idUsuario: usuario.idUsuario || usuario.id || Date.now(),
                    reservas: usuario.reservas || [],
                    rol: usuario.rol || usuario.role || 'user',
                    fechaNacimiento: usuario.fechaNacimiento || null,
                    nacionalidad: usuario.nacionalidad || '',
                  };
                  localStorage.setItem('user', JSON.stringify(usuarioAlmacenado));
                  this.autenticado.next(true);
                  this.setUserName(usuarioAlmacenado.nombre);
                  this.actualizarCantidadReservas();
                  console.log('Usuario logueado (json-server email):', usuarioAlmacenado);
                  observer.next(usuarioAlmacenado as Usuario);
                } else {
                  // Probar por username
                  this.http
                    .get<any[]>(
                      `${environment.apiUrl.replace(
                        '/api',
                        ''
                      )}/usuarios?username=${e}&password=${p}`
                    )
                    .subscribe({
                      next: (res3) => {
                        const usuario2 = res3 && res3[0];
                        if (usuario2) {
                          const usuarioAlmacenado: any = {
                            nombre: usuario2.nombre || usuario2.name || usuario2.username || '',
                            apellido: usuario2.apellido || '',
                            email: usuario2.email,
                            idUsuario: usuario2.idUsuario || usuario2.id || Date.now(),
                            reservas: usuario2.reservas || [],
                            rol: usuario2.rol || usuario2.role || 'user',
                            fechaNacimiento: usuario2.fechaNacimiento || null,
                            nacionalidad: usuario2.nacionalidad || '',
                          };
                          localStorage.setItem('user', JSON.stringify(usuarioAlmacenado));
                          this.autenticado.next(true);
                          this.setUserName(usuarioAlmacenado.nombre);
                          this.actualizarCantidadReservas();
                          console.log(
                            'Usuario logueado (json-server username):',
                            usuarioAlmacenado
                          );
                          observer.next(usuarioAlmacenado as Usuario);
                        } else {
                          this.autenticado.next(false);
                          observer.next(null);
                        }
                        observer.complete();
                      },
                      error: (err3) => {
                        console.error('Error fallback json-server (username):', err3);
                        observer.error(err3);
                      },
                    });
                }
              },
              error: (err2) => {
                console.error('Error fallback json-server (email):', err2);
                observer.error(err2);
              },
            });
        },
      });
    });
  }
  private getUsuarioDesdeLocalStorage(): Usuario | null {
    const data = localStorage.getItem('user');
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error al parsear usuario del localStorage:', e);
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

  getUserId(): string | null {
    return this.getUsuarioDesdeLocalStorage()?._id ?? null;
  }

  private events = ['mousemove', 'keydown', 'scroll', 'click'];
  private listeners: (() => void)[] = [];

  private setupInactivityListener() {
    this.removeInactivityListeners(); // evita duplicar

    this.ngZone.runOutsideAngular(() => {
      this.events.forEach((event) => {
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
    this.listeners.forEach((remove) => remove());
    this.listeners = [];
    clearTimeout(this.timeoutId);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.autenticado.next(false);
    this.clearUserName();
    this.reservasSubject.next(0);
    this.removeInactivityListeners();
    console.log('Usuario deslogueado');
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
          return new Observable((obs) => {
            obs.next(payload);
            obs.complete();
          });
        }
        return throwError(() => new Error('REGISTRATION_FAILED'));
      }),
      catchError((error) => {
        console.warn(
          'Error en registro con /api/auth, intentando fallback json-server:',
          error && error.status
        );
        const fallbackUsuario: any = {
          username: nombre.replace(/\s+/g, '').toLowerCase() || email,
          password: password,
          nombre: nombre,
          apellido: (usuario as any).apellido || '',
          email: email,
          nacionalidad: (usuario as any).nacionalidad || '',
          fechaNacimiento: (usuario as any).fechaNacimiento || '',
          idUsuario: Date.now(),
          rol: 'usuario',
          reservas: [],
        };

        return this.http
          .post<any>(`${environment.apiUrl.replace('/api', '')}/usuarios`, fallbackUsuario)
          .pipe(
            tap((res2) => console.log('Registro fallback json-server:', res2)),
            switchMap(
              (res2) =>
                new Observable((obs) => {
                  obs.next(res2);
                  obs.complete();
                })
            ),
            catchError((err2) => {
              console.error('Error en fallback registro json-server:', err2);
              return throwError(() => err2);
            })
          );
      })
    );
  }
}
