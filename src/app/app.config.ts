  import {ApplicationConfig, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection} from '@angular/core';
  import {provideRouter, withComponentInputBinding} from '@angular/router';

  import { routes } from './app.routes';
  import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
  import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
  import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
  import {authInterceptor} from './core/interceptors/auth.interceptor';
  //import {interceptorAuth} from '@app/interceptors/interceptor.auth';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideRouter(routes, withComponentInputBinding()),
      provideExperimentalZonelessChangeDetection(),
      provideHttpClient(withFetch(),withInterceptors([authInterceptor])),
      provideClientHydration(), provideAnimationsAsync(),]
  };
