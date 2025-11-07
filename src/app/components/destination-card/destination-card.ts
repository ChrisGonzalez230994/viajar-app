import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    console.log(`Exploring ${this.type}`);
  }
}
