import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reserva-form',
  standalone: false,
  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.scss',
})
export class ReservaForm {
  idPaquete: number;
  form: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.idPaquete = Number(this.route.snapshot.paramMap.get('idPaquete'));

    // Initialize the form after FormBuilder is available
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      fecha: ['', Validators.required],
      cantidadPersonas: [1, Validators.required]
    });
  }

  crearReserva() {
    if (this.form.invalid) return;

    console.log('Reserva creada:', {
      paqueteId: this.idPaquete,
      ...this.form.value
    });
  }
}