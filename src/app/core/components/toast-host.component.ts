import { Component } from '@angular/core';
import { AsyncPipe, NgClass, NgFor } from '@angular/common';

import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [NgFor, AsyncPipe, NgClass],
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.css'
})
export class ToastHostComponent {
  readonly toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
