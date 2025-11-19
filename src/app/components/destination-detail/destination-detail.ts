import { Component } from '@angular/core';

@Component({
  selector: 'app-destination-detail',
  standalone: false,
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.scss',
})
export class DestinationDetail {
    destination = {
    name: 'Santorini',
    location: 'Oia, Grecia',
    rating: 4.9,
    reviews: 324,
    price: 890,
    tags: ['romántico', 'playa', 'gastronomía']
  };

  highlights = [
    { icon: '🌅', title: 'Vistas al atardecer', description: 'Los atardeceres más románticos del mundo' },
    { icon: '🏖️', title: 'Playas únicas', description: 'Arena roja y negra por actividad volcánica' },
    { icon: '🍽️', title: 'Gastronomía griega', description: 'Restaurantes con vistas al mar' },
    { icon: '🏘️', title: 'Pueblos pintorescos', description: 'Arquitectura tradicional griega' }
  ];
}

