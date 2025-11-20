import { Destino } from './destino';

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Reserva {
  _id?: string;
  usuario: string; // ObjectId
  destino: string | Destino; // ObjectId o objeto populado
  idDestino?: Destino; // Cuando viene populado del backend
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoReserva;
  numeroPersonas: number;
  precioTotal: number;
  notas?: string;
  motivoCancelacion?: string;
  fechaCancelacion?: Date;
  fechaConfirmacion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
