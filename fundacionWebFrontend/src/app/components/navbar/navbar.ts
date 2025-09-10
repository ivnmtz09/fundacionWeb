import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isUserMenuOpen = false;
  isLoggedIn = false;
  isScrolled = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isLoggedIn = isAuth;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Detectar scroll para cambiar apariencia del navbar
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  // Cerrar menús al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbar = target.closest('.navbar');
    
    if (!navbar) {
      this.closeMenus();
    }
  }

  // Toggle main mobile menu
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isUserMenuOpen = false; // Close user menu when opening main menu
    
    // Add/remove class to body to prevent scrolling
    if (this.isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  // Toggle user dropdown menu
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isMenuOpen = false; // Close main menu when opening user menu
  }

  // Close main menu
  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.classList.remove('menu-open');
  }

  // Close user menu
  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  // Close all menus
  closeMenus(): void {
    this.isMenuOpen = false;
    this.isUserMenuOpen = false;
    document.body.classList.remove('menu-open');
  }

  // Logout functionality
  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Logout exitoso');
          this.closeMenus();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error en logout:', error);
          // Even if there's an error, close menus and redirect
          this.closeMenus();
          this.router.navigate(['/home']);
        }
      });
  }

  // Navigation helpers
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMenus();
  }

  // Scroll to section (for single page navigation)
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    this.closeMenus();
  }

  // Get user info for display
  getUserDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      return user.first_name || user.username || 'Usuario';
    }
    return 'Usuario';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role?.name || 'Sin rol';
  }

  // Check if current route is active
  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}