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
  ubicacionQuery: string = '';
  precioMax: number | null = null;
  precioMin: number | null = null;
  selectedPais: string = '';
  selectedCiudad: string = '';
  calificacionMin: number | null = null;
  selectedTipoViaje: string = '';

  // Tipos de viaje
  tiposViaje: Array<{ id: string; nombre: string; descripcion: string; keywords: string[] }> = [];

  // Sidebar
  isSidebarOpen: boolean = true;

  private isFirstLoad: boolean = true;

  constructor(private destinoService: DestinoService, private router: Router) {}

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
      this.ubicacionQuery = filters.ubicacion || '';
      this.precioMax = filters.precioMax || null;
      this.selectedPais = filters.pais || '';
      this.selectedCiudad = filters.ciudad || '';
      this.selectedTipoViaje = filters.tipoViaje || '';

      // Limpiar localStorage después de leer para evitar que se aplique en futuras navegaciones
      localStorage.removeItem('lastSearch');

      // Ejecutar búsqueda automáticamente si hay filtro de tipo de viaje
      if (this.selectedTipoViaje) {
        this.filtrarPorTipoViaje();
      } else {
        this.buscarDestinos();
      }
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
      precioMin: this.precioMin || undefined,
      precioMax: this.precioMax || undefined,
      pais: this.ubicacionQuery || this.selectedPais || undefined,
      ciudad: this.ubicacionQuery || this.selectedCiudad || undefined,
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
   * Filtrar destinos por tipo de viaje
   */
  filtrarPorTipoViaje(): void {
    this.isLoading = true;
    this.searchError = '';

    this.destinoService.getDestinos({ limit: 50 }).subscribe({
      next: (response: any) => {
        // Filtrar destinos que tengan el tipo de viaje seleccionado
        const destinosFiltrados = response.data.filter((destino: any) => {
          const tieneTipo = destino.tipoViaje && destino.tipoViaje.includes(this.selectedTipoViaje);

          return tieneTipo;
        });

        this.destinos = destinosFiltrados.map((destino: any) => ({
          destinoId: destino._id,
          nombre: destino.nombre,
          ciudad: destino.ciudad,
          pais: destino.pais,
          precio: destino.precio,
          tipoViaje: destino.tipoViaje || [],
          calificacionPromedio: destino.calificacionPromedio || 0,
          imagenPrincipal: destino.imagenPrincipal,
          score: 1,
          relevance: 100,
        }));

        this.isLoading = false;

        if (this.destinos.length === 0) {
          this.searchError = `No se encontraron destinos de tipo "${this.selectedTipoViaje}"`;
        }
      },
      error: (error: any) => {
        console.error('❌ Error filtrando destinos:', error);
        this.searchError = 'Error al filtrar los destinos';
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
          destinoId: destino._id,
          nombre: destino.nombre,
          ciudad: destino.ciudad,
          pais: destino.pais,
          precio: destino.precio,
          tipoViaje: destino.tipoViaje || [],
          calificacionPromedio: destino.calificacionPromedio || 0,
          imagenPrincipal: destino.imagenPrincipal,
          score: 1,
          relevance: 100,
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
    this.ubicacionQuery = '';
    this.precioMin = null;
    this.precioMax = null;
    this.selectedPais = '';
    this.selectedCiudad = '';
    this.calificacionMin = null;
    this.selectedTipoViaje = '';

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
    this.router.navigate(['/detalle-destino', destinoId]);
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
