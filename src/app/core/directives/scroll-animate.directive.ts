import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({ selector: '[appScrollAnimate]', standalone: true })
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() animDelay = '0s';
  @Input() animName = 'fadeInUp';

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    // IntersectionObserver só existe no browser — SSR não tem essa API
    if (!isPlatformBrowser(this.platformId)) return;

    this.el.nativeElement.style.opacity = '0';
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const el = this.el.nativeElement;
          el.style.animationName = this.animName;
          el.style.animationDuration = '0.7s';
          el.style.animationDelay = this.animDelay;
          el.style.animationFillMode = 'both';
          el.style.animationTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '';
          this.observer?.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
