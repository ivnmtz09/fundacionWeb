import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(ReactiveFormsModule)
  ]
};