import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info', durationMs = 3500): void {
    const toast: ToastMessage = {
      id: this.createId(),
      message,
      type
    };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([toast, ...current]);

    window.setTimeout(() => {
      this.dismiss(toast.id);
    }, durationMs);
  }

  dismiss(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}
