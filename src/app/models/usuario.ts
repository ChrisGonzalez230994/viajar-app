export interface PendingEmailChange {
  newEmail: string;
  token: string;
  requestedAt: Date;
}

export interface Usuario {
  _id?: string;
  username: string;
  password?: string;
  nombre: string;
  apellido: string;
  email: string;
  nacionalidad?: string;
  fechaNacimiento?: Date;
  rol: 'admin' | 'user';
  confirmed?: boolean;
  phone?: string;
  pendingEmailChange?: PendingEmailChange;
  reservas?: string[]; // Array de IDs de reservas
  createdAt?: Date;
  updatedAt?: Date;
}
