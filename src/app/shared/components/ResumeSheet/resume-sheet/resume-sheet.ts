import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
  effect,
  signal,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { gsap } from 'gsap';

import { ResumeSheetService } from '../../../services/resume-sheet.service';
import { RESUME_DATA } from '../../../data/resume.data';

type SheetPhase = 'closed' | 'opening' | 'open' | 'closing';

@Component({
  selector: 'app-resume-sheet',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './resume-sheet.html',
  styleUrls: ['./resume-sheet.scss']
})
export class ResumeSheetComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  readonly service = inject(ResumeSheetService);

  readonly data = RESUME_DATA;
  readonly titleId = 'resume-sheet-name';

  readonly phase = signal<SheetPhase>('closed');
  readonly visible = computed(() => this.phase() !== 'closed');

  @ViewChild('backdrop') private backdropRef?: ElementRef<HTMLDivElement>;
  @ViewChild('sheet') private sheetRef?: ElementRef<HTMLDivElement>;

  private tl?: gsap.core.Timeline;
  private reduceMotion = false;
  private previousBodyOverflow = '';
  private previousBodyPosition = '';
  private previousBodyTop = '';
  private previousBodyWidth = '';
  private scrollY = 0;
  private viewReady = false;

  constructor() {
    effect(() => {
      const open = this.service.isOpen();
      if (!this.viewReady || !isPlatformBrowser(this.platformId)) return;

      if (open) {
        this.beginOpen();
      } else if (this.phase() === 'open' || this.phase() === 'opening') {
        this.beginClose();
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }
    // Avoid the effect firing before the view (and matchMedia check) is ready.
    this.viewReady = true;
    if (this.service.isOpen()) {
      this.beginOpen();
    }
  }

  ngOnDestroy(): void {
    this.tl?.kill();
    this.service.clearTimers();
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('keydown', this.onDocKeydown);
      this.restoreBodyScroll();
    }
  }

  /* ================= OPEN / CLOSE ================= */

  private beginOpen(): void {
    this.phase.set('opening');
    this.lockBodyScroll();
    document.addEventListener('keydown', this.onDocKeydown);

    // Let Angular render the *ngIf block before we query it for animation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.runOpenAnimation());
    });
  }

  private runOpenAnimation(): void {
    const backdrop = this.backdropRef?.nativeElement;
    const sheet = this.sheetRef?.nativeElement;

    if (!backdrop || !sheet) {
      this.phase.set('open');
      this.focusSheet();
      return;
    }

    const blocks = Array.from(sheet.querySelectorAll('.resume-block')) as HTMLElement[];

    this.tl?.kill();

    if (this.reduceMotion) {
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(sheet, { opacity: 1, scale: 1, y: 0, rotate: 0 });
      gsap.set(blocks, { opacity: 1, y: 0 });
      this.phase.set('open');
      this.focusSheet();
      return;
    }

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(sheet, { opacity: 0, scale: 0.92, y: -36, rotate: -3, transformOrigin: 'top center' });
    gsap.set(blocks, { opacity: 0, y: 14 });

    const tl = gsap.timeline({
      onComplete: () => {
        this.phase.set('open');
        this.focusSheet();
      }
    });
    this.tl = tl;

    tl.to(backdrop, { opacity: 1, duration: 0.28, ease: 'power1.out' })
      .to(sheet, { opacity: 1, scale: 1, y: 0, rotate: -0.6, duration: 0.55, ease: 'power3.out' }, '<0.05')
      .to(blocks, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.045 }, '-=0.3');
  }

  private beginClose(): void {
    if (this.phase() === 'closed' || this.phase() === 'closing') return;
    this.phase.set('closing');

    document.removeEventListener('keydown', this.onDocKeydown);

    const backdrop = this.backdropRef?.nativeElement;
    const sheet = this.sheetRef?.nativeElement;

    const finish = () => {
      this.phase.set('closed');
      this.restoreBodyScroll();
      this.service.returnFocusToTrigger();
    };

    if (!backdrop || !sheet || this.reduceMotion) {
      finish();
      return;
    }

    this.tl?.kill();
    const tl = gsap.timeline({ onComplete: finish });
    this.tl = tl;

    tl.to(sheet, { opacity: 0, scale: 0.94, y: -24, rotate: -2, duration: 0.3, ease: 'power2.in' })
      .to(backdrop, { opacity: 0, duration: 0.22, ease: 'power1.in' }, '<0.05');
  }

  /* ================= INTERACTION ================= */

  requestClose(): void {
    this.service.close();
  }

  onBackdropMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  stop(event: MouseEvent): void {
    event.stopPropagation();
  }

  downloadResume(): void {
    this.service.downloadResume();
  }

  private onDocKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.requestClose();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  };

  private trapFocus(event: KeyboardEvent): void {
    const sheet = this.sheetRef?.nativeElement;
    if (!sheet) return;

    const focusables = Array.from(
      sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusSheet(): void {
    this.sheetRef?.nativeElement?.focus();
  }

  /* ================= BODY SCROLL LOCK ================= */

  private lockBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.scrollY = window.scrollY;
    this.previousBodyOverflow = document.body.style.overflow;
    this.previousBodyPosition = document.body.style.position;
    this.previousBodyTop = document.body.style.top;
    this.previousBodyWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.width = '100%';
  }

  private restoreBodyScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.style.overflow = this.previousBodyOverflow;
    document.body.style.position = this.previousBodyPosition;
    document.body.style.top = this.previousBodyTop;
    document.body.style.width = this.previousBodyWidth;
    window.scrollTo(0, this.scrollY);
  }
}
