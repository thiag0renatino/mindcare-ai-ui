import { Injectable } from '@angular/core';

const USER_ID_KEY = 'mindcareai.usuarioId';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  getUsuarioId(): number | null {
    if (!this.canUseStorage()) {
      return null;
    }
    const raw = localStorage.getItem(USER_ID_KEY);
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  setUsuarioId(value: number): void {
    if (!this.canUseStorage()) {
      return;
    }
    localStorage.setItem(USER_ID_KEY, String(value));
  }

  clearUsuarioId(): void {
    if (!this.canUseStorage()) {
      return;
    }
    localStorage.removeItem(USER_ID_KEY);
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
