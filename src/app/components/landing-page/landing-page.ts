import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth-service';
import { DestinoService } from '../../service/destino';
import { ResultadoBusqueda } from '../../models/busqueda';
import { Destino } from '../../models/destino';
import { UbButtonDirective } from '@/components/ui/button';
import { UbCardDirective, UbCardContentDirective } from '@/components/ui/card';
import { UbInputDirective } from '@/components/ui/input';
import { UbLabelDirective } from '@/components/ui/label';
import { UbSeparatorDirective } from '@/components/ui/separator';
import { UbBadgeDirective } from '@/components/ui/badge';
import { UbSelectDirective } from '@/components/ui/select';
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
    UbLabelDirective,
    UbSeparatorDirective,
    UbBadgeDirective,
    UbSelectDirective,
    DestinationCard,
  ],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userName: string | null = null;

  // Búsqueda inteligente
  searchQuery: string = '';
  searchResults: ResultadoBusqueda[] = [];
  isSearching: boolean = false;
  searchError: string = '';
  showResults: boolean = false;

  // Filtros
  selectedTipoViaje: string = '';
  precioMax: number | null = null;

  // Destinos destacados
  destinosDestacados: Destino[] = [];
  isLoadingDestacados: boolean = false;

  // Tipos de viaje
  tiposViaje: Array<{ tipo: string; descripcion: string; keywords: string[] }> = [];

  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private destinoService: DestinoService
  ) {}

  ngOnInit(): void {
    this.subs.push(this.auth.autenticado$.subscribe((v) => (this.isAuthenticated = !!v)));
    this.subs.push(this.auth.userName$.subscribe((n) => (this.userName = n)));
    this.loadDestacados();
    this.loadTiposViaje();
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

  loadDestacados(): void {
    this.isLoadingDestacados = true;
    this.destinoService.getDestinosDestacados(6).subscribe({
      next: (response) => {
        this.destinosDestacados = response.data;
        this.isLoadingDestacados = false;
      },
      error: (error) => {
        console.error('Error cargando destacados:', error);
        this.isLoadingDestacados = false;
      },
    });
  }

  loadTiposViaje(): void {
    this.destinoService.getTiposViaje().subscribe({
      next: (response) => {
        this.tiposViaje = response.data;
      },
      error: (error) => {
        console.error('Error cargando tipos de viaje:', error);
      },
    });
  }

  buscarDestinos(): void {
    if (!this.searchQuery.trim()) {
      this.searchError = 'Por favor ingresa lo que buscas';
      return;
    }

    this.isSearching = true;
    this.searchError = '';

    const filtros = {
      query: this.searchQuery,
      tipoViaje: this.selectedTipoViaje || undefined,
      precioMax: this.precioMax || undefined,
      limit: 10,
    };

    this.destinoService.busquedaSemantica(filtros).subscribe({
      next: (response) => {
        this.searchResults = response.data;
        this.isSearching = false;
        this.showResults = true;

        if (this.searchResults.length === 0) {
          this.searchError = 'No se encontraron destinos que coincidan con tu búsqueda';
        }
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.searchError = 'Error al realizar la búsqueda. Intenta de nuevo.';
        this.isSearching = false;
      },
    });
  }

  verTodosLosResultados(): void {
    localStorage.setItem(
      'lastSearch',
      JSON.stringify({
        query: this.searchQuery,
        tipoViaje: this.selectedTipoViaje,
        precioMax: this.precioMax,
      })
    );
    this.router.navigate(['/destinos']);
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.selectedTipoViaje = '';
    this.precioMax = null;
    this.searchResults = [];
    this.searchError = '';
    this.showResults = false;
  }

  verDetalle(destinoId: string): void {
    console.log('Ver detalle:', destinoId);
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-ES')}`;
  }

  getRelevanceClass(relevance: number): string {
    if (relevance >= 80) return 'high-relevance';
    if (relevance >= 60) return 'medium-relevance';
    return 'low-relevance';
  }

  // Método para manejar la búsqueda
  onSearch() {
    this.buscarDestinos();
  }
}
