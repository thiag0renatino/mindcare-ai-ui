import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  readonly registerForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    empresa: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  submitRegister(): void {
    this.errorMessage = '';
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const payload = {
      nome: this.registerForm.value.nome ?? '',
      empresa: this.registerForm.value.empresa ?? '',
      email: this.registerForm.value.email ?? '',
      senha: this.registerForm.value.senha ?? ''
    };
    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.show('Cadastro concluído. Você já pode entrar.', 'success');
        this.registerForm.reset();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.formatRegisterError(error);
      }
    });
  }

  private formatRegisterError(error: unknown): string {
    const payload = (error as { error?: unknown })?.error;
    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }
    if (typeof (payload as { message?: string })?.message === 'string') {
      return (payload as { message: string }).message;
    }
    if (typeof (payload as { details?: string })?.details === 'string') {
      return (payload as { details: string }).details;
    }
    const status = (error as { status?: number })?.status;
    if (status === 409) {
      return 'Já existe um usuário com este e-mail.';
    }
    return 'Não foi possível cadastrar. Verifique os dados e tente novamente.';
  }
}
