export interface Ubicacion {
  latitud: number;
  longitud: number;
  direccion?: string;
}

export type TipoViaje =
  | 'aventura'
  | 'romantico'
  | 'historia'
  | 'naturaleza'
  | 'familiar'
  | 'playa'
  | 'ciudad'
  | 'gastronomico'
  | 'relax'
  | 'fotografia';

export interface Destino {
  _id?: string;
  nombre: string;
  ciudad: string;
  pais: string;
  descripcion: string;
  imagenes?: string[];
  imagenPrincipal?: string;
  precio: number;
  ubicacion: Ubicacion;
  actividades?: string[];
  categorias?: string[];
  tipoViaje?: TipoViaje[];
  disponibilidad?: boolean;
  calificacionPromedio?: number;
  totalReseñas?: number;
  capacidadMaxima?: number;
  destacado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
