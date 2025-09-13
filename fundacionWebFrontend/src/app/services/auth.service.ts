import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

export interface Role {
  id?: number;
  name?: string;
  level?: number;
}

export interface Profile {
  phone_number?: string;
  address?: string;
  location?: string;
  bio?: string;
  interests?: string;
  avatar?: string | null;
}

export interface User {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: Role;
  profile?: Profile;
  date_joined?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api/users';
  private tokenKey = 'fw_token';
  private refreshKey = 'fw_refresh';
  private userSubject = new BehaviorSubject<User | null>(null);

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem(this.tokenKey);
    if (stored) {
      // opcional: recuperar perfil al iniciar
      this.getProfile().subscribe({ next: () => {}, error: () => this.clearAuth() });
    }
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('/api/users/auth/login/', { username, password }).pipe(
      tap(res => {
        if (res?.access) {
          localStorage.setItem(this.tokenKey, res.access);
        }
        if (res?.refresh) {
          localStorage.setItem(this.refreshKey, res.refresh);
        }
      }),
      tap(() => this.getProfile().subscribe())
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post('/api/users/auth/register/', payload).pipe(
      tap(() => {})
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.userSubject.next(null);
  }

  clearAuth() {
    this.logout();
  }

  getProfile(): Observable<User> {
    return this.http.get<User>('/api/users/me/', { headers: this.authHeaders() }).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  updateProfile(payload: any): Observable<User> {
    return this.http.put<User>('/api/users/me/', payload, { headers: this.authHeaders() }).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

export interface LoginRequest {
  username: string;
  password: string;
}
