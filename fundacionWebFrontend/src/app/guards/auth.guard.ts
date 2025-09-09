import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          // Verificar si la ruta requiere roles específicos
          const requiredRoles = route.data['roles'] as string[];
          const minimumLevel = route.data['minimumLevel'] as number;

          if (requiredRoles && requiredRoles.length > 0) {
            if (!this.authService.hasRole(requiredRoles)) {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          }

          if (minimumLevel) {
            if (!this.authService.hasMinimumRoleLevel(minimumLevel)) {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          }

          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}