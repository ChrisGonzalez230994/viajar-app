import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Comment {
  _id: string;
  usuario: {
    _id: string;
    nombre: string;
  };
  calificacion: number;
  comentario: string;
  imagenes?: string[];
  likes: number;
  verificada: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-comments',
  standalone: false,
  templateUrl: './comments.html',
  styleUrl: './comments.scss',
})
export class Comments implements OnInit {
  @Input() destinoId: string = '';

  comments: Comment[] = [];
  isLoading: boolean = false;
  averageRating: number = 0;
  totalReviews: number = 0;
  hasMore: boolean = false;
  page: number = 1;
  limit: number = 5;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.destinoId) {
      this.loadComments();
    }
  }

  loadComments() {
    this.isLoading = true;
    const url = `${environment.apiUrl}/resenas/destino/${this.destinoId}?page=${this.page}&limit=${this.limit}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.comments = [...this.comments, ...response.data];
          this.averageRating = response.estadísticas?.promedio || 0;
          this.totalReviews = response.estadísticas?.total || 0;
          this.hasMore = response.pagination.page < response.pagination.totalPages;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
        this.isLoading = false;
      },
    });
  }

  loadMore() {
    this.page++;
    this.loadComments();
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('star full');
    }

    if (hasHalfStar) {
      stars.push('star half');
    }

    while (stars.length < 5) {
      stars.push('star empty');
    }

    return stars;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  likeComment(comment: Comment) {
    // Implementar la lógica de like si existe el endpoint
    console.log('Like comment:', comment._id);
  }
}
