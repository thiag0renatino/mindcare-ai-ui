import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appCapsLock]',
  standalone: true,
})
export class CapsLockDirective {
  @Output() capsLock = new EventEmitter<boolean>();

  @HostListener('keydown', ['$event'])
  @HostListener('keyup', ['$event'])
  onKeyEvent(event: KeyboardEvent): void {
    this.capsLock.emit(event.getModifierState('CapsLock'));
  }
}
