import {
  Component,
  Input,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './profile-card-component.html',
  styleUrls: ['./profile-card-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileCardComponent implements AfterViewInit, OnDestroy {

  /* ===== INPUTS ===== */
  @Input() name!: string;
  @Input() description!: string;
  @Input() imageSrc!: string;
  @Input() languages!: string;

  @Input() email!: string;
  @Input() whatsapp!: string;
  @Input() github!: string;
  @Input() linkedin!: string;

  /* ===== STATE FLAGS ===== */
  isVisible = true;     // card assembly
  glowActive = false;   // image glow
  nameActive = false;   // name light sweep

  /* ===== INTERNAL ===== */
  @ViewChild('nameBlock', { static: false }) nameBlock!: ElementRef;

  private observer?: IntersectionObserver;
  private nameObserver?: IntersectionObserver;
  private nameInterval: any = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {}

  /* ===== LIFECYCLE ===== */

  ngAfterViewInit() {
    // Solo ejecuta IntersectionObserver en el navegador
    if (typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined') {
      this.observeCard();
      this.observeName();
      // Si el observer de nameBlock no se dispara, forzamos la visibilidad del nombre cuando el card esté visible
      setTimeout(() => {
        if (!this.nameActive && this.isVisible) {
          this.nameActive = true;
          this.cdRef.markForCheck();
        }
      }, 1200); // después de la animación principal
    } else {
      // SSR: muestra el nombre y el card sin animación
      this.isVisible = true;
      this.glowActive = true;
      this.nameActive = true;
      this.cdRef.markForCheck();
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.nameObserver?.disconnect();
    this.stopNameAnimation();
  }

  /* ===== CARD VISIBILITY ===== */

  private observeCard() {
    const card = this.el.nativeElement.querySelector('#profile-card');

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!this.isVisible) {
            this.isVisible = true;
            // glow after image animation
            setTimeout(() => {
              this.glowActive = true;
              this.cdRef.markForCheck();
            }, 900);
            this.cdRef.markForCheck();
          }
        } else {
          if (this.isVisible) {
            this.isVisible = false;
            this.glowActive = false;
            this.cdRef.markForCheck();
          }
        }
      },
      { threshold: 0.35 }
    );

    if (card) {
      this.observer.observe(card);
    }
  }

  /* ===== NAME LIGHT SWEEP ===== */

  private observeName() {
    if (!this.nameBlock) return;

    this.nameObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.startNameAnimationLoop();
        } else {
          this.stopNameAnimation();
        }
      },
      { threshold: 0.6 }
    );

    this.nameObserver.observe(this.nameBlock.nativeElement);
  }

  private startNameAnimationLoop() {
    if (this.nameInterval) return;

    this.triggerNameAnimation();

    this.nameInterval = setInterval(() => {
      this.triggerNameAnimation();
    }, 10000); // ⏱️ cada 10 segundos
  }

  private stopNameAnimation() {
    if (this.nameInterval) {
      clearInterval(this.nameInterval);
      this.nameInterval = null;
    }
  }

  private triggerNameAnimation() {
    this.nameActive = false;
    this.cdRef.markForCheck();

    // pequeño delay para reiniciar la animación CSS
    setTimeout(() => {
      this.nameActive = true;
      this.cdRef.markForCheck();
    }, 40);
  }
}
