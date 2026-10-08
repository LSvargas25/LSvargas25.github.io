import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
// 'gsap/all' instead of 'gsap/Observer': on Windows the per-plugin path collides
// with gsap's own types/observer.d.ts (TS1149, casing). gsap is sideEffects:false,
// so only these two plugins end up in the bundle.
import { Observer, ScrollToPlugin } from 'gsap/all';

export interface FullPageSection {
  id: string;
  labelKey: string;
}

/**
 * Desktop "slide" navigation: one wheel gesture / key press moves exactly one
 * section, animated with GSAP ScrollToPlugin over the native document scroll
 * (so modals, Vanta's ScrollTrigger and IntersectionObservers keep working).
 *
 * Only active at >= 1024px wide and >= 650px tall; otherwise the page scrolls
 * normally. The last slide is Contact + Footer (its stop is the document end).
 */
@Injectable({ providedIn: 'root' })
export class FullPageScrollService {
  readonly sections: readonly FullPageSection[] = [
    { id: 'hero', labelKey: 'nav.home' },
    { id: 'profile', labelKey: 'nav.profile' },
    { id: 'experience', labelKey: 'nav.experience' },
    { id: 'projects', labelKey: 'nav.projects' },
    { id: 'contact', labelKey: 'nav.contact' },
  ];

  readonly activeIndex = signal(0);
  readonly enabled = signal(false);

  private static readonly MEDIA = '(min-width: 1024px) and (min-height: 650px)';
  private static readonly DURATION = 0.9;
  /** Wheel events closer together than this belong to the same gesture (trackpad inertia). */
  private static readonly GESTURE_GAP_MS = 200;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initialized = false;
  private observer?: Observer;
  private tween?: gsap.core.Tween;
  private mql?: MediaQueryList;
  private reducedMotion?: MediaQueryList;
  private resizeObserver?: ResizeObserver;
  private cleanups: Array<() => void> = [];

  private animating = false;
  private lastWheelAt = 0;
  private gestureId = 0;
  private consumedGestureId = -1;
  private layoutTimer?: ReturnType<typeof setTimeout>;
  private settleTimer?: ReturnType<typeof setTimeout>;

  /* ===================== LIFECYCLE ===================== */

  init(): void {
    if (!this.isBrowser || this.initialized) return;
    this.initialized = true;
    gsap.registerPlugin(Observer, ScrollToPlugin);

    this.mql = window.matchMedia(FullPageScrollService.MEDIA);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onMediaChange = () => this.evaluate();
    this.mql.addEventListener('change', onMediaChange);
    this.listen(window, 'resize', () => this.scheduleLayoutChange());
    // Raw wheel timestamps (passive, capture) to tell gestures apart
    this.listen(window, 'wheel', () => this.trackWheelGesture(), { passive: true, capture: true });
    this.listen(window, 'keydown', e => this.onKeydown(e as KeyboardEvent));
    this.listen(window, 'scroll', () => this.scheduleSettle(), { passive: true });
    this.listen(document, 'click', e => this.onAnchorClick(e as MouseEvent), { capture: true });
    this.listen(document, 'focusin', e => this.onFocusIn(e as FocusEvent));
    this.cleanups.push(() => this.mql?.removeEventListener('change', onMediaChange));

    // Footer height feeds the Contact slide; content size changes (fonts,
    // translations, lazy images) re-align the active slide.
    this.resizeObserver = new ResizeObserver(() => this.scheduleLayoutChange());
    const footer = document.querySelector('app-footer footer');
    if (footer) this.resizeObserver.observe(footer);
    const main = document.getElementById('main-content');
    if (main) this.resizeObserver.observe(main);

    this.updateFooterHeight();
    this.evaluate();
  }

  destroy(): void {
    if (!this.isBrowser || !this.initialized) return;
    this.disable();
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
    this.resizeObserver?.disconnect();
    clearTimeout(this.layoutTimer);
    clearTimeout(this.settleTimer);
    this.initialized = false;
  }

  /* ===================== PUBLIC API ===================== */

  /** Animated jump to a section by index or id. Falls back to native scrolling when disabled. */
  goTo(target: number | string): void {
    if (!this.isBrowser) return;
    const index = typeof target === 'number' ? target : this.sections.findIndex(s => s.id === target);
    if (index < 0 || index >= this.sections.length) return;

    if (!this.enabled()) {
      document.getElementById(this.sections[index].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (this.animating && index === this.activeIndex()) return;
    this.animateTo(index, this.slideStart(index));
  }

  next(): void { this.step(1); }
  prev(): void { this.step(-1); }

  /** Call after anything that changes the layout height (e.g. navbar shown/hidden). */
  onLayoutChange(): void {
    if (!this.isBrowser || !this.initialized) return;
    this.updateFooterHeight();
    if (this.enabled() && !this.animating && !this.isModalOpen()) this.realign();
  }

  /* ===================== ENABLE / DISABLE ===================== */

  private evaluate(): void {
    const shouldEnable = !!this.mql?.matches;
    if (shouldEnable === this.enabled()) {
      if (shouldEnable) this.onLayoutChange();
      return;
    }
    shouldEnable ? this.enable() : this.disable();
  }

  private enable(): void {
    document.documentElement.classList.add('fp-on');
    this.enabled.set(true);

    this.observer = Observer.create({
      target: window,
      type: 'wheel',
      preventDefault: true,
      tolerance: 6,
      // Ignored events keep their native behaviour (checked before preventDefault):
      // pinch/ctrl-zoom and anything while a modal/CV sheet is open.
      ignoreCheck: (e: Event) => (e as WheelEvent).ctrlKey || this.isModalOpen(),
      // Horizontal-dominant swipes are swallowed (the page has no horizontal scroll)
      onChange: self => {
        if (Math.abs(self.deltaX) > Math.abs(self.deltaY)) return;
        this.onWheelDelta(self.deltaY);
      },
    });

    // Layout just switched to slide mode: snap to the nearest section after it settles
    requestAnimationFrame(() => {
      this.activeIndex.set(this.nearestIndex(window.scrollY));
      this.realign();
      this.reveal(this.activeIndex());
    });
  }

  private disable(): void {
    this.observer?.kill();
    this.observer = undefined;
    this.tween?.kill();
    this.tween = undefined;
    this.animating = false;
    document.documentElement.classList.remove('fp-on');
    this.enabled.set(false);
  }

  /* ===================== INPUT ===================== */

  private trackWheelGesture(): void {
    const now = performance.now();
    if (now - this.lastWheelAt > FullPageScrollService.GESTURE_GAP_MS) this.gestureId++;
    this.lastWheelAt = now;
  }

  private onWheelDelta(deltaY: number): void {
    if (!this.enabled() || deltaY === 0) return;
    // Locked while animating: the whole gesture (incl. inertia tail) is spent
    if (this.animating) {
      this.consumedGestureId = this.gestureId;
      return;
    }

    const dir = deltaY > 0 ? 1 : -1;
    const i = this.activeIndex();

    // Last-resort internal scroll for a slide taller than the viewport
    const start = this.slideStart(i);
    const end = start + this.slideExcess(i);
    const y = window.scrollY;
    if ((dir > 0 && y < end - 1) || (dir < 0 && y > start + 1)) {
      window.scrollTo(0, Math.min(end, Math.max(start, y + deltaY)));
      this.consumedGestureId = this.gestureId; // reaching the edge needs a new gesture to move on
      return;
    }

    if (this.consumedGestureId === this.gestureId) return;
    this.consumedGestureId = this.gestureId;
    this.step(dir);
  }

  private onKeydown(e: KeyboardEvent): void {
    if (!this.enabled() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (this.isModalOpen()) return;

    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) {
      // Typing keys stay native. PageUp/PageDown would scroll the document when
      // the field can't scroll itself, so keep them inside the field.
      if (e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault();
        if (target instanceof HTMLTextAreaElement) {
          target.scrollTop += (e.key === 'PageDown' ? 1 : -1) * target.clientHeight;
        }
      }
      return;
    }

    let action: (() => void) | null = null;
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        action = () => this.step(1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        action = () => this.step(-1);
        break;
      case ' ':
      case 'Spacebar':
        // Space activates focused buttons/links: leave it alone there
        if (target?.closest('button, a, [role="button"], summary')) return;
        action = () => this.step(e.shiftKey ? -1 : 1);
        break;
      case 'Home':
        action = () => this.goTo(0);
        break;
      case 'End':
        action = () => this.goTo(this.sections.length - 1);
        break;
    }
    if (!action) return;
    e.preventDefault();
    if (!this.animating) action();
  }

  /** In-page anchors (footer links, skip links to sections) use the slide animation. */
  private onAnchorClick(e: MouseEvent): void {
    if (!this.enabled() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const link = (e.target as HTMLElement | null)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
    const index = link ? this.sections.findIndex(s => `#${s.id}` === link.getAttribute('href')) : -1;
    if (index < 0) return;
    e.preventDefault();
    this.goTo(index);
  }

  /** Keyboard focus moving into another section brings that slide into place. */
  private onFocusIn(e: FocusEvent): void {
    if (!this.enabled() || this.isModalOpen()) return;
    const el = e.target as HTMLElement | null;
    if (!el || el.closest('#main-navbar, app-section-dots')) return;
    const index = this.sections.findIndex(s => {
      const section = document.getElementById(s.id);
      return !!section && section.contains(el);
    });
    const footer = document.querySelector('app-footer');
    const resolved = index >= 0 ? index : footer?.contains(el) ? this.sections.length - 1 : -1;
    if (resolved >= 0 && resolved !== this.activeIndex()) this.goTo(resolved);
  }

  /* ===================== ANIMATION ===================== */

  private step(dir: number): void {
    const target = this.activeIndex() + dir;
    if (target < 0 || target >= this.sections.length) return;
    // Entering a tall slide from below lands on its bottom edge
    const y = dir < 0 ? this.slideStart(target) + this.slideExcess(target) : this.slideStart(target);
    this.animateTo(target, y);
  }

  private animateTo(index: number, y: number, duration = FullPageScrollService.DURATION): void {
    this.tween?.kill();
    this.animating = true;
    this.activeIndex.set(index);
    this.reveal(index);

    if (this.reducedMotion?.matches) duration = 0;
    this.tween = gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => {
        this.animating = false;
        // Whatever gesture drove this jump is spent (ignores its inertia tail)
        this.consumedGestureId = this.gestureId;
      },
    });
  }

  /** Instantly put the active slide back in place (resize, navbar toggle, layout shifts). */
  private realign(): void {
    const i = this.activeIndex();
    const start = this.slideStart(i);
    const end = start + this.slideExcess(i);
    const y = window.scrollY;
    // Keep an internal-scroll position inside a tall slide; otherwise go to the slide start
    const target = y >= start && y <= end ? y : start;
    if (Math.abs(target - y) >= 1) gsap.set(window, { scrollTo: { y: target, autoKill: false } });
  }

  /** Native scrolls we did not drive (find-in-page, focus, restored modal) snap to the closest slide. */
  private scheduleSettle(): void {
    if (!this.enabled()) return;
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      if (!this.enabled() || this.animating || this.isModalOpen()) return;
      const y = window.scrollY;
      const i = this.nearestIndex(y);
      const start = this.slideStart(i);
      const end = start + this.slideExcess(i);
      if (y >= start - 1 && y <= end + 1) {
        if (i !== this.activeIndex()) this.activeIndex.set(i);
        return;
      }
      const nextStart = i + 1 < this.sections.length ? this.slideStart(i + 1) : end;
      const target = y - end < nextStart - y ? i : Math.min(i + 1, this.sections.length - 1);
      const targetY = this.slideStart(target);
      // Small corrections (a stray pixel or two) shouldn't feel like a slide change
      this.animateTo(target, targetY, Math.abs(targetY - y) < 120 ? 0.25 : FullPageScrollService.DURATION);
    }, 160);
  }

  private scheduleLayoutChange(): void {
    clearTimeout(this.layoutTimer);
    this.layoutTimer = setTimeout(() => {
      this.updateFooterHeight();
      this.evaluate();
    }, 150);
  }

  /* ===================== GEOMETRY ===================== */

  private navHeight(): number {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
  }

  /**
   * Bottom of the page by layout. scrollHeight also counts transformed boxes
   * (AOS / reveal translateY), which inflates it until those animations finish.
   */
  private layoutBottom(): number {
    const footer = document.querySelector('app-footer footer') as HTMLElement | null;
    return footer ? this.absTop(footer) + footer.offsetHeight : document.documentElement.scrollHeight;
  }

  private maxScroll(): number {
    return Math.max(0, this.layoutBottom() - window.innerHeight);
  }

  /** Layout position (ignores transforms such as the reveal translateY). */
  private absTop(el: HTMLElement): number {
    let y = 0;
    for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) y += node.offsetTop;
    return y;
  }

  private sectionEl(index: number): HTMLElement | null {
    return document.getElementById(this.sections[index].id);
  }

  /** scrollY at which slide `index` sits right under the navbar. */
  private slideStart(index: number): number {
    const el = this.sectionEl(index);
    if (!el) return 0;
    return Math.min(this.maxScroll(), Math.max(0, this.absTop(el) - this.navHeight()));
  }

  /** How much taller than the viewport the slide is (0 when it fits). */
  private slideExcess(index: number): number {
    const el = this.sectionEl(index);
    if (!el) return 0;
    const isLast = index === this.sections.length - 1;
    const height = isLast ? this.layoutBottom() - this.absTop(el) : el.offsetHeight;
    const available = window.innerHeight - this.navHeight();
    return Math.max(0, Math.min(Math.round(height - available), this.maxScroll() - this.slideStart(index)));
  }

  private nearestIndex(y: number): number {
    let index = 0;
    for (let i = 0; i < this.sections.length; i++) {
      if (this.slideStart(i) <= y + 2) index = i;
    }
    return index;
  }

  private updateFooterHeight(): void {
    const footer = document.querySelector('app-footer footer') as HTMLElement | null;
    document.documentElement.style.setProperty('--footer-h', `${footer?.offsetHeight ?? 0}px`);
  }

  /* ===================== HELPERS ===================== */

  /** Project modals and the CV sheet all lock the page with body { position: fixed }. */
  private isModalOpen(): boolean {
    return document.body.style.position === 'fixed';
  }

  private reveal(index: number): void {
    const el = this.sectionEl(index);
    if (el?.classList.contains('section-hidden')) {
      el.classList.remove('section-hidden');
      el.classList.add('section-visible');
    }
  }

  private listen(
    target: Window | Document,
    type: string,
    handler: (e: Event) => void,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(type, handler, options);
    this.cleanups.push(() => target.removeEventListener(type, handler, options));
  }
}
