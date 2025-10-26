export interface Destino{
    idDestino : number;
    nombre: string;
    ciudad: string;
    pais: string;
    descripcion: string;
    precio: number;
    latitud: number; //para ubicar en la api
    longitud: number; //para ubicar en la api
}