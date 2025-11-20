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
  reservasFiltradas: Reserva[] = [];
  loading: boolean = false;
  filtroEstado: string = '';
  busquedaTexto: string = '';
  ordenamiento: string = 'fecha-desc';
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
    const filtros: any = { 
      limit: 1000,
      populate: 'usuario,destino'
    };

    this.reservaService.getReservas(filtros).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.reservas = response.data;
          console.log('Reservas cargadas:', this.reservas);
          this.filtrar();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando reservas:', error);
        this.loading = false;
      },
    });
  }

  filtrar(): void {
    let resultado = [...this.reservas];

    // Filtrar por estado
    if (this.filtroEstado) {
      resultado = resultado.filter((r) => r.estado === this.filtroEstado);
    }

    // Filtrar por búsqueda de texto
    if (this.busquedaTexto) {
      const texto = this.busquedaTexto.toLowerCase();
      resultado = resultado.filter((r) => {
        const nombreUsuario = this.getNombreUsuario(r).toLowerCase();
        const emailUsuario = this.getEmailUsuario(r).toLowerCase();
        const nombreDestino = this.getNombreDestino(r).toLowerCase();
        return (
          nombreUsuario.includes(texto) ||
          emailUsuario.includes(texto) ||
          nombreDestino.includes(texto)
        );
      });
    }

    // Ordenar
    switch (this.ordenamiento) {
      case 'fecha-desc':
        resultado.sort((a, b) => {
          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaB - fechaA;
        });
        break;
      case 'fecha-asc':
        resultado.sort((a, b) => {
          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaA - fechaB;
        });
        break;
      case 'precio-desc':
        resultado.sort((a, b) => b.precioTotal - a.precioTotal);
        break;
      case 'precio-asc':
        resultado.sort((a, b) => a.precioTotal - b.precioTotal);
        break;
    }

    this.reservasFiltradas = resultado;
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.busquedaTexto = '';
    this.ordenamiento = 'fecha-desc';
    this.filtrar();
  }

  filtrarPorEstado(): void {
    this.filtrar();
  }

  abrirModalEditar(reserva: Reserva): void {
    console.log('Abriendo modal con reserva:', reserva);
    console.log('Usuario:', reserva.usuario);
    console.log('Destino:', reserva.destino);
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

    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
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
  }

  confirmarReservaRapida(reserva: Reserva): void {
    if (!reserva._id) return;

    this.reservaService.actualizarEstado(reserva._id, 'confirmada').subscribe({
      next: (response) => {
        console.log('Reserva confirmada:', response);
        this.cargarReservas();
      },
      error: (error) => {
        console.error('Error confirmando reserva:', error);
      },
    });
  }

  verDetalles(reserva: Reserva): void {
    // Aquí podrías mostrar un modal con más detalles o navegar a otra vista
    alert(
      `Detalles de la Reserva:\n\n` +
        `Usuario: ${this.getNombreUsuario(reserva)}\n` +
        `Email: ${this.getEmailUsuario(reserva)}\n` +
        `Destino: ${this.getNombreDestino(reserva)}\n` +
        `Fechas: ${this.formatearFecha(reserva.fechaInicio)} - ${this.formatearFecha(reserva.fechaFin)}\n` +
        `Personas: ${reserva.numeroPersonas}\n` +
        `Precio: ${this.formatearPrecio(reserva.precioTotal)}\n` +
        `Estado: ${this.getEstadoTexto(reserva.estado)}\n` +
        `Notas: ${reserva.notas || 'Sin notas'}`
    );
  }

  // Métodos de estadísticas
  getTotalReservas(): number {
    return this.reservas.length;
  }

  getReservasPorEstado(estado: EstadoReserva): number {
    return this.reservas.filter((r) => r.estado === estado).length;
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

  formatearFechaCreacion(fecha: Date | string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(precio);
  }

  getDiasEstadia(reserva: Reserva): number {
    if (!reserva.fechaInicio || !reserva.fechaFin) return 0;
    const inicio = new Date(reserva.fechaInicio);
    const fin = new Date(reserva.fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getIniciales(reserva: Reserva): string {
    const usuario = reserva.usuario as any;
    if (!usuario || typeof usuario === 'string') return 'U';
    const nombre = usuario.nombre || '';
    const apellido = usuario.apellido || '';
    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    return iniciales || usuario.username?.charAt(0).toUpperCase() || 'U';
  }

  getEmailUsuario(reserva: Reserva): string {
    const usuario = reserva.usuario as any;
    if (!usuario || typeof usuario === 'string') {
      console.warn('Usuario no populado en reserva:', reserva._id);
      return 'Email no disponible';
    }
    return usuario.email || 'Sin email';
  }

  getNombreUsuario(reserva: Reserva): string {
    const usuario = reserva.usuario as any;
    if (!usuario || typeof usuario === 'string') {
      console.warn('Usuario no populado en reserva:', reserva._id);
      return 'Usuario no disponible';
    }
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
    return nombreCompleto || usuario.username || 'Usuario';
  }

  getNombreDestino(reserva: Reserva): string {
    const destino = reserva.destino as any;
    if (!destino || typeof destino === 'string') {
      console.warn('Destino no populado en reserva:', reserva._id);
      return 'Destino no disponible';
    }
    return destino.nombre || 'Destino';
  }

  volverPanel(): void {
    this.router.navigate(['/admin/panel']);
  }
}
