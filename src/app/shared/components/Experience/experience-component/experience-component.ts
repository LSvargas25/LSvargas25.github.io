import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import confetti from 'canvas-confetti';
import { RESUME_DATA } from '../../../data/resume.data';

type TimelineType = 'work' | 'education';

type TimelineItem = {
  start: string;
  end?: string;
  /** Renders the translated "Present" label instead of `end` */
  current?: boolean;
  /** Plain text title (company / institution) or an i18n key */
  title: string;
  titleIsKey: boolean;
  subtitle: string;
  subtitleIsKey: boolean;
  /** i18n key pointing to an array of bullet strings */
  bulletsKey?: string;
  /** i18n key for a single highlighted note (e.g. graduated with honors) */
  noteKey?: string;
  type: TimelineType;
  expanded?: boolean;
};

@Component({
  selector: 'app-experience-component',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './experience-component.html',
  styleUrl: './experience-component.scss',
})
export class ExperienceComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('timelineLine') timelineLine!: ElementRef;
  private timelineObserver?: IntersectionObserver;

  isMobile = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreen();
    }
  }

  // ================= MASTER TIMELINE =================
  // Single source of truth: resume.data.ts (the same data the CV sheet uses).
  // Only formal degrees appear here; certifications and courses stay in the CV.

  private timeline: TimelineItem[] = [
    ...RESUME_DATA.education
      .filter(edu => edu.degree)
      .map((edu): TimelineItem => ({
        start: edu.year,
        title: edu.titleKey,
        titleIsKey: true,
        subtitle: edu.institution,
        subtitleIsKey: false,
        noteKey: edu.honors ? 'resume.honors' : undefined,
        type: 'education'
      })),
    ...RESUME_DATA.experience.map((job): TimelineItem => ({
      start: job.dateRange.start,
      end: job.dateRange.end,
      current: job.dateRange.current,
      title: job.company,
      titleIsKey: false,
      subtitle: job.roleKey,
      subtitleIsKey: true,
      bulletsKey: job.bulletsKey,
      type: 'work'
    }))
  ];

  /** The translate pipe hands back arrays for bullet keys; anything else renders nothing */
  asList(value: unknown): string[] {
    return Array.isArray(value) ? value : [];
  }

  // ================= FILTERED ARRAYS =================

  workTimeline: TimelineItem[] = [];
  educationTimeline: TimelineItem[] = [];

  // ================= LIFECYCLE =================

  ngOnInit() {
    this.workTimeline = this.timeline.filter(t => t.type === 'work');
    this.educationTimeline = this.timeline.filter(t => t.type === 'education');
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.timelineLine) {

      this.timelineObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.timelineLine.nativeElement.classList.add('animate-line');
            }
          });
        },
        { threshold: 0.3 }
      );

      this.timelineObserver.observe(this.timelineLine.nativeElement);
    }
  }

  // ================= RESPONSIVE =================

  @HostListener('window:resize')
  checkScreen() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 900;
    }
  }

  // ================= MOBILE EXPAND =================

  toggle(item: TimelineItem) {
    if (this.isMobile) {
      const wasExpanded = item.expanded;
      item.expanded = !item.expanded;

      // Lanzar confeti al expandir
      if (item.expanded && !wasExpanded) {
        this.launchConfettiForItem();
      }
    }
  }

  // ================= CONFETTI =================

  private launchConfettiForItem() {
    if (isPlatformBrowser(this.platformId)) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#CBB994', '#a08b60', '#d4c5a0', '#e8d9bf', '#ffd700'],
        startVelocity: 25,
        gravity: 0.9,
        scalar: 0.8
      });
    }
  }

  onWorkPointHover(event: MouseEvent, item: TimelineItem) {
    if (isPlatformBrowser(this.platformId) && !this.isMobile) {
      const element = event.target as HTMLElement;
      const rect = element.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: ['#CBB994', '#a08b60', '#d4c5a0', '#e8d9bf'],
        startVelocity: 20,
        gravity: 0.8,
        scalar: 0.7
      });
    }
  }

  onEducationHover(event: MouseEvent, item: TimelineItem) {
    if (isPlatformBrowser(this.platformId)) {
      const element = event.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x, y },
        colors: ['#CBB994', '#a08b60', '#d4c5a0', '#e8d9bf', '#ffd700'],
        startVelocity: 25,
        gravity: 0.9,
        scalar: 0.8,
        shapes: ['circle', 'square']
      });
    }
  }

  // ================= CLEANUP =================

  ngOnDestroy() {
    if (this.timelineObserver) {
      this.timelineObserver.disconnect();
    }
  }
}
