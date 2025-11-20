import { Component, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ReseñaService } from './service/reseña.service';
import { AuthService } from './service/auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('viajar-app');
  showLayout = true;

  // Modal de reseña
  showModalResena = false;
  reservaPendiente: any = null;
  private modalYaMostrado = false;
  private readonly MODAL_COOLDOWN_KEY = 'modal_resena_cooldown';
  private readonly COOLDOWN_MINUTES = 2;

  constructor(
    private router: Router,
    private reseñaService: ReseñaService,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenLayoutRoutes = [
          '/login',
          '/registro',
          '/perfil',
          '/checkout',
          '/admin/panel',
          '/admin/lista-destinos',
          '/admin/destinos',
          '/admin/reservas',
          '/admin/usuarios',
          '/destinos',
          '/destino',
          '/detalle-destino',
          '/nosotros',



        ];
        this.showLayout = !hiddenLayoutRoutes.some((route) =>
          event.urlAfterRedirects.startsWith(route)
        );
      });
  }

  ngOnInit(): void {
    // Solo verificar si hay reservas pendientes cuando el usuario está autenticado
    this.authService.autenticado$.subscribe((isAuthenticated) => {
      if (isAuthenticated && !this.modalYaMostrado) {
        this.verificarReservasPendientes();
      }
    });
  }

  private puedeConsultarEndpoint(): boolean {
    const cooldownStr = localStorage.getItem(this.MODAL_COOLDOWN_KEY);

    if (!cooldownStr) {
      return true;
    }

    const cooldownTime = new Date(cooldownStr);
    const now = new Date();
    const diffMinutes = (now.getTime() - cooldownTime.getTime()) / (1000 * 60);

    return diffMinutes >= this.COOLDOWN_MINUTES;
  }

  verificarReservasPendientes(): void {
    // Verificar si puede consultar el endpoint
    if (!this.puedeConsultarEndpoint()) {
      console.log('⏳ Modal en cooldown, no se consultará el endpoint');
      return;
    }

    this.reseñaService.getReservasPendientesReseña().subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          // Mostrar modal con la primera reserva pendiente
          this.reservaPendiente = response.data[0];
          this.showModalResena = true;
          this.modalYaMostrado = true;
        }
      },
      error: (error) => {
        console.error('Error verificando reservas pendientes:', error);
      },
    });
  }

  cerrarModalResena(): void {
    // Guardar timestamp actual en localStorage
    const now = new Date();
    localStorage.setItem(this.MODAL_COOLDOWN_KEY, now.toISOString());
    console.log(
      '⏰ Cooldown activado hasta:',
      new Date(now.getTime() + this.COOLDOWN_MINUTES * 60000)
    );

    this.showModalResena = false;
    this.reservaPendiente = null;
  }

  onResenaCreada(): void {
    console.log('✅ Reseña creada exitosamente');
    // Verificar si hay más reservas pendientes
    this.modalYaMostrado = false;
    this.verificarReservasPendientes();
  }
}
