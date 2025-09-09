import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // No agregar token a requests de auth
  if (isAuthRequest(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un error 401 y tenemos refresh token, intentar renovar
      if (error.status === 401 && !isAuthRequest(req.url)) {
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((tokenResponse: any) => {
              // Reintentar la petición original con el nuevo token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokenResponse.access}`
                }
              });
              return next(newReq);
            }),
            catchError((refreshError) => {
              authService.logout().subscribe();
              return throwError(() => refreshError);
            })
          );
        } else {
          authService.logout().subscribe();
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