import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
  inject,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';

import { ResumeSheetService } from '../../../../../shared/services/resume-sheet.service';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './note.html',
  styleUrls: ['./note.scss']
})
export class NoteComponent implements AfterViewInit, OnDestroy {

  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);
  private resumeSheet = inject(ResumeSheetService);
  private langSub?: Subscription;
  private writingTimeline?: gsap.core.Timeline;
  private reduceMotion = false;

  @ViewChild('note', { static: true }) noteRef!: ElementRef<HTMLDivElement>;
  @ViewChild('textLine', { static: true }) textLineRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('pencil', { static: true }) pencilRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('resumeBtn', { static: true }) resumeBtnRef!: ElementRef<HTMLButtonElement>;

  @ViewChild('inkDot', { static: true }) inkDotRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('eraseDust', { static: true }) eraseDustRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('caret', { static: true }) caretRef!: ElementRef<HTMLSpanElement>;

  /* ================= TEXT ================= */
  /** A signal, so the zoneless change detection knows when the text arrives */
  readonly messageChars = signal<string[]>([]);

  /* ================= RESUME SHEET ================= */
  readonly isResumeOpen = this.resumeSheet.isOpen;

  /* ================= LIFECYCLE ================= */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    // Deferred to the next tick: TranslateService.get() resolves synchronously
    // once translations are cached, which would otherwise mutate messageChars
    // inside the same change-detection cycle as the view's first check
    // (NG0100 ExpressionChangedAfterItHasBeenCheckedError during hydration).
    setTimeout(() => this.setMessageFromTranslate(), 0);

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.setMessageFromTranslate();
    });

    this.initFloating();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.writingTimeline?.kill();
  }

  private setMessageFromTranslate(): void {
    this.translate.get('note.message').subscribe((value: unknown) => {
      this.messageChars.set(typeof value === 'string' ? value.split('') : []);

      if (this.reduceMotion) return;

      // Wait for Angular to render new chars before restarting the animation.
      setTimeout(() => {
        this.restartWritingAnimation();
      }, 0);
    });
  }

  private restartWritingAnimation(): void {
    this.writingTimeline?.kill();
    this.writingTimeline = undefined;

    const line = this.textLineRef?.nativeElement;
    const pencil = this.pencilRef?.nativeElement;
    const caret = this.caretRef?.nativeElement;
    const inkDot = this.inkDotRef?.nativeElement;
    const eraseDust = this.eraseDustRef?.nativeElement;
    const chars = line ? Array.from(line.querySelectorAll('.char')) as HTMLElement[] : [];

    if (pencil) gsap.killTweensOf(pencil);
    if (caret) gsap.killTweensOf(caret);
    if (inkDot) gsap.killTweensOf(inkDot);
    if (eraseDust) gsap.killTweensOf(eraseDust);
    if (chars.length) gsap.killTweensOf(chars);

    this.initWritingHuman();
  }

  /* ================= FLOATING NOTE ================= */
  private initFloating(): void {
    gsap.to(this.noteRef.nativeElement, {
      y: 6,
      rotation: 0.6,
      duration: 3.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  /* ================= RESUME HANDLER ================= */
  openResume(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    /* Micro feedback on click (premium feel) */
    gsap.fromTo(
      this.noteRef.nativeElement,
      { rotate: -0.5 },
      {
        rotate: -0.2,
        duration: 0.12,
        repeat: 1,
        yoyo: true,
        ease: 'power2.out'
      }
    );

    this.resumeSheet.open(this.resumeBtnRef?.nativeElement);
  }

  /* ================= HUMAN WRITING ================= */
  private initWritingHuman(): void {
    const line = this.textLineRef.nativeElement;
    const pencil = this.pencilRef.nativeElement;
    const inkDot = this.inkDotRef.nativeElement;
    const eraseDust = this.eraseDustRef.nativeElement;
    const caret = this.caretRef.nativeElement;

    const chars = Array.from(line.querySelectorAll('.char')) as HTMLElement[];
    if (!chars.length) return;

    /* Pencil geometry */
    const PENCIL_SIZE = 30;
    const VIEWBOX_W = 64;
    const VIEWBOX_H = 64;

    const TIP_X = (62 / VIEWBOX_W) * PENCIL_SIZE;
    const ERASER_X = (9 / VIEWBOX_W) * PENCIL_SIZE;
    const CONTACT_Y = (32 / VIEWBOX_H) * PENCIL_SIZE;

    const TIP_ORIGIN = `${(62 / VIEWBOX_W) * 100}% 55%`;
    const ERASER_ORIGIN = `${(9 / VIEWBOX_W) * 100}% 55%`;

    /* Humanized timings */
    const rand = gsap.utils.random;
    const writeDur = () => rand(0.08, 0.16, 0.01);
    const writePause = () => rand(0.02, 0.08, 0.01);
    const spacePause = () => rand(0.09, 0.18, 0.01);
    const eraseDur = () => rand(0.07, 0.14, 0.01);

    /* Humanized rotation */
    const baseWriteRot = -22;
    const rotVar = 3.2;
    const rot = () => baseWriteRot + rand(-rotVar, rotVar, 0.1);

    /* Stable positioning */
    const posOfChar = (el: HTMLElement) => {
      return {
        x: el.offsetLeft + el.offsetWidth * 0.15,
        y: el.offsetTop + el.offsetHeight * 0.68
      };
    };

    /* Initial state */
    gsap.set(chars, { opacity: 0, filter: 'blur(5px)', y: 2, scale: 0.98 });
    gsap.set(pencil, { x: 0, y: 0, rotation: baseWriteRot, transformOrigin: TIP_ORIGIN });
    gsap.set([inkDot, eraseDust], { opacity: 0, scale: 0.2 });
    gsap.set(caret, { opacity: 0 });

    /* Subtle hand tremor */
    gsap.to(pencil, {
      x: `+=${rand(-0.6, 0.6)}`,
      y: `+=${rand(-0.5, 0.5)}`,
      rotation: `+=${rand(-0.4, 0.4)}`,
      duration: 0.18,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    /* Caret blink */
    gsap.to(caret, {
      opacity: 0,
      duration: 0.55,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.1 });
    this.writingTimeline = tl;

    const placeCaret = (x: number, y: number) => {
      gsap.set(caret, { x, y });
    };

    const inkPop = (x: number, y: number) => {
      gsap.set(inkDot, { x, y, opacity: 0.9, scale: rand(0.6, 0.95) });
      gsap.to(inkDot, { opacity: 0, scale: 0.15, duration: 0.18, ease: 'power2.out' });
    };

    const dustPuff = (x: number, y: number) => {
      gsap.set(eraseDust, { x, y, opacity: 0.9, scale: rand(0.65, 1.1) });
      gsap.to(eraseDust, { opacity: 0, scale: 0.2, duration: 0.22, ease: 'power2.out' });
    };

    tl.set(caret, { opacity: 1 });

    /* WRITE */
    chars.forEach(ch => {
      const isSpace = ch.textContent?.trim() === '';
      const { x, y } = posOfChar(ch);

      tl.to(pencil, {
        x: x - TIP_X,
        y: y - CONTACT_Y + rand(1.6, 2.4),
        rotation: rot(),
        duration: writeDur(),
        ease: 'power2.out',
        onStart: () => placeCaret(x + 6, y - 10)
      });

      tl.to(pencil, {
        y: y - CONTACT_Y + rand(0.1, 0.4),
        duration: 0.05
      }, '<');

      if (!isSpace) {
        tl.to(ch, {
          opacity: 1,
          filter: 'blur(0)',
          y: 0,
          scale: 1,
          duration: 0.1,
          ease: 'power2.out',
          onStart: () => inkPop(x - 2, y - 6)
        }, '<');
      } else {
        tl.to({}, { duration: spacePause() }, '<');
      }

      tl.to({}, { duration: writePause() });
    });

    tl.to({}, { duration: 0.55 });

    /* ERASE */
    tl.to(pencil, {
      rotation: 18,
      duration: 0.18,
      transformOrigin: ERASER_ORIGIN,
      ease: 'power2.out'
    });

    [...chars].reverse().forEach(ch => {
      const isSpace = ch.textContent?.trim() === '';
      const { x, y } = posOfChar(ch);

      tl.to(pencil, {
        x: x - ERASER_X,
        y: y - CONTACT_Y + rand(1.2, 1.8),
        duration: eraseDur(),
        ease: 'power2.inOut',
        onStart: () => {
          placeCaret(x + 2, y - 10);
          if (!isSpace && (gsap.getProperty(ch, 'opacity') as number) > 0.2) {
            dustPuff(x - 6, y - 6);
          }
        }
      });

      if (!isSpace) {
        tl.to(ch, {
          opacity: 0,
          filter: 'blur(6px)',
          y: rand(-1.5, -0.5),
          scale: 0.985,
          duration: 0.08,
          ease: 'power2.out'
        }, '<');
      }
    });

    tl.set(chars, { y: 2, scale: 0.98, filter: 'blur(5px)' });

    tl.to(pencil, {
      x: 0,
      y: 0,
      rotation: baseWriteRot,
      transformOrigin: TIP_ORIGIN,
      duration: 0.35,
      ease: 'power2.out'
    });

    tl.to({}, { duration: 0.35 });
  }
}
