import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DestinoService } from '../../../service/destino';
import { Destino } from '../../../models/destino';

@Component({
  selector: 'app-lista-destinos',
  standalone: false,
  templateUrl: './lista-destinos.html',
  styleUrl: './lista-destinos.scss',
})
export class ListaDestinos implements OnInit {
  destinos: Destino[] = [];
  loading: boolean = false;

  constructor(private destinoService: DestinoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarDestinos();
  }

  cargarDestinos(): void {
    this.loading = true;
    this.destinoService.getDestinos({ limit: 100 }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.destinos = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando destinos:', error);
        this.loading = false;
      },
    });
  }

  abrirModalCrear(): void {
    this.router.navigate(['/admin/destinos']);
  }

  abrirModalEditar(destino: Destino): void {
    this.router.navigate(['/admin/destinos', destino._id]);
  }

  eliminarDestino(destino: Destino): void {
    if (!destino._id) return;

    this.destinoService.deleteDestino(destino._id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.destinos = this.destinos.filter((d) => d._id !== destino._id);
          console.log('Destino eliminado correctamente');
        }
      },
      error: (error) => {
        console.error('Error eliminando destino:', error);
      },
    });
  }

  volverPanel(): void {
    this.router.navigate(['/admin/panel']);
  }
}
