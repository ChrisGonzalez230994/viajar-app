export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Reserva {
  _id?: string;
  usuario: string; // ObjectId
  destino: string; // ObjectId
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
