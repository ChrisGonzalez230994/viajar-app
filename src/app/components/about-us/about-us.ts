import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-about-us',
  standalone: false,
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss',
})
export class AboutUs {
  router = inject(Router);

  volverAlHome(): void {
    this.router.navigate(['/home']);
  }

}
