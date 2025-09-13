import { Routes } from '@angular/router';
import { provideRouter, RouterModule } from '@angular/router';

// Importa componentes standalone por path reales en tu proyecto
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MeComponent } from './pages/me/me';
import { UpdateProfile } from './pages/update-profile/update-profile';
import { AboutUsComponent } from './pages/about-us/about-us';
import { ContactComponent } from './pages/contact/contact';
import { ProgramsComponent } from './pages/programs/programs';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized';

// Si usas guards standalone, impórtalos aquí (ejemplo AuthGuard)
import { AuthGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'programs', component: ProgramsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'me', component: MeComponent, canActivate: [AuthGuard] },
  { path: 'me/edit', component: UpdateProfile, canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/' },
];
