import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  navScrolled = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/analysis/new']);
    }
  }

  // :host é o scroll container (overflow-y: auto), não window
  @HostListener('scroll', ['$event.target'])
  onScroll(target: EventTarget | null): void {
    this.navScrolled = (target as HTMLElement)?.scrollTop > 60;
  }
}
