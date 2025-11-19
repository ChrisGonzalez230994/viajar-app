import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DestinoService } from '../../../service/destino';
import { Destino } from '../../../models/destino';

@Component({
  selector: 'app-form-destino',
  standalone: false,
  templateUrl: './form-destino.html',
  styleUrl: './form-destino.scss',
})
export class FormDestino implements OnInit {
  destinoForm: FormGroup;
  imagenes: string[] = [];
  actividades: string[] = [];
  nuevaImagen: string = '';
  nuevaActividad: string = '';
  modoEdicion: boolean = false;
  destinoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private destinoService: DestinoService,
    private router: Router
  ) {
    this.destinoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: ['', [Validators.required, Validators.minLength(2)]],
      pais: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      imagenPrincipal: ['', Validators.required],
      capacidadMaxima: [10, [Validators.required, Validators.min(1)]],
      disponibilidad: [true],
      ubicacion: this.fb.group({
        latitud: [0],
        longitud: [0],
        direccion: [''],
      }),
    });
  }

  ngOnInit(): void {}

  get nombre() {
    return this.destinoForm.get('nombre');
  }
  get ciudad() {
    return this.destinoForm.get('ciudad');
  }
  get pais() {
    return this.destinoForm.get('pais');
  }
  get descripcion() {
    return this.destinoForm.get('descripcion');
  }
  get precio() {
    return this.destinoForm.get('precio');
  }
  get imagenPrincipal() {
    return this.destinoForm.get('imagenPrincipal');
  }

  agregarImagen(): void {
    if (this.nuevaImagen.trim()) {
      this.imagenes.push(this.nuevaImagen.trim());
      this.nuevaImagen = '';
    }
  }

  eliminarImagen(index: number): void {
    this.imagenes.splice(index, 1);
  }

  agregarActividad(): void {
    if (this.nuevaActividad.trim()) {
      this.actividades.push(this.nuevaActividad.trim());
      this.nuevaActividad = '';
    }
  }

  eliminarActividad(index: number): void {
    this.actividades.splice(index, 1);
  }

  onSubmit(): void {
    if (this.destinoForm.invalid) {
      Object.keys(this.destinoForm.controls).forEach((key) => {
        this.destinoForm.get(key)?.markAsTouched();
      });
      return;
    }

    const destinoData: any = {
      ...this.destinoForm.value,
      imagenes: this.imagenes,
      actividades: this.actividades,
    };

    if (this.modoEdicion && this.destinoId) {
      this.destinoService.updateDestino(this.destinoId, destinoData).subscribe({
        next: (response) => {
          console.log('Destino actualizado:', response);
          alert('Destino actualizado exitosamente');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error al actualizar destino:', error);
          alert('Error al actualizar el destino');
        },
      });
    } else {
      this.destinoService.createDestino(destinoData).subscribe({
        next: (response) => {
          console.log('Destino creado:', response);
          alert('Destino creado exitosamente');
          this.limpiarFormulario();
        },
        error: (error) => {
          console.error('Error al crear destino:', error);
          alert('Error al crear el destino');
        },
      });
    }
  }

  limpiarFormulario(): void {
    this.destinoForm.reset({
      disponibilidad: true,
      precio: 0,
      capacidadMaxima: 10,
      ubicacion: { latitud: 0, longitud: 0, direccion: '' },
    });
    this.imagenes = [];
    this.actividades = [];
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }
}
