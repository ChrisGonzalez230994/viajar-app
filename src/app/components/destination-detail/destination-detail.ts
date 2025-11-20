import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestinoService } from '../../service/destino';
import { Destino } from '../../models/destino';

@Component({
  selector: 'app-destination-detail',
  standalone: false,
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.scss',
})
export class DestinationDetail implements OnInit {
  destination: any = null;
  isLoading: boolean = true;
  error: string = '';

  highlights = [
    {
      icon: '🌅',
      title: 'Vistas al atardecer',
      description: 'Los atardeceres más románticos del mundo',
    },
    {
      icon: '🏖️',
      title: 'Playas únicas',
      description: 'Arena roja y negra por actividad volcánica',
    },
    { icon: '🍽️', title: 'Gastronomía griega', description: 'Restaurantes con vistas al mar' },
    { icon: '🏘️', title: 'Pueblos pintorescos', description: 'Arquitectura tradicional griega' },
  ];

  constructor(private route: ActivatedRoute, private destinoService: DestinoService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDestino(id);
    }
  }

  loadDestino(id: string) {
    this.isLoading = true;
    this.destinoService.getDestinoById(id).subscribe({
      next: (response: any) => {
        const destino = response.data;
        this.destination = {
          name: destino.nombre,
          location: `${destino.ciudad}, ${destino.pais}`,
          rating: destino.calificacionPromedio || 0,
          reviews: destino.totalReseñas || 0,
          price: destino.precio,
          tags: destino.tipoViaje || [],
          descripcion: destino.descripcion,
          imagenes: destino.imagenes || [],
          actividades: destino.actividades || [],
        };
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar el destino';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}
