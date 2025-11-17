import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destino } from '../models/destino';
import { FiltrosBusqueda, RespuestaBusqueda, ResultadoBusqueda } from '../models/busqueda';
import { environment } from '../../environments/environment';

interface PaginationResponse<T> {
  status: string;
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface DestinoConReseñas {
  status: string;
  data: Destino & { reseñas: any[] };
}

interface TipoViajeInfo {
  id: string;
  nombre: string;
  descripcion: string;
  keywords: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DestinoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //********************
  //* ENDPOINTS DESTINOS
  //********************

  /**
   * Obtener todos los destinos con filtros y paginación
   */
  getDestinos(filtros?: {
    search?: string;
    ciudad?: string;
    pais?: string;
    precioMin?: number;
    precioMax?: number;
    calificacionMin?: number;
    actividades?: string[];
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<PaginationResponse<Destino>> {
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        const value = (filtros as any)[key];
        if (value !== undefined && value !== null) {
          if (key === 'actividades' && Array.isArray(value)) {
            params = params.set(key, value.join(','));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<PaginationResponse<Destino>>(`${this.apiUrl}/destinos`, { params });
  }

  /**
   * Obtener un destino por ID con sus reseñas
   */
  getDestinoById(id: string): Observable<DestinoConReseñas> {
    return this.http.get<DestinoConReseñas>(`${this.apiUrl}/destinos/${id}`);
  }

  /**
   * Crear un nuevo destino (solo admin)
   */
  createDestino(destino: Partial<Destino>): Observable<{ status: string; data: Destino }> {
    return this.http.post<{ status: string; data: Destino }>(`${this.apiUrl}/destinos`, destino);
  }

  /**
   * Actualizar un destino (solo admin)
   */
  updateDestino(
    id: string,
    destino: Partial<Destino>
  ): Observable<{ status: string; data: Destino }> {
    return this.http.put<{ status: string; data: Destino }>(
      `${this.apiUrl}/destinos/${id}`,
      destino
    );
  }

  /**
   * Eliminar un destino (solo admin)
   */
  deleteDestino(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(`${this.apiUrl}/destinos/${id}`);
  }

  /**
   * Obtener destinos destacados
   */
  getDestinosDestacados(limit: number = 6): Observable<PaginationResponse<Destino>> {
    return this.http.get<PaginationResponse<Destino>>(`${this.apiUrl}/destinos/destacados/top`, {
      params: new HttpParams().set('limit', limit.toString()),
    });
  }

  //***************************
  //* BÚSQUEDA SEMÁNTICA (VECTOR)
  //***************************

  /**
   * Búsqueda semántica basada en intención del usuario
   */
  busquedaSemantica(filtros: FiltrosBusqueda): Observable<RespuestaBusqueda> {
    return this.http.post<RespuestaBusqueda>(`${this.apiUrl}/search/semantic`, filtros);
  }

  /**
   * Encontrar destinos similares a uno dado
   */
  getDestinosSimilares(
    destinoId: string,
    limit: number = 5
  ): Observable<{ status: string; data: ResultadoBusqueda[]; metadata: any }> {
    return this.http.get<{ status: string; data: ResultadoBusqueda[]; metadata: any }>(
      `${this.apiUrl}/search/similar/${destinoId}`,
      { params: new HttpParams().set('limit', limit.toString()) }
    );
  }

  /**
   * Re-indexar todos los destinos en Qdrant (solo admin)
   */
  reindexarDestinos(): Observable<{
    status: string;
    message: string;
    indexed: number;
    failed: number;
  }> {
    return this.http.post<{
      status: string;
      message: string;
      indexed: number;
      failed: number;
    }>(`${this.apiUrl}/search/index`, {});
  }

  /**
   * Obtener estadísticas del índice vectorial
   */
  getEstadisticasVectoriales(): Observable<{
    status: string;
    data: {
      totalPoints: number;
      indexedVectors: number;
      collectionName: string;
      vectorSize: number;
    };
  }> {
    return this.http.get<{
      status: string;
      data: {
        totalPoints: number;
        indexedVectors: number;
        collectionName: string;
        vectorSize: number;
      };
    }>(`${this.apiUrl}/search/stats`);
  }

  /**
   * Obtener tipos de viaje disponibles con keywords
   */
  getTiposViaje(): Observable<{
    status: string;
    data: TipoViajeInfo[];
  }> {
    return this.http.get<{
      status: string;
      data: TipoViajeInfo[];
    }>(`${this.apiUrl}/search/tipos-viaje`);
  }

  //********************
  //* MÉTODOS AUXILIARES
  //********************

  /**
   * Búsqueda rápida por texto (sin filtros)
   */
  buscarDestinos(query: string, limit: number = 10): Observable<RespuestaBusqueda> {
    return this.busquedaSemantica({ query, limit });
  }

  /**
   * Buscar destinos por tipo de viaje
   */
  buscarPorTipoViaje(tipoViaje: string, limit: number = 10): Observable<RespuestaBusqueda> {
    return this.busquedaSemantica({
      query: tipoViaje,
      tipoViaje,
      limit,
    });
  }

  /**
   * Buscar destinos en un rango de precio
   */
  buscarPorPrecio(
    precioMin: number,
    precioMax: number,
    query: string = 'destino turístico'
  ): Observable<RespuestaBusqueda> {
    return this.busquedaSemantica({
      query,
      precioMin,
      precioMax,
    });
  }

  /**
   * Buscar destinos por país o ciudad
   */
  buscarPorUbicacion(query: string, pais?: string, ciudad?: string): Observable<RespuestaBusqueda> {
    return this.busquedaSemantica({
      query,
      pais,
      ciudad,
    });
  }
}
