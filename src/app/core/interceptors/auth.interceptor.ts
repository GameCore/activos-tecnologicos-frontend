import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Clonamos la petición saliente e inyectamos la configuración de cookies automáticas
  const reqClonada = req.clone({
    withCredentials: true
  });

  // 2. Pasamos la petición clonada al siguiente eslabón y escuchamos la respuesta
  return next(reqClonada).pipe(
    catchError((error: HttpErrorResponse) => {

      // 3. Si el backend nos rebota con un 401 (No autorizado - Cookie expiró o inválida)
      if (error.status === 401) {
        console.warn('Sesión inválida o expirada. Redirigiendo al login...');
        // Aquí puedes borrar señales de usuario si tuvieras y mandar a la ruta del login
        // router.navigate(['/login']);
      }

      // 4. Si el backend nos rebota con un 403 (Prohibido - El usuario no tiene el ROL_ADMIN requerido)
      if (error.status === 403) {
        console.error('Acceso denegado: No tienes los privilegios necesarios para este recurso.');
        alert('Tu cuenta no cuenta con los permisos necesarios para realizar esta acción.');
      }

      // Propagamos el error para que el componente (como tu lista-activos) también sepa que falló
      return throwError(() => error);
    })
  );
};
