import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservaService } from '../../../service/reserva.service';
import { Reserva, EstadoReserva } from '../../../models/reserva';

@Component({
  selector: 'app-reservas',
  standalone: false,
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class Reservas implements OnInit {
  reservas: Reserva[] = [];
  loading: boolean = false;
  filtroEstado: string = '';
  reservaSeleccionada: Reserva | null = null;
  mostrarModalEditar: boolean = false;
  nuevoEstado: EstadoReserva = 'pendiente';
  motivoCancelacion: string = '';

  constructor(private router: Router, private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    const filtros: any = { limit: 100 };
    if (this.filtroEstado) {
      filtros.estado = this.filtroEstado;
    }

    this.reservaService.getReservas(filtros).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.reservas = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando reservas:', error);
        this.loading = false;
      },
    });
  }

  filtrarPorEstado(): void {
    this.cargarReservas();
  }

  abrirModalEditar(reserva: Reserva): void {
    this.reservaSeleccionada = reserva;
    this.nuevoEstado = reserva.estado;
    this.motivoCancelacion = '';
    this.mostrarModalEditar = true;
  }

  cerrarModal(): void {
    this.mostrarModalEditar = false;
    this.reservaSeleccionada = null;
    this.motivoCancelacion = '';
  }

  actualizarEstado(): void {
    if (!this.reservaSeleccionada?._id) return;

    this.reservaService
      .actualizarEstado(
        this.reservaSeleccionada._id,
        this.nuevoEstado,
        this.motivoCancelacion || undefined
      )
      .subscribe({
        next: (response) => {
          console.log('Estado actualizado:', response);
          this.cerrarModal();
          this.cargarReservas();
        },
        error: (error) => {
          console.error('Error actualizando estado:', error);
        },
      });
  }

  cancelarReserva(reserva: Reserva): void {
    if (!reserva._id) return;

    this.reservaService.cancelarReserva(reserva._id).subscribe({
      next: (response) => {
        console.log('Reserva cancelada:', response);
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error cancelando reserva:', error);
      },
    });
  }

  getEstadoBadgeVariant(
    estado: EstadoReserva
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (estado) {
      case 'confirmada':
        return 'default';
      case 'pendiente':
        return 'secondary';
      case 'cancelada':
        return 'destructive';
      case 'completada':
        return 'default';
      default:
        return 'secondary';
    }
  }

  getEstadoTexto(estado: EstadoReserva): string {
    switch (estado) {
      case 'confirmada':
        return '✅ Confirmada';
      case 'pendiente':
        return '⏳ Pendiente';
      case 'cancelada':
        return '❌ Cancelada';
      case 'completada':
        return '✓ Completada';
      default:
        return estado;
    }
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getNombreUsuario(reserva: Reserva): string {
    const usuario = reserva.usuario as any;
    if (typeof usuario === 'string') return 'Usuario';
    return (
      `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.username || 'Usuario'
    );
  }

  getNombreDestino(reserva: Reserva): string {
    const destino = reserva.destino as any;
    if (typeof destino === 'string') return 'Destino';
    return destino.nombre || 'Destino';
  }

  volverPanel(): void {
    this.router.navigate(['/admin/panel']);
  }
}
