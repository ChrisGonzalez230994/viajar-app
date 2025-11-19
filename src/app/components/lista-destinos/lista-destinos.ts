import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DestinoService } from '../../service/destino';
import { ResultadoBusqueda } from '../../models/busqueda';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-lista-destinos',
  standalone: false,
  templateUrl: './lista-destinos.html',
  styleUrl: './lista-destinos.scss',
})
export class ListaDestinos implements OnInit {
  // Resultados
  destinos: ResultadoBusqueda[] = [];
  isLoading: boolean = false;
  searchError: string = '';

  // Filtros activos
  searchQuery: string = '';
  selectedTipoViaje: string = '';
  precioMax: number | null = null;
  precioMin: number | null = null;
  selectedPais: string = '';
  selectedCiudad: string = '';
  calificacionMin: number | null = null;

  // Tipos de viaje
  tiposViaje: Array<{ id: string; nombre: string; descripcion: string; keywords: string[] }> = [];

  // Sidebar
  isSidebarOpen: boolean = true;

  constructor(private destinoService: DestinoService, private router: Router) {
    // Detectar cuando se navega a /destinos desde el navbar
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/destinos') {
          // Si venimos de otra ruta, limpiar búsqueda y mostrar todos
          localStorage.removeItem('lastSearch');
          this.limpiarFiltros();
        }
      });
  }

  ngOnInit(): void {
    this.loadTiposViaje();
    this.checkLastSearch();
  }

  /**
   * Verificar si hay búsqueda previa o mostrar todos
   */
  checkLastSearch(): void {
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
      const filters = JSON.parse(lastSearch);
      this.searchQuery = filters.query || '';
      this.selectedTipoViaje = filters.tipoViaje || '';
      this.precioMax = filters.precioMax || null;
      this.selectedPais = filters.pais || '';
      this.selectedCiudad = filters.ciudad || '';

      // Ejecutar búsqueda automáticamente
      this.buscarDestinos();
    } else {
      // Si no hay búsqueda previa, mostrar todos los destinos
      this.cargarTodosLosDestinos();
    }
  }

  /**
   * Cargar tipos de viaje
   */
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

  /**
   * Búsqueda de destinos
   */
  buscarDestinos(): void {
    // Si el campo de búsqueda está vacío, mostrar todos los destinos
    if (!this.searchQuery.trim()) {
      this.cargarTodosLosDestinos();
      return;
    }

    this.isLoading = true;
    this.searchError = '';

    const filtros = {
      query: this.searchQuery,
      tipoViaje: this.selectedTipoViaje || undefined,
      precioMin: this.precioMin || undefined,
      precioMax: this.precioMax || undefined,
      pais: this.selectedPais || undefined,
      ciudad: this.selectedCiudad || undefined,
      calificacionMin: this.calificacionMin || undefined,
      limit: 50,
    };

    this.destinoService.busquedaSemantica(filtros).subscribe({
      next: (response) => {
        this.destinos = response.data;
        this.isLoading = false;

        if (this.destinos.length === 0) {
          this.searchError = 'No se encontraron destinos con estos filtros';
        }
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.searchError = 'Error al realizar la búsqueda';
        this.isLoading = false;
      },
    });
  }

  /**
   * Cargar todos los destinos disponibles
   */
  cargarTodosLosDestinos(): void {
    this.isLoading = true;
    this.searchError = '';

    this.destinoService.getDestinos({ limit: 50 }).subscribe({
      next: (response: any) => {
        // Convertir destinos normales a formato ResultadoBusqueda
        this.destinos = response.data.map((destino: any) => ({
          ...destino,
          relevancia: 100,
          motivoRelevancia: 'Todos los destinos disponibles',
        }));
        this.isLoading = false;

        if (this.destinos.length === 0) {
          this.searchError = 'No hay destinos disponibles';
        }
      },
      error: (error: any) => {
        console.error('Error cargando destinos:', error);
        this.searchError = 'Error al cargar los destinos';
        this.isLoading = false;
      },
    });
  }

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros(): void {
    this.searchQuery = '';
    this.selectedTipoViaje = '';
    this.precioMin = null;
    this.precioMax = null;
    this.selectedPais = '';
    this.selectedCiudad = '';
    this.calificacionMin = null;

    // Cargar todos los destinos al limpiar filtros
    this.cargarTodosLosDestinos();
  }

  /**
   * Buscar con los filtros aplicados
   */
  aplicarFiltros(): void {
    this.buscarDestinos();
  }

  /**
   * Toggle sidebar en móvil
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Ver detalle de destino
   */
  verDetalle(destinoId: string): void {
    // Implementar navegación al detalle
    console.log('Ver detalle:', destinoId);
  }

  /**
   * Volver al home
   */
  volverAlHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-ES')}`;
  }

  /**
   * Obtener clase de relevancia
   */
  getRelevanceClass(relevance: number): string {
    if (relevance >= 80) return 'high-relevance';
    if (relevance >= 60) return 'medium-relevance';
    return 'low-relevance';
  }
}
