import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class Paqueteservice {
    private paquetes = [
        { id: 1, nombre: 'Bariloche 5 Dias', precio: 250000, descripcion: 'Hotel, desayuno y excursiones' },
        { id: 2, nombre: 'Cataratas 3 días', precio: 180000, descripcion: 'Hotel y parque nacional' },
    ];


    getPaquete(id:number) {
        return this.paquetes.find(p => p.id === id);
    }
}