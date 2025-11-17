export interface Reseña {
  _id?: string;
  usuario: string; // ObjectId
  destino: string; // ObjectId
  calificacion: number; // 1-5
  comentario: string;
  imagenes?: string[];
  reserva?: string; // ObjectId
  verificada?: boolean;
  likes?: number;
  reportada?: boolean;
  motivoReporte?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
