import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MeComponent } from './pages/me/me';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized';
import { AuthGuard, GuestGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home';
import { AboutUsComponent } from './pages/about-us/about-us';
import { ProgramsComponent } from './pages/programs/programs';
import { ContactComponent } from './pages/contact/contact'; 

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'programs', component: ProgramsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'me', component: MeComponent, canActivate: [AuthGuard] },
  //{ path: 'dashboard', componet: DashboardComponent canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent },
  //{ path: '**', redirectTo: 'home' }
];