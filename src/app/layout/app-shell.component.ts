import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';

import { AuthService } from '../core/services/auth.service';
import { UserContextService } from '../core/services/user-context.service';
import { UserProfileService } from '../core/services/user-profile.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent implements OnInit {
  readonly token$ = this.authService.token$;
  readonly user$ = this.userProfileService.user$;

  constructor(
    private authService: AuthService,
    private userContextService: UserContextService,
    private userProfileService: UserProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userProfileService.load().subscribe({
      next: (user) => {
        if (user?.id) {
          this.userContextService.setUsuarioId(user.id);
        }
      },
    });
  }

  get initials(): string {
    return this.userProfileService.initials;
  }
}
