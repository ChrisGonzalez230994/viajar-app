import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestinoService } from '../../service/destino';
import { Destino } from '../../models/destino'; 
import { Router } from '@angular/router';

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

  // Mapeo de actividades a iconos y descripciones
  private activityIcons: { [key: string]: { icon: string; description: string } } = {
    'senderismo': { icon: '🥾', description: 'Rutas y senderos naturales' },
    'buceo': { icon: '🤿', description: 'Exploración submarina' },
    'surf': { icon: '🏄', description: 'Olas perfectas para surfear' },
    'esquí': { icon: '⛷️', description: 'Pistas de esquí de calidad' },
    'snorkel': { icon: '🤿', description: 'Aguas cristalinas para snorkel' },
    'kayak': { icon: '🛶', description: 'Paseos en kayak' },
    'ciclismo': { icon: '🚴', description: 'Rutas para ciclismo' },
    'escalada': { icon: '🧗', description: 'Paredes para escalada' },
    'parapente': { icon: '🪂', description: 'Vuelos en parapente' },
    'rafting': { icon: '🚣', description: 'Descenso de rápidos' },
    'avistamiento de fauna': { icon: '🦅', description: 'Observación de vida silvestre' },
    'fotografía': { icon: '📸', description: 'Lugares fotogénicos' },
    'gastronomía': { icon: '🍽️', description: 'Experiencias culinarias locales' },
    'paseos en bote': { icon: '⛵', description: 'Tours en embarcación' },
    'visitas culturales': { icon: '🏛️', description: 'Patrimonio histórico y cultural' },
    'spa y relax': { icon: '💆', description: 'Centros de relajación' },
    'compras': { icon: '🛍️', description: 'Mercados y tiendas locales' },
    'vida nocturna': { icon: '🎉', description: 'Entretenimiento nocturno' },
    'playas': { icon: '🏖️', description: 'Hermosas playas' },
    'museos': { icon: '🖼️', description: 'Museos y galerías' },
    'tours guiados': { icon: '🎯', description: 'Recorridos con guía' },
    'yoga': { icon: '🧘', description: 'Sesiones de yoga y meditación' },
    'pesca': { icon: '🎣', description: 'Pesca deportiva' },
    'cabalgatas': { icon: '🐴', description: 'Paseos a caballo' },
    'natación': { icon: '🏊', description: 'Piscinas y áreas de baño' },
  };

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
          id: destino._id,
          name: destino.nombre,
          location: `${destino.ciudad}, ${destino.pais}`,
          rating: destino.calificacionPromedio || 0,
          reviews: destino.totalReseñas || 0,
          price: destino.precio,
          tags: destino.tipoViaje || [],
          descripcion: destino.descripcion,
          imagenPrincipal: destino.imagenPrincipal,
          imagenes: destino.imagenes || [],
          actividades: destino.actividades || [],
        };
        
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
          icon: match.icon,
          title: this.capitalizeFirst(actividad),
          description: match.description,
        });
      } else {
        // Si no hay mapeo específico, usar icono genérico
        this.highlights.push({
          icon: '✨',
          title: this.capitalizeFirst(actividad),
          description: `Actividad disponible: ${actividad}`,
        });
      }
    });

    // Si no hay actividades, mostrar highlights genéricos
    if (this.highlights.length === 0) {
      this.highlights = [
        { icon: '🌟', title: 'Experiencias únicas', description: 'Descubre este increíble destino' },
        { icon: '📍', title: 'Ubicación privilegiada', description: 'En el corazón del destino' },
        { icon: '🎯', title: 'Actividades variadas', description: 'Algo para cada viajero' },
        { icon: '💎', title: 'Destino destacado', description: 'Altamente recomendado' },
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
