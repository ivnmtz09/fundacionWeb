import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // No agregar token a requests de autenticación
  if (isAuthRequest(req.url)) {
    return next(req);
  }

  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest(req.url)) {
        // Aquí podrías implementar refresh token si lo soportas
        const refresh = localStorage.getItem('fw_refresh');
        if (refresh) {
          // TODO: implementar endpoint de refresh en tu backend
          // por ahora, si falla el token, hacemos logout
          authService.clearAuth();
          return throwError(() => error);
        } else {
          authService.clearAuth();
          return throwError(() => error);
        }
      }
      return throwError(() => error);
    })
  );
};

function isAuthRequest(url: string): boolean {
  return url.includes('/auth/login/') ||
         url.includes('/auth/register/') ||
         url.includes('/auth/refresh/') ||
         url.includes('/auth/logout/');
}
