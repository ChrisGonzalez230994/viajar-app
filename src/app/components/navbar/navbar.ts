import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { Subscription } from 'rxjs';
import { UbButtonDirective } from '@/components/ui/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, UbButtonDirective],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName: string | null = null;
  private subs: Subscription[] = [];
  isScrolled = false;

  constructor(private auth: AuthService, private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollPosition > 50;
  }

  ngOnInit(): void {
    this.subs.push(this.auth.autenticado$.subscribe((v) => (this.isAuthenticated = !!v)));
    this.subs.push(this.auth.userName$.subscribe((n) => (this.userName = n)));
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
}
