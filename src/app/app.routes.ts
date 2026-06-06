// src/app/app.routes.ts o app-routing.module.ts
import { Routes } from '@angular/router';
import { ListaActivosComponent } from './features/activos/components/lista-activos/lista-activos.component';
import { LoginComponent } from './features/auth/components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // ASEGÚRATE DE QUE EL PATH SEA EXACTAMENTE 'activos'
  { path: 'activos', component: ListaActivosComponent },

  // Ruta por defecto si entran a la raíz
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Ruta comodín por si escriben cualquier otra cosa
  { path: '**', redirectTo: '/login' }
];
