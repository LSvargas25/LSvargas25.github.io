import { Component, signal, AfterViewInit, ElementRef, NgZone, OnDestroy, ViewChild, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Footer } from './shared/components/Footer/footer/footer';
import { ResumeSheetComponent } from './shared/components/ResumeSheet/resume-sheet/resume-sheet';
import { SeoService } from './core/seo.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Footer, ResumeSheetComponent, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('my-app');

  @ViewChild('vantaBg', { static: true }) vantaBg!: ElementRef<HTMLDivElement>;
  private vantaEffect: any;
  private platformId = inject(PLATFORM_ID);
  private currentColor: number | null = null;

  /* ===================== VANTA THEMES ===================== */

  private vantaThemes: Record<string, { color: number }> = {
    hero:     { color: 0xD6C7A3 }, // marfil
    profile:  { color: 0xD6C7A3 }, // marfil
    projects: { color: 0xD6C7A3 }, // marfil
    contact:  { color: 0xD6C7A3 }  // marfil
  };
  /** three.js and p5 are only fetched when the animated background will actually run */
  private static readonly THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js';
  private static readonly P5_URL = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js';

  constructor(private ngZone: NgZone) {
    // Title, <html lang> and social meta tags follow the active language
    inject(SeoService).init();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      // Use requestAnimationFrame to ensure DOM is fully painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Wait for DOM to be fully ready before setting up scroll triggers
          setTimeout(() => {
            this.initAos();

            // Refresh ScrollTrigger to recalculate positions
            setTimeout(() => ScrollTrigger.refresh(), 100);
          }, 100);

          // three.js + p5 cost ~2 s of main-thread work: start the background on the
          // visitor's first interaction instead of competing with the first paint
          if (this.wantsAnimatedBackground()) {
            this.onFirstInteraction(async () => {
              await this.initVanta();
              this.animateVantaOnScroll();
              ScrollTrigger.refresh();
            });
          }
        });
      });
    });
  }

  /**
   * The WebGL/p5 background is decorative and costs ~300 KB plus main-thread
   * time. Phones, tablets and reduced-motion users get the plain ivory
   * background (same colour) instead.
   */
  private wantsAnimatedBackground(): boolean {
    const wide = window.matchMedia?.('(min-width: 1024px)').matches ?? false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const saveData = (navigator as any).connection?.saveData === true;
    return wide && !reduced && !saveData;
  }

  /** Runs `fn` once, on the first pointer move, scroll, wheel, key or touch */
  private onFirstInteraction(fn: () => void): void {
    const events = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown', 'touchstart'] as const;
    const run = () => {
      events.forEach(e => window.removeEventListener(e, run));
      fn();
    };
    events.forEach(e => window.addEventListener(e, run, { once: true, passive: true }));
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }

  /* ===================== VANTA INIT ===================== */

  /**
   * Polls for a `<script defer>`-loaded global (THREE, p5) instead of
   * assuming it is already attached to `window`. Deferred scripts execute
   * before DOMContentLoaded, which normally precedes this call, but this
   * keeps Vanta init robust against load-order timing across browsers.
   */
  private waitForGlobal<T = unknown>(key: string, timeoutMs = 4000): Promise<T | undefined> {
    return new Promise(resolve => {
      const existing = (window as any)[key];
      if (existing) {
        resolve(existing);
        return;
      }

      const intervalMs = 50;
      let waited = 0;

      const poll = setInterval(() => {
        const value = (window as any)[key];
        waited += intervalMs;

        if (value) {
          clearInterval(poll);
          resolve(value);
        } else if (waited >= timeoutMs) {
          clearInterval(poll);
          resolve(undefined);
        }
      }, intervalMs);
    });
  }

  private async initVanta(): Promise<void> {
    try {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.vantaBg?.nativeElement) return;

      if (this.vantaEffect) {
        this.vantaEffect.destroy();
      }

      // Vanta's ES module source, not the UMD bundle in vanta/dist: esbuild's
      // production CommonJS interop returned the UMD's { __esModule, default }
      // object as `default`, so TOPOLOGY was not a function in `ng build`.
      // The ESM default export is the effect factory in every build.
      const { default: TOPOLOGY } = await import('vanta/src/vanta.topology.js');

      // THREE and p5 come from CDN, loaded on demand; wait until they're on window
      await Promise.all([this.loadScript(App.THREE_URL), this.loadScript(App.P5_URL)]);
      const THREE = await this.waitForGlobal('THREE');
      const p5 = await this.waitForGlobal('p5');
      if (!THREE || !p5) {
        console.error('Vanta background skipped: THREE.js or p5.js did not load');
        return;
      }

    this.vantaEffect = TOPOLOGY({
  el: this.vantaBg.nativeElement,
  THREE,
  p5,

  // Paleta marfil premium
  color: 0xD6C7A3,
  backgroundColor: 0xFAF7F2,

  //  Patrón
  points: 12,
  maxDistance: 45,
  spacing: 13,

  //  Interacción / movimiento
  mouseControls: true,
  touchControls: false,
  gyroControls: false,

  //  Performance
  scale: 1,
  scaleMobile: 1
});



    } catch (error) {
      console.error('Failed to initialize the Vanta background:', error);
    }
  }

  /* ===================== COLOR ANIMATION ===================== */

  private animateVantaColor(hexColor: number): void {
    if (!this.vantaEffect) return;

    // Skip if already animating to this color
    if (this.currentColor === hexColor) {
      return;
    }

    this.currentColor = hexColor;

    // Extraer valores RGB del color hex
    const r = ((hexColor >> 16) & 255);
    const g = ((hexColor >> 8) & 255);
    const b = (hexColor & 255);

    // Crear objeto temp para GSAP animar
    const colorObj = this.hexToRgb(this.vantaEffect.options.color);

    gsap.to(colorObj, {
      r: r,
      g: g,
      b: b,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        // Convertir de vuelta a hex cada frame
        const newHex = (Math.round(colorObj.r) << 16) +
                       (Math.round(colorObj.g) << 8) +
                       Math.round(colorObj.b);
        this.vantaEffect.options.color = newHex;
      }
    });
  }

  private hexToRgb(hex: number): { r: number; g: number; b: number } {
    return {
      r: (hex >> 16) & 255,
      g: (hex >> 8) & 255,
      b: hex & 255
    };
  }

  /* ===================== SCROLL ANIMATION ===================== */

  private animateVantaOnScroll(): void {
    // No effect on phones / reduced motion: nothing to animate
    if (!this.vantaBg?.nativeElement || !this.vantaEffect) return;

    // Anima el background del vanta con scroll - ZOOM MÁS NOTABLE
    gsap.to(this.vantaBg.nativeElement, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8  // más responsivo
      },
      scale: 1.4,            // zoom mayor para más movimiento
      rotation: 3,           // rotación sutil
      ease: 'none'
    });

    // Anima los parámetros de VANTA directamente basado en scroll
    gsap.to(this.vantaEffect.options, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          if (this.vantaEffect?.options) {
            // Progresión del scroll (0 a 1)
            const progress = self.progress;

            // Anima los puntos (de 12 a 22) - mantiene líneas verticales
            this.vantaEffect.options.points = 12 + progress * 10;

            // Anima el spacing (de 13 a 25) - más denso para efecto vertical
            this.vantaEffect.options.spacing = 13 + progress * 12;

            // Anima maxDistance (de 45 a 55) - mantiene conexiones verticales
            this.vantaEffect.options.maxDistance = 45 + progress * 10;
          }
        }
      }
    });
  }

  /* ===================== AOS INIT ===================== */

  private async initAos(): Promise<void> {
    try {
      const aosModule = await import('aos');
      const AOSModule = (aosModule as any).default ?? aosModule;
      AOSModule.init({
        duration: 900,
        once: true,
        easing: 'ease-in-out',
      });
    } catch (error) {
      console.error('Failed to initialize AOS:', error);
    }
  }
}
