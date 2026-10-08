import {
  Component,
  AfterViewInit,
  NgZone,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ProfileCardComponent } from './ProfileCard/profile-card-component/profile-card-component';
import { NoteComponent } from './FloatingNotes/Note 1/note/note';
import { ProfileComponent } from '../../shared/components/Profile/ProfileComponent/profile-component/profile-component';
import { ProjectsComponent } from '../../shared/components/Projects/projects-component/projects-component';
import { ContactComponent } from '../../shared/components/Contact/contact-component/contact-component';
import { ExperienceComponent } from "../../shared/components/Experience/experience-component/experience-component";
import { SectionDotsComponent } from '../../shared/components/SectionDots/section-dots.component';
import { FullPageScrollService } from '../../shared/services/full-page-scroll.service';
import { RESUME_DATA } from '../../shared/data/resume.data';

declare const window: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ProfileCardComponent,
    NoteComponent,
    ProfileComponent,
    ProjectsComponent,
    ContactComponent,
    ExperienceComponent,
    SectionDotsComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  /** Contact links come from the CV data so the card, footer and CV sheet never drift apart */
  readonly contact = RESUME_DATA.contact;
  readonly whatsappUrl = `https://wa.me/${RESUME_DATA.contact.phoneHref.replace(/\D/g, '')}`;


  private langSub?: Subscription;
  private sectionObserver?: IntersectionObserver;
  private typewriterStarted = false;
  private readonly fullPage = inject(FullPageScrollService);

  constructor(
    private ngZone: NgZone,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  /* ===================== TYPEWRITER ===================== */

  words: string[] = [];

  private currentWordIndex = 0;
  private currentCharIndex = 0;
  private isDeleting = false;

  typingSpeed = 100;
  deletingSpeed = 60;
  pauseAfterTyping = 1200;

  /* ===================== LIFECYCLE ===================== */

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadTypewriterWords();
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.loadTypewriterWords();
    });

    this.setupScrollAnimations();
    this.fullPage.init();
  }

  ngOnDestroy(): void {
    this.fullPage.destroy();
    this.sectionObserver?.disconnect();
    this.langSub?.unsubscribe();
  }

  private setupScrollAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const attempt = (retries = 0) => {
      const sections = Array.from(
        document.querySelectorAll('.scroll-section')
      ) as HTMLElement[];

      if (sections.length < 4 && retries < 10) {
        setTimeout(() => attempt(retries + 1), 200);
        return;
      }

      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            // Reveal once: sections stay visible after their first entrance
            if (entry.isIntersecting) {
              entry.target.classList.remove('section-hidden');
              entry.target.classList.add('section-visible');
              this.sectionObserver?.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          threshold: [0, 0.05],
          rootMargin: '0px 0px 0px 0px'
        }
      );

      sections.forEach(s => this.sectionObserver!.observe(s));
    };

    attempt();
  }

  private loadTypewriterWords(): void {
    this.translate.get('home.typewriter.words').subscribe((value: unknown) => {
      this.words = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
      this.currentWordIndex = 0;
      this.currentCharIndex = 0;
      this.isDeleting = false;

      const element = document.getElementById('typewriter');
      if (element) {
        element.textContent = '';
      }

      if (!this.typewriterStarted && this.words.length > 0) {
        this.typewriterStarted = true;
        this.startTypewriter();
      }
    });
  }

  /* ===================== TYPEWRITER ===================== */

  private startTypewriter(): void {
    const element = document.getElementById('typewriter');
    if (!element) return;

    if (!this.words.length) return;

    const loop = () => {
      const word = this.words[this.currentWordIndex];

      if (!word) {
        setTimeout(loop, this.typingSpeed);
        return;
      }

      if (!this.isDeleting) {
        element.textContent = word.substring(0, this.currentCharIndex + 1);
        this.currentCharIndex++;

        if (this.currentCharIndex === word.length) {
          setTimeout(() => (this.isDeleting = true), this.pauseAfterTyping);
        }
      } else {
        element.textContent = word.substring(0, this.currentCharIndex - 1);
        this.currentCharIndex--;

        if (this.currentCharIndex === 0) {
          this.isDeleting = false;
          this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
        }
      }

      setTimeout(loop, this.isDeleting ? this.deletingSpeed : this.typingSpeed);
    };

    loop();
  }
}
