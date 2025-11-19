import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-destination-highlights',
  standalone: false,
  templateUrl: './destination-highlights.html',
  styleUrl: './destination-highlights.scss',
})
export class DestinationHighlights {
  @Input() highlights: any[] = [];

}
