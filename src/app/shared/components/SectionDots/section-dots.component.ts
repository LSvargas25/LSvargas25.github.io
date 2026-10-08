import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FullPageScrollService } from '../../services/full-page-scroll.service';

/** Side navigation dots for the desktop full-page mode (one per slide). */
@Component({
  selector: 'app-section-dots',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (fullPage.enabled()) {
      <nav class="fp-dots" [attr.aria-label]="'nav.sectionsNav' | translate">
        @for (section of fullPage.sections; track section.id; let i = $index) {
          <button
            type="button"
            class="fp-dot"
            [class.active]="fullPage.activeIndex() === i"
            [attr.aria-label]="'nav.goTo' | translate: { section: (section.labelKey | translate) }"
            [attr.aria-current]="fullPage.activeIndex() === i ? 'true' : null"
            (click)="fullPage.goTo(i)">
            <span class="fp-dot-label" aria-hidden="true">{{ section.labelKey | translate }}</span>
          </button>
        }
      </nav>
    }
  `,
  styles: [`
    .fp-dots {
      position: fixed;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      z-index: 900; /* above content, below navbar toggle (1000) and modals (9998+) */
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .fp-dot {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 9999px;
    }

    /* The visible dot */
    .fp-dot::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: rgba(111, 98, 86, 0.35);
      box-shadow: 0 0 0 1px rgba(184, 155, 106, 0.35);
      transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }

    .fp-dot:hover::before {
      background: rgba(184, 155, 106, 0.75);
      transform: scale(1.25);
    }

    .fp-dot.active::before {
      background: linear-gradient(135deg, #B89B6A, #D4AF37);
      transform: scale(1.5);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.55);
    }

    .fp-dot:focus-visible {
      outline: 2px solid #D4AF37;
      outline-offset: 1px;
    }

    /* Discreet label that slides in on hover / keyboard focus */
    .fp-dot-label {
      position: absolute;
      right: calc(100% + 0.4rem);
      white-space: nowrap;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      color: #6F6256;
      background: rgba(255, 253, 249, 0.92);
      border: 1px solid rgba(184, 155, 106, 0.3);
      box-shadow: 0 6px 18px -8px rgba(111, 98, 86, 0.35);
      opacity: 0;
      transform: translateX(6px);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .fp-dot:hover .fp-dot-label,
    .fp-dot:focus-visible .fp-dot-label {
      opacity: 1;
      transform: translateX(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .fp-dot::before,
      .fp-dot-label {
        transition: none;
      }
    }
  `]
})
export class SectionDotsComponent {
  readonly fullPage = inject(FullPageScrollService);
}
