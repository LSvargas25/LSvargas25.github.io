import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { RESUME_DATA } from '../data/resume.data';

export type ResumeDownloadState = 'idle' | 'loading' | 'done';

/**
 * Owns the resume sheet's open/closed state and the PDF download
 * state machine. Lives at root so the sticky note (which triggers
 * the sheet) and the resume sheet itself (rendered at app-root
 * level, outside the note's transform/filter context) can share it
 * without any parent/child relationship.
 */
@Injectable({ providedIn: 'root' })
export class ResumeSheetService {
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

  readonly isOpen = signal(false);
  readonly downloadState = signal<ResumeDownloadState>('idle');

  private triggerEl: HTMLElement | null = null;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private doneTimer: ReturnType<typeof setTimeout> | null = null;

  open(trigger?: HTMLElement | null): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.triggerEl = trigger ?? null;
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  /** Called by the sheet once its close animation finishes. */
  returnFocusToTrigger(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.triggerEl?.focus?.();
  }

  downloadResume(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.downloadState() === 'loading') return;

    this.downloadState.set('loading');

    const pdf = RESUME_DATA.pdf[this.translate.currentLang === 'en' ? 'en' : 'es'];
    const a = document.createElement('a');
    a.href = pdf.path;
    a.download = pdf.fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    /* Success feedback (browser has no true download-complete event) */
    if (this.doneTimer) clearTimeout(this.doneTimer);
    this.doneTimer = setTimeout(() => {
      this.downloadState.set('done');

      if (this.resetTimer) clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => {
        this.downloadState.set('idle');
      }, 2600);
    }, 520);
  }

  clearTimers(): void {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    if (this.doneTimer) clearTimeout(this.doneTimer);
    this.resetTimer = null;
    this.doneTimer = null;
  }
}
