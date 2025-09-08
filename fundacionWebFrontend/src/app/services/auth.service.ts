import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/users';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  // Registro
  register(data: {
    first_name: string;
    last_name: string;
    email: string;
    password1: string;
    password2: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, data);
  }

  // Login
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login/`, data).pipe(
      tap((res: any) => {
        if (res.key) {
          this.setToken(res.key);
        }
      })
    );
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout/`, {}).pipe(
      tap(() => this.clearToken())
    );
  }

  // Perfil del usuario
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/`);
  }

  // ======================
  // Helpers de Token
  // ======================
  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
