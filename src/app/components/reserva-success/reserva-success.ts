import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reserva-success',
  standalone: false,
  templateUrl: './reserva-success.html',
  styleUrl: './reserva-success.scss',
})
export class ReservaSuccess implements OnInit {
  countdown: number = 5;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Countdown para redirigir automáticamente
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.irAPerfil();
      }
    }, 1000);
  }

  irAPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  irAInicio(): void {
    this.router.navigate(['/']);
  }
}
