import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReseñaService } from '../../service/reseña.service';

@Component({
  selector: 'app-modal-resena',
  standalone: false,
  templateUrl: './modal-resena.html',
  styleUrl: './modal-resena.scss',
})
export class ModalResena {
  @Input() destinoNombre: string = '';
  @Input() destinoId: string = '';
  @Input() reservaId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() reseñaCreada = new EventEmitter<void>();

  resenaForm: FormGroup;
  isSubmitting: boolean = false;
  error: string = '';
  calificacionHover: number = 0;

  constructor(private fb: FormBuilder, private reseñaService: ReseñaService) {
    this.resenaForm = this.fb.group({
      calificacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  setCalificacion(calificacion: number): void {
    this.resenaForm.patchValue({ calificacion });
  }

  setHover(calificacion: number): void {
    this.calificacionHover = calificacion;
  }

  clearHover(): void {
    this.calificacionHover = 0;
  }

  getStarClass(index: number): string {
    const calificacion = this.resenaForm.get('calificacion')?.value || 0;
    const hover = this.calificacionHover;

    if (hover >= index) {
      return 'star-filled';
    } else if (calificacion >= index) {
      return 'star-filled';
    }
    return 'star-empty';
  }

  onSubmit(): void {
    if (this.resenaForm.invalid) {
      this.resenaForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const reseña = {
      destino: this.destinoId,
      reserva: this.reservaId,
      calificacion: this.resenaForm.get('calificacion')?.value,
      comentario: this.resenaForm.get('comentario')?.value,
    };

    this.reseñaService.createReseña(reseña).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.reseñaCreada.emit();
        this.cerrar();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear la reseña';
        this.isSubmitting = false;
      },
    });
  }

  cerrar(): void {
    this.close.emit();
  }

  get calificacionValue(): number {
    return this.resenaForm.get('calificacion')?.value || 0;
  }

  get comentarioInvalid(): boolean {
    const control = this.resenaForm.get('comentario');
    return !!(control && control.invalid && control.touched);
  }

  get comentarioLength(): number {
    return this.resenaForm.get('comentario')?.value?.length || 0;
  }
}
