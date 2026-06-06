import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/activos-tecnologicos';

  // Signal para guardar el usuario autenticado en la sesión actual de la app (Zoneless)
  usuarioActual = signal<string | null>(null);
  rolesUsuario = signal<string[]>([]);

  /**
   * Dispara las credenciales al backend.
   * Gracias al interceptor global, el navegador guardará la cookie HttpOnly automáticamente.
   */
  login(username: string, password: string): Observable<AuthResponse> {
    const credenciales = { username, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        // Si el login es exitoso, actualizamos nuestros Signals de estado global
        this.usuarioActual.set(respuesta.username);
        this.rolesUsuario.set(respuesta.roles);
      })
    );
  }
}
