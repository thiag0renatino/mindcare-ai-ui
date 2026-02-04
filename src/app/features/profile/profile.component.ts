import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { UserContextService } from '../../core/services/user-context.service';
import { UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  readonly user$ = this.userProfileService.user$;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private userContextService: UserContextService,
    private router: Router,
  ) {}

  get initials(): string {
    return this.userProfileService.initials;
  }

  logout(): void {
    this.authService.clearToken();
    this.userContextService.clearUsuarioId();
    this.userProfileService.clear();
    this.router.navigate(['/login']);
  }

  tipoLabel(tipo: string | undefined): string {
    if (!tipo) return 'Colaborador';
    const map: Record<string, string> = {
      ADMIN: 'Administrador',
      USUARIO: 'Colaborador',
      PROFISSIONAL: 'Profissional',
    };
    return map[tipo.toUpperCase()] ?? tipo;
  }
}
