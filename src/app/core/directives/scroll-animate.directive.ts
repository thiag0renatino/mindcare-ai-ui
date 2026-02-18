import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({ selector: '[appScrollAnimate]', standalone: true })
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() animDelay = '0s';
  @Input() animName = 'fadeInUp';

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.el.nativeElement.style.opacity = '0';
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.style.animationName = this.animName;
          this.el.nativeElement.style.animationDuration = '0.65s';
          this.el.nativeElement.style.animationDelay = this.animDelay;
          this.el.nativeElement.style.animationFillMode = 'both';
          this.el.nativeElement.style.animationTimingFunction =
            'cubic-bezier(0.16, 1, 0.3, 1)';
          this.el.nativeElement.style.opacity = '';
          this.observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
