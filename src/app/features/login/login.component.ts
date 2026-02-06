import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { UserContextService } from '../../core/services/user-context.service';
import { ToastService } from '../../core/services/toast.service';
import { CapsLockDirective } from '../../core/directives/caps-lock.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, CapsLockDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]]
  });

  loadingSignIn = false;
  errorMessage = '';
  capsLockOn = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private userContextService: UserContextService,
    private toastService: ToastService,
    private router: Router
  ) {}

  submitSignIn(): void {
    this.errorMessage = '';
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }
    this.loadingSignIn = true;
    const payload = {
      email: this.signInForm.value.email ?? '',
      senha: this.signInForm.value.senha ?? ''
    };
    this.authService.signIn(payload).subscribe({
      next: () => {
        this.userProfileService.load().subscribe({
          next: (user) => {
            if (user?.id) {
              this.userContextService.setUsuarioId(user.id);
            }
            this.loadingSignIn = false;
            this.router.navigate(['/analysis/new']);
          },
          error: () => {
            this.loadingSignIn = false;
            this.toastService.show(
              'Login realizado, mas não foi possível carregar o usuário.',
              'info'
            );
            this.router.navigate(['/analysis/new']);
          }
        });
      },
      error: (error) => {
        this.loadingSignIn = false;
        this.errorMessage = this.formatSignInError(error);
      }
    });
  }

  private formatSignInError(error: unknown): string {
    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return 'Email ou senha inválidos.';
    }
    const payload = (error as { error?: unknown })?.error;
    if (typeof payload === 'string' && payload.trim()) {
      const normalized = payload.toLowerCase();
      if (normalized.includes('bad credentials')) {
        return 'Email ou senha inválidos.';
      }
      return payload;
    }
    if (typeof (payload as { message?: string })?.message === 'string') {
      return this.normalizeAuthMessage((payload as { message: string }).message);
    }
    if (typeof (payload as { details?: string })?.details === 'string') {
      return this.normalizeAuthMessage((payload as { details: string }).details);
    }
    if (typeof (error as { message?: string })?.message === 'string') {
      return this.normalizeAuthMessage((error as { message: string }).message);
    }
    return 'Não foi possível autenticar. Verifique as credenciais ou a API.';
  }

  private normalizeAuthMessage(message: string): string {
    const normalized = message.toLowerCase();
    if (normalized.includes('bad credentials')) {
      return 'Email ou senha inválidos.';
    }
    return message;
  }
}
