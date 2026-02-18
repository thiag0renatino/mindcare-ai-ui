import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ScrollAnimateDirective } from '../../core/directives/scroll-animate.directive';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  navScrolled  = false;
  heroScrolled = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private el: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/analysis/new']);
    }
  }

  // :host é o scroll container (overflow-y: auto), não window
  @HostListener('scroll', ['$event.target'])
  onScroll(target: EventTarget | null): void {
    const scrollTop = (target as HTMLElement)?.scrollTop ?? 0;
    this.navScrolled  = scrollTop > 80;
    this.heroScrolled = scrollTop > 50;
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const host = this.el.nativeElement;
    const target = host.querySelector<HTMLElement>('#' + id);
    if (target) {
      host.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    }
  }
}
