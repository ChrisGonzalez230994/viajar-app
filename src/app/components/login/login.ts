import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  loginFailed: boolean = false;
  returnUrl: string = '/';


  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.authService.estaAutenticado()) {
      const confirmar = confirm('Ya hay una sesión activa. ¿Querés cerrarla e iniciar con otra cuenta?');
      if (!confirmar) {
        this.router.navigate(['/']); // Redirigí a donde prefieras
        return;
      }
  
      this.authService.logout();
    }
  }
  onLogin() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    const rutaDestino = localStorage.getItem('rutaPostLogin') || '/';
    
    
    this.authService.login(email, password).subscribe(
      (usuario: Usuario | null) => {
        if (usuario) {
          console.log('Login exitoso:', usuario);
          this.authService.setUserName(usuario.nombre);
          //this.router.navigate(['/']); 
          localStorage.removeItem('rutaPostLogin');
         
          this.router.navigate([rutaDestino]);
          this.loginFailed = false;
        } else {
          console.log('Credenciales incorrectas');
          this.loginFailed = true;
        }
      },
      (error) => {
        console.error('Error en el login:', error);
        this.loginFailed = true;
      }
    );
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }
}
