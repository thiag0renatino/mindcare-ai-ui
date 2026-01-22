import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';

import { AuthService } from '../core/services/auth.service';
import { UserContextService } from '../core/services/user-context.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent {
  readonly token$ = this.authService.token$;

  constructor(
    private authService: AuthService,
    private userContextService: UserContextService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.clearToken();
    this.userContextService.clearUsuarioId();
    this.router.navigate(['/login']);
  }

}
