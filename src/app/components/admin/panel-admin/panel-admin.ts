import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface AdminCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-panel-admin',
  standalone: false,
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.scss',
})
export class PanelAdmin implements OnInit {
  usuario: any = null;
  adminCards: AdminCard[] = [
    {
      title: 'Gestión de Destinos',
      description: 'Crear, editar y eliminar destinos turísticos',
      icon: '🌍',
      route: '/admin/destinos',
      color: 'blue',
    },
    {
      title: 'Gestión de Reservas',
      description: 'Ver y administrar todas las reservas de usuarios',
      icon: '📅',
      route: '/admin/reservas',
      color: 'green',
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Mini CRM para administrar usuarios del sistema',
      icon: '👥',
      route: '/admin/usuarios',
      color: 'purple',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        this.usuario = JSON.parse(userString);
        const isAdmin = this.usuario.rol === 'admin' || this.usuario.role === 'admin';
        if (!isAdmin) {
          alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
          this.router.navigate(['/']);
        }
      } catch (e) {
        console.error('Error al parsear usuario:', e);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
