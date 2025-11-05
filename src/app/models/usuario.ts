export interface Usuario {
    id?: string;
    idUsuario: number;
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    nacionalidad: string;
    fechaNacimiento: string | Date;
    rol: string;
    reservas?: any[];
}