import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SKILL_CATEGORIES, SOFT_SKILLS_KEY } from '../../../../data/skills.data';

@Component({
  selector: 'app-profile-component',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss',
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('profileSection', { static: false }) profileSection!: ElementRef<HTMLElement>;
  private intersectionObserver!: IntersectionObserver;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  /** Technology grid; every logo appears once (see skills.data.ts) */
  readonly categories = SKILL_CATEGORIES;
  readonly softSkillsKey = SOFT_SKILLS_KEY;

  /** The translate pipe hands back the soft-skills array; anything else renders nothing */
  asList(value: unknown): string[] {
    return Array.isArray(value) ? value : [];
  }

  ngOnInit(): void {
    // Initialize IntersectionObserver after component init
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollRevealAnimation();
    }
  }

  private setupScrollRevealAnimation(): void {
    if (!this.profileSection?.nativeElement) return;

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.25,
      rootMargin: '0px 0px -50px 0px',
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is entering viewport
          entry.target.classList.add('is-visible');
        } else {
          // Element is leaving viewport
          entry.target.classList.remove('is-visible');
        }
      });
    }, observerOptions);

    this.intersectionObserver.observe(this.profileSection.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
