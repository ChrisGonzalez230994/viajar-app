import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DestinoService } from '../../service/destino';
import { ResultadoBusqueda } from '../../models/busqueda';

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

  constructor(private destinoService: DestinoService, private router: Router) {}

  ngOnInit(): void {
    this.loadTiposViaje();
    this.loadLastSearch();
  }

  /**
   * Cargar la última búsqueda desde localStorage
   */
  loadLastSearch(): void {
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
    if (!this.searchQuery.trim()) {
      this.searchError = 'Por favor ingresa un término de búsqueda';
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
   * Limpiar todos los filtros
   */
  limpiarFiltros(): void {
    this.selectedTipoViaje = '';
    this.precioMin = null;
    this.precioMax = null;
    this.selectedPais = '';
    this.selectedCiudad = '';
    this.calificacionMin = null;

    if (this.searchQuery) {
      this.buscarDestinos();
    }
  }

  /**
   * Aplicar filtros
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
