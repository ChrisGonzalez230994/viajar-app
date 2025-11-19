import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`; // URL del servidor remoto

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token obtenido:', token); // Debug
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('token', token);
    }
    return headers;
  }

  registrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  obtenerUsuarios(): Observable<any> {
    const headers = this.getHeaders();
    console.log('Headers enviados:', headers); // Debug
    return this.http.get<any>(this.apiUrl, { headers });
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, { headers: this.getHeaders() });
  }

  cambiarRol(id: string, rol: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/rol`, { rol }, { headers: this.getHeaders() });
  }

  cambiarEstado(id: string, confirmed: boolean): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/estado`,
      { confirmed },
      { headers: this.getHeaders() }
    );
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
