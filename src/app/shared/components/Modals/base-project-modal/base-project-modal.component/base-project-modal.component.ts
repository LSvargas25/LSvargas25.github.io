import { Component, Input, Output, EventEmitter, input, OnChanges, SimpleChanges, OnDestroy, Inject, PLATFORM_ID, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgIf, NgClass, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-base-project-modal',
  standalone: true,
  imports: [NgIf, NgClass, TranslateModule],
  templateUrl: './base-project-modal.component.html',
  styleUrls: ['./base-project-modal.component.scss']
})
export class BaseProjectModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  readonly closeButtonTopClass = input('top-16 right-80');
  /** id of the element that names the dialog (aria-labelledby) */
  readonly labelledBy = input<string>('');

  @Output() closed = new EventEmitter<void>();

  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;

  private scrollY = 0;
  /** Element focused before opening, so focus can return to it on close */
  private previousFocus: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.previousFocus = document.activeElement as HTMLElement | null;
        this.scrollY = window.scrollY;
        document.body.appendChild(this.el.nativeElement);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollY}px`;
        document.body.style.width = '100%';
        // The overlay is rendered by *ngIf on the next change detection pass
        setTimeout(() => this.closeButton?.nativeElement.focus({ preventScroll: true }));
      } else if (!changes['isOpen'].firstChange) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, this.scrollY);
        this.previousFocus?.focus({ preventScroll: true });
        this.previousFocus = null;
      }
    }
  }

  ngOnDestroy(): void {
    // Only undo the scroll lock if this modal is the one holding it
    if (isPlatformBrowser(this.platformId) && this.isOpen) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, this.scrollY);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) this.close();
  }

  /** Keep Tab / Shift+Tab inside the open dialog */
  @HostListener('document:keydown.tab', ['$event'])
  @HostListener('document:keydown.shift.tab', ['$event'])
  onTab(event: Event) {
    if (!this.isOpen) return;
    const dialog = this.el.nativeElement.querySelector('[role="dialog"]') as HTMLElement | null;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null || el === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const backwards = (event as KeyboardEvent).shiftKey;
    if (!active || !dialog.contains(active)) {
      event.preventDefault();
      first.focus();
    } else if (backwards && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!backwards && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close() {
    this.closed.emit();
  }

  stop(event: MouseEvent) {
    event.stopPropagation();
  }
}
