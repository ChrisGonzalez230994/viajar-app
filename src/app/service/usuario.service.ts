import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/usuarios'; /// verificar cual es el  Url correcto


  constructor(private http: HttpClient) { }

  registrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
  actualizarUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }
}
