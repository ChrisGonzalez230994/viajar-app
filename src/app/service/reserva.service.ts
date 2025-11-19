import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva';
import { environment } from '../../environments/environment';

interface PaginationResponse<T> {
  status: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ReservaResponse {
  status: string;
  data: Reserva;
  message?: string;
}

interface DisponibilidadResponse {
  status: string;
  data: {
    disponible: boolean;
    capacidadMaxima: number;
    capacidadDisponible: number;
    personasReservadas: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`;

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
   * Obtener todas las reservas (solo admin)
   */
  getReservas(filtros?: {
    estado?: string;
    destinoId?: string;
    usuarioId?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginationResponse<Reserva>> {
    const headers = this.getHeaders();
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        const value = (filtros as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginationResponse<Reserva>>(this.apiUrl, { headers, params });
  }

  /**
   * Obtener mis reservas (usuario autenticado)
   */
  getMisReservas(filtros?: {
    estado?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginationResponse<Reserva>> {
    const headers = this.getHeaders();
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        const value = (filtros as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginationResponse<Reserva>>(`${this.apiUrl}/mis-reservas`, {
      headers,
      params,
    });
  }

  /**
   * Obtener una reserva por ID
   */
  getReservaById(id: string): Observable<ReservaResponse> {
    const headers = this.getHeaders();
    return this.http.get<ReservaResponse>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Crear una nueva reserva
   */
  createReserva(reserva: {
    destinoId: string;
    fechaInicio: Date | string;
    fechaFin: Date | string;
    numeroPersonas: number;
    notas?: string;
  }): Observable<ReservaResponse> {
    const headers = this.getHeaders();
    return this.http.post<ReservaResponse>(this.apiUrl, reserva, { headers });
  }

  /**
   * Actualizar estado de una reserva
   */
  actualizarEstado(
    id: string,
    estado: string,
    motivoCancelacion?: string
  ): Observable<ReservaResponse> {
    const headers = this.getHeaders();
    const body: any = { estado };
    if (motivoCancelacion) {
      body.motivoCancelacion = motivoCancelacion;
    }
    return this.http.put<ReservaResponse>(`${this.apiUrl}/${id}/estado`, body, { headers });
  }

  /**
   * Cancelar una reserva
   */
  cancelarReserva(
    id: string,
    motivoCancelacion?: string
  ): Observable<{ status: string; message: string }> {
    const headers = this.getHeaders();
    const body: any = {};
    if (motivoCancelacion) {
      body.motivoCancelacion = motivoCancelacion;
    }
    return this.http.delete<{ status: string; message: string }>(`${this.apiUrl}/${id}`, {
      headers,
      body,
    });
  }

  /**
   * Verificar disponibilidad de un destino en fechas específicas
   */
  verificarDisponibilidad(
    destinoId: string,
    fechaInicio: Date | string,
    fechaFin: Date | string
  ): Observable<DisponibilidadResponse> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio.toString())
      .set('fechaFin', fechaFin.toString());

    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/disponibilidad/${destinoId}`, {
      params,
    });
  }
}
