import { Component, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('viajar-app');
  showLayout = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenLayoutRoutes = [
          '/login',
          '/registro',
          '/admin/panel',
          '/admin/destinos',
          '/admin/reservas',
          '/admin/usuarios',
        ];
        this.showLayout = !hiddenLayoutRoutes.includes(event.urlAfterRedirects);
      });
  }
}
