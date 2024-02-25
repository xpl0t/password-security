import { Component } from '@angular/core';
import { PasswordComponent } from './password/password.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    PasswordComponent
  ]
})
export class AppComponent {}
