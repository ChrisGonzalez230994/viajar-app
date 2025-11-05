
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName: string | null = null;
  private subs: Subscription[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(this.auth.autenticado$.subscribe(v => this.isAuthenticated = !!v));
    this.subs.push(this.auth.userName$.subscribe(n => this.userName = n));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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
