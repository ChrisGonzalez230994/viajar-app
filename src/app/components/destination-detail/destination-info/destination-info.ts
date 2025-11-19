import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-destination-info',
  standalone: false,
  templateUrl: './destination-info.html',
  styleUrl: './destination-info.scss',
})
export class DestinationInfo {
  @Input() destination: any;

}
