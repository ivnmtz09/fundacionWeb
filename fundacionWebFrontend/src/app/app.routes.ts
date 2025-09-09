import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MeComponent } from './pages/me/me';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized';
import { AuthGuard, GuestGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home';
import { NavbarComponent } from './components/navbar/navbar';

export const routes: Routes = [
  // Redirigir la raíz hacia me si está autenticado, sino a login
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [GuestGuard]
  },

  {
    path: 'navbar',
    component: NavbarComponent,
    canActivate: [AuthGuard]
  },

  // Rutas públicas (solo para usuarios no autenticados)
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  
  // Rutas protegidas (solo para usuarios autenticados)
  { 
    path: 'me', 
    component: MeComponent,
    canActivate: [AuthGuard]
  },
  
  // Ruta para usuarios no autorizados
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  
  // Capturar todas las rutas no definidas
  { 
    path: '**', 
    redirectTo: 'home' 
  }
];