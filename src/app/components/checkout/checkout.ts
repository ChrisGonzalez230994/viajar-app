import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DestinoService } from '../../service/destino';
import { AuthService } from '../../service/auth-service';
import { ReservaService } from '../../service/reserva.service';
import { Destino } from '../../models/destino';

interface Amenity {
  id: string;
  nombre: string;
  precio: number;
  icon: string;
}

interface Asiento {
  numero: string;
  disponible: boolean;
  seleccionado: boolean;
}

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  destino: Destino | null = null;
  isLoading: boolean = true;
  isAuthenticated: boolean = false;

  // Forms
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  checkoutForm!: FormGroup;

  // UI State
  showLogin: boolean = true;
  currentStep: number = 1;
  asientosValidationAttempted: boolean = false;

  // Checkout data
  numeroPasajeros: number = 1;
  fechaInicio: string = '';
  fechaFin: string = '';
  asientos: Asiento[] = []; // Planta Alta
  asientosPlantaBaja: Asiento[] = [];
  asientosSeleccionados: string[] = [];

  // Amenities disponibles
  amenities: Amenity[] = [
    { id: 'wifi', nombre: 'WiFi Premium', precio: 50, icon: '📶' },
    { id: 'desayuno', nombre: 'Desayuno incluido', precio: 150, icon: '🍳' },
    { id: 'spa', nombre: 'Acceso a SPA', precio: 300, icon: '💆' },
    { id: 'traslado', nombre: 'Traslado aeropuerto', precio: 200, icon: '🚗' },
    { id: 'guia', nombre: 'Guía turístico', precio: 250, icon: '🗺️' },
    { id: 'seguro', nombre: 'Seguro de viaje', precio: 180, icon: '🛡️' },
  ];
  amenitiesSeleccionadas: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private destinoService: DestinoService,
    private authService: AuthService,
    private reservaService: ReservaService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadDestino();
    this.generarAsientos();
  }

  initForms(): void {
    // Login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Register form
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', Validators.required],
    });

    // Checkout form
    this.checkoutForm = this.fb.group({
      numeroPasajeros: [1, [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      nombreContacto: ['', Validators.required],
      emailContacto: ['', [Validators.required, Validators.email]],
      telefonoContacto: ['', Validators.required],
      documentoIdentidad: ['', Validators.required],
      paisResidencia: ['', Validators.required],
      ciudadResidencia: ['', Validators.required],
      solicitudesEspeciales: [''],
    });
  }

  checkAuthentication(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.currentStep = 2;
      this.loadUserData();
    }
  }

  loadUserData(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.checkoutForm.patchValue({
          nombreContacto: user.nombre || '',
          emailContacto: user.email || '',
          telefonoContacto: user.phone || '',
          documentoIdentidad: user.identificacion || '',
          paisResidencia: user.nacionalidad || '',
          ciudadResidencia: user.ciudad || '',
        });
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    }
  }

  loadDestino(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/destinos']);
      return;
    }

    this.destinoService.getDestinoById(id).subscribe({
      next: (response: any) => {
        this.destino = response.data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error cargando destino:', error);
        this.isLoading = false;
        this.router.navigate(['/destinos']);
      },
    });
  }

  generarAsientos(): void {
    const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const columnas = [1, 2, 3, 4]; // 2-2 layout

    // Planta Alta
    this.asientos = [];
    filas.forEach((fila) => {
      columnas.forEach((col) => {
        this.asientos.push({
          numero: `PA-${fila}${col}`,
          disponible: Math.random() > 0.3, // 70% disponibles
          seleccionado: false,
        });
      });
    });

    // Planta Baja
    this.asientosPlantaBaja = [];
    filas.forEach((fila) => {
      columnas.forEach((col) => {
        this.asientosPlantaBaja.push({
          numero: `PB-${fila}${col}`,
          disponible: Math.random() > 0.3, // 70% disponibles
          seleccionado: false,
        });
      });
    });
  }

  // Auth methods
  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.currentStep = 2;
      },
      error: (error: any) => {
        console.error('Error en login:', error);
        alert('Error al iniciar sesión. Verifica tus credenciales.');
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    this.authService.registro(this.registerForm.value).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.showLogin = true;
      },
      error: (error: any) => {
        console.error('Error en registro:', error);
        alert('Error al registrarse. Intenta nuevamente.');
      },
    });
  }

  toggleAuthMode(): void {
    this.showLogin = !this.showLogin;
  }

  // Asientos methods
  toggleAsiento(asiento: Asiento): void {
    if (!asiento.disponible) return;

    const maxAsientos = this.checkoutForm.get('numeroPasajeros')?.value || 1;

    if (asiento.seleccionado) {
      asiento.seleccionado = false;
      this.asientosSeleccionados = this.asientosSeleccionados.filter((a) => a !== asiento.numero);
    } else {
      if (this.asientosSeleccionados.length < maxAsientos) {
        asiento.seleccionado = true;
        this.asientosSeleccionados.push(asiento.numero);

        // Si se completan todos los asientos, ocultar mensaje de error
        if (this.asientosSeleccionados.length === maxAsientos) {
          this.asientosValidationAttempted = false;
        }
      } else {
        alert(`Solo puedes seleccionar ${maxAsientos} asiento(s)`);
      }
    }
  }

  onNumeroPasajerosChange(): void {
    const maxAsientos = this.checkoutForm.get('numeroPasajeros')?.value || 1;

    // Si hay más asientos seleccionados que el nuevo límite, deseleccionar los últimos
    while (this.asientosSeleccionados.length > maxAsientos) {
      const asientoRemover = this.asientosSeleccionados.pop();
      const asiento = this.asientos.find((a) => a.numero === asientoRemover);
      if (asiento) {
        asiento.seleccionado = false;
      }
    }
  }

  // Amenities methods
  toggleAmenity(amenityId: string): void {
    const index = this.amenitiesSeleccionadas.indexOf(amenityId);
    if (index > -1) {
      this.amenitiesSeleccionadas.splice(index, 1);
    } else {
      this.amenitiesSeleccionadas.push(amenityId);
    }
  }

  isAmenitySelected(amenityId: string): boolean {
    return this.amenitiesSeleccionadas.includes(amenityId);
  }

  // Cálculos
  calcularPrecioAmenities(): number {
    return this.amenitiesSeleccionadas.reduce((total, amenityId) => {
      const amenity = this.amenities.find((a) => a.id === amenityId);
      return total + (amenity?.precio || 0);
    }, 0);
  }

  calcularPrecioTotal(): number {
    if (!this.destino) return 0;

    const numeroPasajeros = this.checkoutForm.get('numeroPasajeros')?.value || 1;
    const precioBase = this.destino.precio * numeroPasajeros;
    const precioAmenities = this.calcularPrecioAmenities();

    return precioBase + precioAmenities;
  }

  calcularDiasEstancia(): number {
    const fechaInicio = this.checkoutForm.get('fechaInicio')?.value;
    const fechaFin = this.checkoutForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin) return 0;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Navegación
  nextStep(): void {
    if (this.currentStep === 1 && !this.isAuthenticated) {
      alert('Debes iniciar sesión para continuar');
      return;
    }

    if (this.currentStep === 2) {
      // Validar asientos primero
      const numeroPasajeros = this.checkoutForm.get('numeroPasajeros')?.value;
      const asientosFaltantes = this.asientosSeleccionados.length !== numeroPasajeros;

      // Validar formulario de checkout
      const formularioInvalido = this.checkoutForm.invalid;

      if (formularioInvalido) {
        // Marcar todos los campos como touched para mostrar errores
        Object.keys(this.checkoutForm.controls).forEach((key) => {
          this.checkoutForm.get(key)?.markAsTouched();
        });
      }

      if (asientosFaltantes) {
        this.asientosValidationAttempted = true;
      }

      // Si hay errores, mostrar alert y detener
      if (formularioInvalido || asientosFaltantes) {
        return;
      }

      // Reset validation flag on successful validation
      this.asientosValidationAttempted = false;
    }

    this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Confirmar reserva
  confirmarReserva(): void {
    if (this.checkoutForm.invalid || !this.destino) {
      alert('Por favor completa todos los campos');
      return;
    }

    const formValues = this.checkoutForm.value;
    const reservaData = {
      destinoId: this.destino._id!,
      fechaInicio: formValues.fechaInicio,
      fechaFin: formValues.fechaFin,
      numeroPersonas: formValues.numeroPasajeros,
      notas: `
        Asientos: ${this.asientosSeleccionados.join(', ')}
        Amenities: ${this.amenitiesSeleccionadas.join(', ')}
        Solicitudes especiales: ${formValues.solicitudesEspeciales || 'Ninguna'}
      `,
    };

    this.reservaService.createReserva(reservaData).subscribe({
      next: (response: any) => {
        alert('¡Reserva confirmada exitosamente!');
        this.router.navigate(['/perfil']);
      },
      error: (error: any) => {
        console.error('Error creando reserva:', error);
        alert('Error al confirmar la reserva. Intenta nuevamente.');
      },
    });
  }

  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-ES')}`;
  }
}
