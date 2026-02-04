import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { UserService } from './user.service';
import { UsuarioResponse } from '../../models/mindcheck.models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly userSubject = new BehaviorSubject<UsuarioResponse | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(private userService: UserService) {}

  load(): Observable<UsuarioResponse> {
    return this.userService.me().pipe(
      tap((user) => this.userSubject.next(user)),
    );
  }

  get user(): UsuarioResponse | null {
    return this.userSubject.value;
  }

  get initials(): string {
    const nome = this.userSubject.value?.nome ?? '';
    return nome
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  clear(): void {
    this.userSubject.next(null);
  }
}
