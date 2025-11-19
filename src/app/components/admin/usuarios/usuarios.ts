import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../service/usuario.service';

interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username?: string;
  rol: string;
  nacionalidad: string;
  fechaNacimiento?: string;
  createdAt: string;
  confirmed: boolean;
  phone?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  searchTerm: string = '';
  filtroRol: string = 'todos';
  filtroEstado: string = 'todos';

  // Modal controls
  showDeleteModal: boolean = false;
  showDetailsModal: boolean = false;
  usuarioSeleccionado: Usuario | null = null;

  loading: boolean = false;

  constructor(private router: Router, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.usuarios = response.data;
          this.usuariosFiltrados = [...this.usuarios];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        alert('Error al cargar los usuarios');
        this.loading = false;
      },
    });
  }

  buscarUsuarios(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      const matchSearch =
        this.searchTerm === '' ||
        usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchRol = this.filtroRol === 'todos' || usuario.rol === this.filtroRol;

      const estadoUsuario = usuario.confirmed ? 'activo' : 'inactivo';
      const matchEstado = this.filtroEstado === 'todos' || estadoUsuario === this.filtroEstado;

      return matchSearch && matchRol && matchEstado;
    });
  }

  cambiarRol(usuario: Usuario): void {
    const nuevoRol = usuario.rol === 'admin' ? 'user' : 'admin';

    this.usuarioService.cambiarRol(usuario._id, nuevoRol).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          usuario.rol = nuevoRol;
          console.log(`Rol actualizado correctamente a ${nuevoRol}`);
        }
      },
      error: (error) => {
        console.error('Error cambiando rol:', error);
      },
    });
  }

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = !usuario.confirmed;
    const estadoTexto = nuevoEstado ? 'activo' : 'inactivo';

    this.usuarioService.cambiarEstado(usuario._id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          usuario.confirmed = nuevoEstado;
          console.log(`Usuario ${estadoTexto} correctamente`);
        }
      },
      error: (error) => {
        console.error('Error cambiando estado:', error);
      },
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.showDeleteModal = true;
  }

  confirmarEliminacion(): void {
    if (!this.usuarioSeleccionado) return;

    this.usuarioService.eliminarUsuario(this.usuarioSeleccionado._id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.usuarios = this.usuarios.filter((u) => u._id !== this.usuarioSeleccionado!._id);
          this.aplicarFiltros();
          this.cerrarModalEliminar();
          console.log('Usuario eliminado correctamente');
        }
      },
      error: (error) => {
        console.error('Error eliminando usuario:', error);
        this.cerrarModalEliminar();
      },
    });
  }

  cerrarModalEliminar(): void {
    this.showDeleteModal = false;
    this.usuarioSeleccionado = null;
  }

  verDetalles(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.showDetailsModal = true;
  }

  cerrarModalDetalles(): void {
    this.showDetailsModal = false;
    this.usuarioSeleccionado = null;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  volverPanel(): void {
    this.router.navigate(['/admin/panel']);
  }
}
