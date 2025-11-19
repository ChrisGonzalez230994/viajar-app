import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservas',
  standalone: false,
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class Reservas implements OnInit {
  reservas: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: Cargar reservas desde el servicio
    this.reservas = [
      {
        id: 1,
        usuario: 'Juan Pérez',
        destino: 'Cataratas del Iguazú',
        fecha: '2025-12-01',
        personas: 2,
        estado: 'confirmada',
      },
      {
        id: 2,
        usuario: 'María González',
        destino: 'Machu Picchu',
        fecha: '2025-12-15',
        personas: 3,
        estado: 'pendiente',
      },
    ];
  }

  volverPanel(): void {
    this.router.navigate(['/admin/panel']);
  }
}
