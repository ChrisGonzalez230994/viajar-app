import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth-service';
import { UbButtonDirective } from '@/components/ui/button';
import { UbCardDirective, UbCardContentDirective } from '@/components/ui/card';
import { UbInputDirective } from '@/components/ui/input';
import { DestinationCard } from '../destination-card/destination-card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UbButtonDirective,
    UbCardDirective,
    UbCardContentDirective,
    UbInputDirective,
    DestinationCard,
  ],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userName: string | null = null;

  // Propiedades para el buscador
  searchDestination: string = '';
  checkInDate: string = '';
  checkOutDate: string = '';

  private subs: Subscription[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(this.auth.autenticado$.subscribe((v) => (this.isAuthenticated = !!v)));
    this.subs.push(this.auth.userName$.subscribe((n) => (this.userName = n)));
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  logout() {
    this.auth.logout();
  }

  // Mostrar botón cuando el scroll sea mayor a 300px
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
      if (window.pageYOffset > 300) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método para manejar la búsqueda
  onSearch() {
    console.log('Búsqueda iniciada:', {
      destination: this.searchDestination,
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
    });

    // Aquí puedes navegar a la página de resultados o hacer la búsqueda
    if (this.searchDestination || this.checkInDate || this.checkOutDate) {
      // Ejemplo: navegar a una ruta de búsqueda
      // this.router.navigate(['/buscar'], {
      //   queryParams: {
      //     destino: this.searchDestination,
      //     desde: this.checkInDate,
      //     hasta: this.checkOutDate
      //   }
      // });

      // Por ahora, scrollear a destinos
      const destinosSection = document.getElementById('destinos');
      if (destinosSection) {
        destinosSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
