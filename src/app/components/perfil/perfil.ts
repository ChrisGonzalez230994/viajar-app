import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservaService } from '../../service/reserva.service';
import { Reserva } from '../../models/reserva';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  usuario: any = null;
  reservas: Reserva[] = [];
  isLoadingReservas: boolean = false;
  reservasError: string = '';

  constructor(private router: Router, private reservaService: ReservaService) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        this.usuario = JSON.parse(userString);
        // Cargar reservas desde la base de datos
        this.cargarReservas();
      } catch (e) {
        console.error('Error al parsear usuario:', e);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarReservas(): void {
    this.isLoadingReservas = true;
    this.reservasError = '';

    this.reservaService.getMisReservas({ limit: 50 }).subscribe({
      next: (response) => {
        this.reservas = response.data;
        this.isLoadingReservas = false;
        console.log('✅ Reservas cargadas:', this.reservas.length);
      },
      error: (error) => {
        console.error('❌ Error cargando reservas:', error);
        this.reservasError = 'Error al cargar tus reservas';
        this.isLoadingReservas = false;
      },
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      pendiente: 'badge-pendiente',
      confirmada: 'badge-confirmada',
      cancelada: 'badge-cancelada',
      completada: 'badge-completada',
    };
    return classes[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      pendiente: 'Próximo viaje',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      completada: 'Completada',
    };
    return textos[estado] || estado;
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }
}
