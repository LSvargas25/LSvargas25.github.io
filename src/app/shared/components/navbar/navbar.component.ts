import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ResumeSheetService } from '../../services/resume-sheet.service';
import { FullPageScrollService } from '../../services/full-page-scroll.service';
import { LANG_STORAGE_KEY } from '../../../core/language';

type NavbarLanguage = { code: 'es' | 'en'; flag: string; labelKey: string };

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {

  showNavbar = true;

  /** Mobile/tablet menu (below the lg breakpoint, where the links don't fit in one row) */
  menuOpen = false;
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('mobileMenu') private mobileMenu?: ElementRef<HTMLElement>;

  private readonly fullPage = inject(FullPageScrollService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly sections = this.fullPage.sections;

  languages: NavbarLanguage[] = [
    { code: 'es', flag: '🇨🇷', labelKey: 'nav.lang.es' },
    { code: 'en', flag: '🇺🇸', labelKey: 'nav.lang.en' }
  ];

  currentLang: 'es' | 'en' = 'es';

  activeSection = 'hero';
  highlightProfile = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private translate: TranslateService,
    private resumeSheet: ResumeSheetService
  ) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang === 'en' ? 'en' : 'es';

    setTimeout(() => {
      this.highlightProfile = false;
      this.cdr.markForCheck();
    }, 2500);
  }

  setLanguage(lang: 'es' | 'en') {
    this.useLanguage(lang);
  }

  private useLanguage(lang: 'es' | 'en') {
    this.currentLang = lang;
    this.translate.use(lang);

    if (this.isBrowser) {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {
        /* storage blocked: the choice lasts for this visit only */
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.ngZone.runOutsideAngular(() => {
      this.highlightProfile = true;
      this.cdr.markForCheck();

      setTimeout(() => {
        this.highlightProfile = false;
        this.cdr.markForCheck();
      }, 1200);

      for (const section of this.sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom > 80) {
            this.activeSection = section.id;
            this.cdr.markForCheck();
            break;
          }
        }
      }
    });
  }

  /** Full-page mode owns the active slide; otherwise the scroll listener decides. */
  isActive(id: string): boolean {
    return this.fullPage.enabled()
      ? this.sections[this.fullPage.activeIndex()]?.id === id
      : this.activeSection === id;
  }

  scrollToSection(id: string) {
    this.closeMenu();
    // Full-page mode animates to the slide; otherwise smooth scrollIntoView
    // (offset from each section's scroll-margin-top).
    this.fullPage.goTo(id);
  }

  toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu(true);
      return;
    }
    this.menuOpen = true;
    // Move focus into the menu once it has rendered
    if (this.isBrowser) {
      setTimeout(() => this.mobileMenu?.nativeElement.querySelector<HTMLElement>('a, button')?.focus());
    }
  }

  closeMenu(returnFocus = false): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    if (returnFocus && this.isBrowser) this.menuButton?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu(true);
  }

  /** Back on a wide screen the inline links take over: drop the open panel */
  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser && window.innerWidth >= 1024) this.closeMenu();
  }

  toggleNavbar() {
    this.closeMenu();
    this.showNavbar = !this.showNavbar;
    if (!this.isBrowser) return;
    // Hidden navbar → --nav-h: 0, so the layout no longer reserves its 80px
    document.documentElement.classList.toggle('nav-hidden', !this.showNavbar);
    requestAnimationFrame(() => this.fullPage.onLayoutChange());
  }

  openResume(trigger: HTMLElement): void {
    this.closeMenu();
    this.resumeSheet.open(trigger);
  }
}
