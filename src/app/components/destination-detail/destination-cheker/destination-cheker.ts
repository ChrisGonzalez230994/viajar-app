import { Component } from '@angular/core';

@Component({
  selector: 'app-destination-cheker',
  standalone: false,
  templateUrl: './destination-cheker.html',
  styleUrl: './destination-cheker.scss',
})
export class DestinationCheker {
  startDate: string = '';
  endDate: string = '';

  checkAvailability() {
    console.log('Consultar disponibilidad:', this.startDate, this.endDate);
  }

}
