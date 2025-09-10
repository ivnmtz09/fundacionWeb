import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'Fundación Guajira en Acción';
  currentYear = new Date().getFullYear();
  currentRoute = '';
  private destroy$ = new Subject<void>();

  // Rutas donde NO se debe mostrar el navbar
  private noNavbarRoutes = ['/login', '/register'];
  
  // Rutas donde se debe mostrar el footer
  private footerRoutes = ['/home', '/about', '/contact', '/programs'];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios de ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Determinar si se debe mostrar el navbar
   */
  shouldShowNavbar(): boolean {
    // No mostrar en rutas de autenticación
    if (this.noNavbarRoutes.some(route => this.currentRoute.startsWith(route))) {
      return false;
    }
    
    // Mostrar en todas las demás rutas
    return true;
  }

  /**
   * Determinar si se debe mostrar el footer
   */
  shouldShowFooter(): boolean {
    return this.footerRoutes.includes(this.currentRoute) || this.currentRoute === '/';
  }
}