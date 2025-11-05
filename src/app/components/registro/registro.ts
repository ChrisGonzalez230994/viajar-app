import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit {
  registroForm: FormGroup;
  registroError: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  private passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  maxDate: string = new Date().toISOString().split('T')[0];

  private edadMinimaValidator(edadMinima: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        const edadAjustada = edad - 1;
        return edadAjustada < edadMinima ? { 'edadMinima': { min: edadMinima, actual: edadAjustada } } : null;
      }

      return edad < edadMinima ? { 'edadMinima': { min: edadMinima, actual: edad } } : null;
    };
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.passwordPattern)
      ]],
      confirmPassword: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      nacionalidad: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, this.edadMinimaValidator(18)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/']);
    }
  }

  onRegistro(): void {
    if (this.registroForm.valid) {
      this.registroError = false;
      this.authService.registro(this.registroForm.value).subscribe({
        next: (usuario) => {
          console.log('Registro exitoso:', usuario);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          this.registroError = true;
          
          switch(error.message) {
            case 'USERNAME_TAKEN':
              this.errorMessage = 'El nombre de usuario ya existe. Por favor, elija otro.';
              break;
            case 'EMAIL_TAKEN':
              this.errorMessage = 'El email ya está registrado.';
              break;
            case 'INVALID_DATA':
              this.errorMessage = 'Por favor, complete todos los campos correctamente.';
              break;
            default:
              this.errorMessage = 'Error al registrar el usuario. Por favor, intente nuevamente.';
          }
          if (error.message === 'USERNAME_TAKEN') {
            this.registroForm.get('username')?.setErrors({ 'usernameTaken': true });
          } else if (error.message === 'EMAIL_TAKEN') {
            this.registroForm.get('email')?.setErrors({ 'emailTaken': true });
          }
        }
      });
    } else {
      this.registroError = true;
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      Object.keys(this.registroForm.controls).forEach(key => {
        const control = this.registroForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
