import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UbButtonDirective } from '@/components/ui/button';
import { UbCardDirective, UbCardContentDirective } from '@/components/ui/card';

export type DestinationType = 'montañas' | 'playas' | 'ciudades' | 'selvas';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [CommonModule, UbButtonDirective, UbCardDirective, UbCardContentDirective],
  templateUrl: './destination-card.html',
  styleUrls: ['./destination-card.scss'],
})
export class DestinationCard {
  @Input() type: DestinationType = 'playas';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() ctaText: string = 'Explorar';
  @Input() destinoId: string = '';

  constructor(private router: Router) {}

  get cardConfig() {
    const configs = {
      montañas: {
        iconPath: '/assets/mountain.svg',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea',
      },
      playas: {
        iconPath: '/assets/beach.svg',
        gradient: 'linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)',
        color: '#06beb6',
      },
      ciudades: {
        iconPath: '/assets/citys.svg',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f093fb',
      },
      selvas: {
        iconPath: '/assets/jungle.svg',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#4facfe',
      },
    };
    return configs[this.type];
  }

  get displayTitle() {
    return this.title || this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }

  onExplore() {
    if (this.destinoId) {
      // Si tiene ID, navegar al detalle del destino
      this.router.navigate(['/detalle-destino', this.destinoId]);
    } else {
      // Si no tiene ID, es un card de categoría, navegar a destinos con filtro por tipo de viaje
      const tipoViaje = this.getTipoViajeByType();

      // Guardar búsqueda en localStorage
      localStorage.setItem(
        'lastSearch',
        JSON.stringify({
          query: '',
          ubicacion: '',
          precioMax: null,
          pais: '',
          ciudad: '',
          tipoViaje: tipoViaje,
        })
      );

      // Navegar a la página de destinos
      this.router.navigate(['/destinos']);
    }
  }

  private getTipoViajeByType(): string {
    const typeMapping: Record<DestinationType, string> = {
      montañas: 'naturaleza',
      playas: 'playa',
      ciudades: 'ciudad',
      selvas: 'naturaleza',
    };
    return typeMapping[this.type] || '';
  }
}
