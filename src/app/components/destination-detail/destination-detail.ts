import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinoService } from '../../service/destino';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-destination-detail',
  standalone: false,
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.scss',
})
export class DestinationDetail implements OnInit {
  router = inject(Router);
  destination: any = null;
  isLoading: boolean = true;
  error: string = '';
  highlights: any[] = [];

  // Slider
  imagenes: string[] = [];
  sliderIndex: number = 0;

  // Reserva
  consultaForm: FormGroup;
  disponibilidad: boolean | null = null;

  // Mapeo de actividades a iconos y descripciones
  private activityIcons: { [key: string]: { icon: string; description: string } } = {
    senderismo: { icon: '🥾', description: 'Rutas y senderos naturales' },
    buceo: { icon: '🤿', description: 'Exploración submarina' },
    surf: { icon: '🏄', description: 'Olas perfectas para surfear' },
    esquí: { icon: '⛷️', description: 'Pistas de esquí de calidad' },
    snorkel: { icon: '🤿', description: 'Aguas cristalinas para snorkel' },
    kayak: { icon: '🛶', description: 'Paseos en kayak' },
    ciclismo: { icon: '🚴', description: 'Rutas para ciclismo' },
    escalada: { icon: '🧗', description: 'Paredes para escalada' },
    parapente: { icon: '🪂', description: 'Vuelos en parapente' },
    rafting: { icon: '🚣', description: 'Descenso de rápidos' },
    'avistamiento de fauna': { icon: '🦅', description: 'Observación de vida silvestre' },
    fotografía: { icon: '📸', description: 'Lugares fotogénicos' },
    gastronomía: { icon: '🍽️', description: 'Experiencias culinarias locales' },
    'paseos en bote': { icon: '⛵', description: 'Tours en embarcación' },
    'visitas culturales': { icon: '🏛️', description: 'Patrimonio histórico y cultural' },
    'spa y relax': { icon: '💆', description: 'Centros de relajación' },
    compras: { icon: '🛍️', description: 'Mercados y tiendas locales' },
    'vida nocturna': { icon: '🎉', description: 'Entretenimiento nocturno' },
    playas: { icon: '🏖️', description: 'Hermosas playas' },
    museos: { icon: '🖼️', description: 'Museos y galerías' },
    'tours guiados': { icon: '🎯', description: 'Recorridos con guía' },
    yoga: { icon: '🧘', description: 'Sesiones de yoga y meditación' },
    pesca: { icon: '🎣', description: 'Pesca deportiva' },
    cabalgatas: { icon: '🐴', description: 'Paseos a caballo' },
    natación: { icon: '🏊', description: 'Piscinas y áreas de baño' },
  };

  constructor(
    private route: ActivatedRoute,
    private destinoService: DestinoService,
    private fb: FormBuilder,
    private router2: Router
  ) {
    this.consultaForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
    });
  }

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
          id: destino._id,
          name: destino.nombre,
          ubicacion: `${destino.ciudad}, ${destino.pais}`,
          location: `${destino.ciudad}, ${destino.pais}`,
          rating: destino.calificacionPromedio || 0,
          reviews: destino.totalResenas || 0,
          precio: destino.precio,
          price: destino.precio,
          tags: destino.tipoViaje || [],
          descripcion: destino.descripcion,
          imagenPrincipal: destino.imagenPrincipal,
          imagenes:
            destino.imagenes && destino.imagenes.length > 0
              ? destino.imagenes
              : [destino.imagenPrincipal],
          actividades: destino.actividades || [],
        };
        this.imagenes = this.destination.imagenes;
        this.sliderIndex = 0;
        // Generar highlights dinámicos basados en actividades
        this.generateHighlights(destino.actividades || []);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar el destino';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
  // Slider controls
  prevImagen() {
    if (this.imagenes.length > 0) {
      this.sliderIndex = (this.sliderIndex - 1 + this.imagenes.length) % this.imagenes.length;
    }
  }
  nextImagen() {
    if (this.imagenes.length > 0) {
      this.sliderIndex = (this.sliderIndex + 1) % this.imagenes.length;
    }
  }

  // Reserva
  consultarDisponibilidad() {
    // Simulación: disponible si la fecha de inicio es después de hoy
    const { fechaInicio, fechaFin } = this.consultaForm.value;
    if (fechaInicio && fechaFin && new Date(fechaInicio) < new Date(fechaFin)) {
      // Simulación: 50% de probabilidad de disponibilidad
      this.disponibilidad = Math.random() > 0.5;
    } else {
      this.disponibilidad = null;
    }
  }

  irACheckout() {
    this.router2.navigate(['/checkout', this.destination.id]);
  }

  exportarDatos() {
    // Simulación: exportar fechas seleccionadas
    const data = {
      destino: this.destination.name,
      fechaInicio: this.consultaForm.value.fechaInicio,
      fechaFin: this.consultaForm.value.fechaFin,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disponibilidad_${this.destination.name}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateHighlights(actividades: string[]) {
    // Limitar a máximo 4 highlights
    const maxHighlights = 4;
    this.highlights = [];

    // Convertir actividades a highlights usando el mapeo
    actividades.slice(0, maxHighlights).forEach((actividad: string) => {
      const actividadLower = actividad.toLowerCase();
      const match = this.activityIcons[actividadLower];

      if (match) {
        this.highlights.push({
          icono: match.icon,
          titulo: this.capitalizeFirst(actividad),
          descripcion: match.description,
        });
      } else {
        // Si no hay mapeo específico, usar icono genérico
        this.highlights.push({
          icono: '✨',
          titulo: this.capitalizeFirst(actividad),
          descripcion: `Actividad disponible: ${actividad}`,
        });
      }
    });

    // Si no hay actividades, mostrar highlights genéricos
    if (this.highlights.length === 0) {
      this.highlights = [
        {
          icono: '🌟',
          titulo: 'Experiencias únicas',
          descripcion: 'Descubre este increíble destino',
        },
        { icono: '📍', titulo: 'Ubicación privilegiada', descripcion: 'En el corazón del destino' },
        { icono: '🎯', titulo: 'Actividades variadas', descripcion: 'Algo para cada viajero' },
        { icono: '💎', titulo: 'Destino destacado', descripcion: 'Altamente recomendado' },
      ];
    }
  }

  capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  irAlCheckout(): void {
    if (this.destination?.id) {
      this.router.navigate(['/checkout/', this.destination.id]);
    }
  }

  volverAlHome(): void {
    this.router.navigate(['/home']);
  }
}
