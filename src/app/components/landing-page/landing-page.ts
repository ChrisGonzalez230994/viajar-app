import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth-service';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userName: string | null = null;

  private subs: Subscription[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(
      this.auth.autenticado$.subscribe((v) => (this.isAuthenticated = !!v))
    );
    this.subs.push(
      this.auth.userName$.subscribe((n) => (this.userName = n))
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  logout() {
    this.auth.logout();
  }

  // Mostrar botón cuando el scroll sea mayor a 300px
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
      if (window.pageYOffset > 300) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
