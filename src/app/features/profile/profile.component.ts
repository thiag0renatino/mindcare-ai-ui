import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { UserContextService } from '../../core/services/user-context.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { CapsLockDirective } from '../../core/directives/caps-lock.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, AsyncPipe, ReactiveFormsModule, CapsLockDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  readonly user$ = this.userProfileService.user$;

  editingName = false;
  editingPassword = false;
  savingName = false;
  savingPassword = false;

  showSenhaAtual = false;
  showNovaSenha = false;
  showConfirmarSenha = false;
  capsLockOn = false;

  nameForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private userProfileService: UserProfileService,
    private userService: UserService,
    private authService: AuthService,
    private userContextService: UserContextService,
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.nameForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.passwordForm = this.fb.group({
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]],
    });
  }

  get initials(): string {
    return this.userProfileService.initials;
  }

  startEditName(currentName: string | undefined): void {
    this.nameForm.patchValue({ nome: currentName ?? '' });
    this.editingName = true;
  }

  cancelEditName(): void {
    this.editingName = false;
    this.nameForm.reset();
  }

  saveName(): void {
    if (this.nameForm.invalid || this.savingName) return;

    this.savingName = true;
    const nomeNovo = this.nameForm.get('nome')?.value?.trim();

    this.userService.updateName({ nomeNovo }).subscribe({
      next: () => {
        this.userProfileService.load().subscribe();
        this.editingName = false;
        this.savingName = false;
        this.toastService.show('Nome atualizado com sucesso!', 'success');
      },
      error: () => {
        this.savingName = false;
        this.toastService.show('Erro ao atualizar nome. Tente novamente.', 'error');
      },
    });
  }

  startEditPassword(): void {
    this.passwordForm.reset();
    this.resetPasswordVisibility();
    this.editingPassword = true;
  }

  cancelEditPassword(): void {
    this.editingPassword = false;
    this.passwordForm.reset();
    this.resetPasswordVisibility();
  }

  toggleSenhaAtual(): void {
    this.showSenhaAtual = !this.showSenhaAtual;
  }

  toggleNovaSenha(): void {
    this.showNovaSenha = !this.showNovaSenha;
  }

  toggleConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }

  private resetPasswordVisibility(): void {
    this.showSenhaAtual = false;
    this.showNovaSenha = false;
    this.showConfirmarSenha = false;
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword) return;

    const { senhaAtual, novaSenha, confirmarSenha } = this.passwordForm.value;

    if (novaSenha !== confirmarSenha) {
      this.toastService.show('As senhas não coincidem.', 'error');
      return;
    }

    this.savingPassword = true;

    this.userService.updatePassword({ senhaAtual, senhaNova: novaSenha }).subscribe({
      next: () => {
        this.editingPassword = false;
        this.savingPassword = false;
        this.passwordForm.reset();
        this.resetPasswordVisibility();
        this.toastService.show('Senha alterada com sucesso!', 'success');
      },
      error: () => {
        this.savingPassword = false;
        this.toastService.show(
          'Erro ao alterar senha. Verifique a senha atual.',
          'error'
        );
      },
    });
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
