import {
  Component, ElementRef, ViewChild,
  AfterViewInit, OnDestroy, NgZone,
  PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { BaseProjectModalComponent } from '../../Modals/base-project-modal/base-project-modal.component/base-project-modal.component';
import { CaseStudyComponent } from '../case-study/case-study.component';
import { PROJECTS } from '../../../data/projects.data';
import { ProjectCaseStudy } from '../../../data/projects.model';

@Component({
  selector: 'app-projects-component',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LucideAngularModule,
    BaseProjectModalComponent,
    CaseStudyComponent
  ],
  templateUrl: './projects-component.html',
  styleUrls: ['./projects-component.scss']
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {

  /** Carousel order = array order in projects.data.ts; hidden projects stay out */
  readonly projects = PROJECTS.filter(p => !p.hidden);
  /** The track renders the set twice so the loop can wrap seamlessly */
  readonly carouselSets = [0, 1] as const;

  selectedProject: ProjectCaseStudy | null = null;

  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLElement>;
  @ViewChild('carouselOuter') carouselOuter!: ElementRef<HTMLElement>;

  private scrollPosition  = 0;
  private animationFrame?: number;
  private currentSpeed    = 0;
  private targetSpeed     = 0.55;

  private isOverCard      = false;
  private isOverArrow     = false;

  private isVisible       = true;
  private visibilityObserver?: IntersectionObserver;

  /** Pixels still to travel from an arrow tap / focused card, eased in the loop */
  private nudge           = 0;
  private dragging        = false;
  private dragLastX       = 0;
  private dragMoved       = 0;
  /** A swipe must not end up opening the card under the finger */
  private suppressClick   = false;
  private reducedMotion   = false;
  private removeListeners: Array<() => void> = [];

  private readonly BASE_SPEED = 0.55;
  private readonly MAX_BOOST  = 3.5;
  private readonly DEAD_ZONE  = 0.15;
  private readonly LERP       = 0.06;
  private readonly LERP_STOP  = 0.12;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Respect reduced motion: no auto-drift, arrows and swipe still work
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (this.reducedMotion) this.targetSpeed = 0;

    this.ngZone.runOutsideAngular(() => {
      this.loop();
      this.bindSwipe();

      const target = this.carouselOuter?.nativeElement;
      if (target && 'IntersectionObserver' in window) {
        this.visibilityObserver = new IntersectionObserver(
          entries => {
            const wasVisible = this.isVisible;
            this.isVisible = entries.some(e => e.isIntersecting);

            // Loop stops scheduling new frames while hidden; resume it here.
            if (this.isVisible && !wasVisible) {
              this.loop();
            }
          },
          { threshold: 0 }
        );
        this.visibilityObserver.observe(target);
      }
    });
  }

  ngOnDestroy() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.visibilityObserver?.disconnect();
    this.removeListeners.forEach(off => off());
  }

  /** Drift speed when nothing is interacting with the carousel */
  private get idleSpeed(): number {
    return this.reducedMotion ? 0 : this.BASE_SPEED;
  }

  // ── Touch / pen swipe (native listeners, outside Angular) ──

  private bindSwipe() {
    const viewport = this.carouselOuter?.nativeElement.querySelector('.carousel-viewport') as HTMLElement | null;
    if (!viewport) return;

    const listen = <K extends keyof WindowEventMap>(target: EventTarget, type: K, fn: (e: WindowEventMap[K]) => void) => {
      target.addEventListener(type, fn as EventListener, { passive: true });
      this.removeListeners.push(() => target.removeEventListener(type, fn as EventListener));
    };

    listen(viewport, 'pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return; // mouse keeps the hover steering
      this.dragging = true;
      this.dragLastX = e.clientX;
      this.dragMoved = 0;
      this.nudge = 0;
      this.currentSpeed = 0;
      this.targetSpeed = 0;
    });
    listen(window, 'pointermove', (e: PointerEvent) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.dragLastX;
      this.dragLastX = e.clientX;
      this.scrollPosition -= dx;
      this.dragMoved += Math.abs(dx);
    });
    const end = () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.suppressClick = this.dragMoved > 8;
      this.targetSpeed = this.idleSpeed;
    };
    listen(window, 'pointerup', end);
    listen(window, 'pointercancel', end);
  }

  /** One card plus the gap: what an arrow tap moves */
  private cardStep(): number {
    const track = this.carouselTrack?.nativeElement;
    const card = track?.querySelector('.project-card') as HTMLElement | null;
    if (!track || !card) return 288;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.offsetWidth + gap;
  }

  // ── Arrow taps / clicks / keyboard ───────────

  onArrowClick(dir: 'left' | 'right') {
    this.nudge += (dir === 'left' ? -1 : 1) * this.cardStep();
  }

  // ── Carousel mouse handlers ──────────────────

  // Hover steering is mouse-only: touch screens emulate mouse events after a tap
  // and never send the matching "leave", which would leave the carousel boosted.
  onCarouselMouseMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || this.isOverCard || this.isOverArrow) return;

    const outer = event.currentTarget as HTMLElement;
    const rect  = outer.getBoundingClientRect();
    const relX  = (event.clientX - rect.left) / rect.width;
    const half  = 0.5;

    if (relX < half - this.DEAD_ZONE) {
      const intensity  = (half - this.DEAD_ZONE - relX) / (half - this.DEAD_ZONE);
      this.targetSpeed = -(this.BASE_SPEED + intensity * this.MAX_BOOST);
    } else if (relX > half + this.DEAD_ZONE) {
      const intensity  = (relX - half - this.DEAD_ZONE) / (half - this.DEAD_ZONE);
      this.targetSpeed = this.BASE_SPEED + intensity * this.MAX_BOOST;
    } else {
      this.targetSpeed = this.idleSpeed;
    }
  }

  onCarouselMouseLeave() {
    this.isOverCard  = false;
    this.isOverArrow = false;
    this.targetSpeed = this.idleSpeed;
  }

  // ── Arrow hover handlers ─────────────────────

  onArrowEnter(dir: 'left' | 'right', event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    this.isOverArrow = true;
    this.isOverCard  = false;
    this.targetSpeed = dir === 'left'
      ? -(this.BASE_SPEED + this.MAX_BOOST)
      :   (this.BASE_SPEED + this.MAX_BOOST);
  }

  onArrowLeave() {
    this.isOverArrow = false;
    this.targetSpeed = this.idleSpeed;
  }

  // ── Card hover handlers ──────────────────────

  onCardMouseEnter(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    this.isOverCard  = true;
    this.targetSpeed = 0;
  }

  onCardMouseLeave() {
    this.isOverCard  = false;
    this.targetSpeed = this.idleSpeed;
  }

  /** Keyboard focus inside a card: stop and bring the card to the centre of the viewport */
  onCardFocus(event: FocusEvent) {
    const card = event.currentTarget as HTMLElement;
    const viewport = this.carouselOuter?.nativeElement.querySelector('.carousel-viewport') as HTMLElement | null;
    if (!viewport) return;
    this.isOverCard = true;
    this.targetSpeed = 0;
    const centred = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    this.nudge = centred - this.scrollPosition;
  }

  onCardBlur() {
    this.isOverCard = false;
    this.targetSpeed = this.idleSpeed;
  }

  // ── RAF loop ─────────────────────────────────

  private loop() {
    // Stop scheduling frames while the carousel is off-screen (e.g. the user
    // is reading Contact). The IntersectionObserver restarts the loop once
    // it becomes visible again.
    if (!this.isVisible) return;

    const track = this.carouselTrack?.nativeElement;

    if (track) {
      const halfWidth = track.scrollWidth / 2;

      const lerp = this.isOverCard ? this.LERP_STOP : this.LERP;
      this.currentSpeed   += (this.targetSpeed - this.currentSpeed) * lerp;
      if (!this.dragging) this.scrollPosition += this.currentSpeed;

      // Ease out any pending arrow / focus movement
      if (this.nudge !== 0) {
        const step = Math.abs(this.nudge) < 0.5 ? this.nudge : this.nudge * 0.16;
        this.scrollPosition += step;
        this.nudge -= step;
      }

      if (this.scrollPosition >= halfWidth) this.scrollPosition -= halfWidth;
      if (this.scrollPosition <  0)         this.scrollPosition += halfWidth;

      track.style.transform = `translateX(-${this.scrollPosition}px)`;
    }

    this.animationFrame = requestAnimationFrame(() => this.loop());
  }

  // ── Modals ───────────────────────────────────

  openModal(project: ProjectCaseStudy) {
    this.selectedProject = project;
  }

  onCardClick(project: ProjectCaseStudy) {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.openModal(project);
  }

  /** Card "View code" button: the single repo, else the primary one (both are linked in the case study) */
  codeUrl(project: ProjectCaseStudy): string | undefined {
    const { repo, backendRepo, frontendRepo, primaryRepo } = project.links;
    return repo ?? (primaryRepo === 'frontend' ? frontendRepo ?? backendRepo : backendRepo ?? frontendRepo);
  }

  closeModal() {
    this.selectedProject = null;
  }
}
