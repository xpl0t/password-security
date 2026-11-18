import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HeaderComponent } from './header/header.component';
import { PasswordComponent } from './password/password.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    HeaderComponent,
    PasswordComponent
  ]
})
export class AppComponent {

  private sanitizer = inject(DomSanitizer);
  private matIconRegistry = inject(MatIconRegistry);

  public constructor() {
    this.matIconRegistry.addSvgIcon('logo', this.sanitizer.bypassSecurityTrustResourceUrl("/assets/icon.svg"));
  }

}
