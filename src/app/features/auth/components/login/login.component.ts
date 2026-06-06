import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Estados reactivos para la vista (Zoneless)
  cargando = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  // Construcción del Formulario Reactivo con validaciones institucionales
  formularioLogin = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  ejecutarLogin(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMsg.set(null);

    const { username, password } = this.formularioLogin.getRawValue();

    this.authService.login(username, password).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        console.log('Cookie depositada en el navegador. Respuesta:', respuesta);

        // Redirigimos a la tabla de activos que ya creamos antes
        this.router.navigate(['/activos']);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 401 || err.status === 400) {
          this.errorMsg.set('Credenciales institucionales incorrectas.');
        } else {
          this.errorMsg.set('Servidor de autenticación no disponible en este momento.');
        }
      }
    });
  }
}
