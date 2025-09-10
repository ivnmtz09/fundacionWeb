import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    id: number;
    name: string;
    level: number;
  };
  profile: {
    location: string;
    bio: string;
    interests: string;
    avatar: string | null;
    phone_number: string;
    address: string;
  };
  date_joined: string;
  last_login: string | null;  
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  avatar?: string | null;
  bio?: string | null;
  interests?: string | null;
  phone_number?: string | null;
  address?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/users';
  private accessTokenKey = 'access';
  private refreshTokenKey = 'refresh';
  
  // BehaviorSubject para manejar el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Si hay token al inicializar, cargar el usuario
    if (this.hasValidToken()) {
      this.loadCurrentUser().subscribe({
        error: () => this.logout() // Si falla, hacer logout
      });
    }
  }

  // Registro
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register/`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Login
  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap((response: TokenResponse) => {
        this.setTokens(response.access, response.refresh);
        this.isAuthenticatedSubject.next(true);
        
        // Cargar datos del usuario después del login
        this.loadCurrentUser().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Logout
  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      return this.http.post(`${this.apiUrl}/auth/logout/`, { 
        refresh: refreshToken 
      }).pipe(
        tap(() => this.performLogout()),
        catchError(() => {
          // Aunque falle el logout en el server, limpiamos local
          this.performLogout();
          return throwError(() => new Error('Logout failed'));
        })
      );
    } else {
      this.performLogout();
      return new Observable(observer => observer.next({}));
    }
  }

  // Cargar datos del usuario actual
  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me/`).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar perfil
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me/`, userData).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me/`).pipe(
      catchError(this.handleError)
    );
  }

  // Refresh token
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap((response: TokenResponse) => {
        this.setTokens(response.access, response.refresh);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // ======================
  // Helpers de Token
  // ======================
  private setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.accessTokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Verificar si el token no está expirado (JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role?.name || null;
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  hasMinimumRoleLevel(level: number): boolean {
    const user = this.getCurrentUser();
    return user?.role?.level ? user.role.level >= level : false;
  }

  private performLogout(): void {
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos. Verifica la información ingresada.';
          break;
        case 401:
          errorMessage = 'Credenciales incorrectas o sesión expirada.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }

      // Si es un error específico del backend, usar ese mensaje
      if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error.error?.non_field_errors) {
        errorMessage = error.error.non_field_errors[0];
      }
    }

    console.error('AuthService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}