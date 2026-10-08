import { Directive, ElementRef, Input, Renderer2, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('scrollRevealRoot') scrollRevealRoot?: HTMLElement;
  @Input('scrollRevealOnce') scrollRevealOnce: boolean = false;
  @Input('scrollRevealDelay') scrollRevealDelay: number = 0;
  @Input() set revealDelay(val: number) {
    this.scrollRevealDelay = val;
  }

  private observer?: IntersectionObserver;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    this.renderer.addClass(this.el.nativeElement, 'scroll-hidden');
    if (this.scrollRevealDelay) {
      this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.scrollRevealDelay}ms`);
    }
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.renderer.removeClass(this.el.nativeElement, 'scroll-hidden');
            this.renderer.addClass(this.el.nativeElement, 'scroll-visible');
            if (this.scrollRevealOnce) {
              this.observer?.disconnect();
            }
          } else {
            if (!this.scrollRevealOnce) {
              this.renderer.removeClass(this.el.nativeElement, 'scroll-visible');
              this.renderer.addClass(this.el.nativeElement, 'scroll-hidden');
            }
          }
        });
      },
      {
        root: this.scrollRevealRoot || null,
        threshold: 0.15
      }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.isBrowser && this.observer) {
      this.observer.disconnect();
    }
  }
}
