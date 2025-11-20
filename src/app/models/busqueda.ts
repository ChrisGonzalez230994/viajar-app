import { Destino } from './destino';

export interface ResultadoBusqueda {
  destinoId: string;
  nombre: string;
  ciudad: string;
  pais: string;
  precio: number;
  tipoViaje: string[];
  calificacionPromedio: number;
  score: number; // 0-1
  relevance: number; // 0-100
  imagenPrincipal?: string;
}

export interface MetadataBusqueda {
  query: string;
  enrichedQuery: string;
  total: number;
  tipoViaje?: string;
  precioMin?: number;
  precioMax?: number;
}

export interface RespuestaBusqueda {
  status: string;
  data: ResultadoBusqueda[];
  metadata: MetadataBusqueda;
}

export interface FiltrosBusqueda {
  query: string;
  tipoViaje?: string;
  ubicacion?: string; // Busca en pais OR ciudad
  pais?: string;
  ciudad?: string;
  precioMin?: number;
  precioMax?: number;
  calificacionMin?: number;
  limit?: number;
}
