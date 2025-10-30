import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss']
})
export class LandingComponent {

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
