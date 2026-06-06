import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ListaActivosComponent} from './features/activos/components/lista-activos/lista-activos.component';
import {LoginComponent} from './features/auth/components/login/login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'control-activos';
}
