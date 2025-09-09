import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './me.html',
  styleUrls: ['./me.scss']
})
export class MeComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = true;
  errorMessage = '';
  isLoggingOut = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando usuario:', error);
          this.errorMessage = 'Error cargando información del usuario';
          this.isLoading = false;
        }
      });

    // Cargar datos del usuario si no están disponibles
    if (!this.user) {
      this.loadUserProfile();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadUserProfile(): void {
    this.authService.loadCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando perfil:', error);
          this.errorMessage = 'Error cargando el perfil';
          this.isLoading = false;
        }
      });
  }

  logout(): void {
    this.isLoggingOut = true;
    
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Logout exitoso');
          // AuthService ya redirige al login
        },
        error: (error) => {
          console.error('Error en logout:', error);
          // Aunque falle, redirigir al login
          this.router.navigate(['/login']);
        },
        complete: () => {
          this.isLoggingOut = false;
        }
      });
  }

  getRoleBadgeClass(): string {
    if (!this.user?.role) return 'role-visitante';
    
    const roleLevel = this.user.role.level;
    if (roleLevel >= 5) return 'role-admin';
    if (roleLevel >= 4) return 'role-editor';
    if (roleLevel >= 3) return 'role-colaborador';
    if (roleLevel >= 2) return 'role-voluntario';
    return 'role-visitante';
  }

  getRoleDisplayName(): string {
    return this.user?.role?.name || 'Sin rol';
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const first = this.user.first_name?.charAt(0) || '';
    const last = this.user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || this.user.username?.charAt(0).toUpperCase() || 'U';
  }
}