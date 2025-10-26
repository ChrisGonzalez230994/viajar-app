export interface Usuario {
    idUsuario : number;
    username: string;
    contraseña: string;
    nombre: string;
    apellido: string;
    email: string;
    nacionalidad: string;
    fechaNacimiento: Date;
    rol: string;
    reservas?: any[];
}