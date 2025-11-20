import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reseña } from '../models/reseña';
import { environment } from '../../environments/environment';

interface ReservasPendientesResponse {
  status: string;
  data: {
    reservaId: string;
    destinoId: string;
    destinoNombre: string;
    fechaFin: Date;
  }[];
}

interface CreateReseñaResponse {
  status: string;
  data: Reseña;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReseñaService {
  private apiUrl = `${environment.apiUrl}/resenas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('token', token);
    }
    return headers;
  }

  /**
   * Obtener reservas completadas sin reseña
   */
  getReservasPendientesReseña(): Observable<ReservasPendientesResponse> {
    const headers = this.getHeaders();
    return this.http.get<ReservasPendientesResponse>(`${this.apiUrl}/pendientes-resena`, {
      headers,
    });
  }

  /**
   * Crear una nueva reseña
   */
  createReseña(reseña: Partial<Reseña>): Observable<CreateReseñaResponse> {
    const headers = this.getHeaders();
    return this.http.post<CreateReseñaResponse>(this.apiUrl, reseña, { headers });
  }

  /**
   * Obtener mis reseñas
   */
  getMisReseñas(): Observable<{ status: string; data: Reseña[] }> {
    const headers = this.getHeaders();
    return this.http.get<{ status: string; data: Reseña[] }>(`${this.apiUrl}/mis-reseñas`, {
      headers,
    });
  }
}
