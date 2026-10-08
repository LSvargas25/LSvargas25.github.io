import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { RESUME_DATA } from '../../../data/resume.data';

/**
 * Experience section: two equal columns, Education and Work experience.
 * Single source of truth: resume.data.ts (the same data the CV sheet uses).
 * Only formal degrees appear here; certifications and courses stay in the CV.
 */
@Component({
  selector: 'app-experience-component',
  standalone: true,
  imports: [TranslateModule, LucideAngularModule],
  templateUrl: './experience-component.html',
  styleUrl: './experience-component.scss',
})
export class ExperienceComponent {
  readonly education = RESUME_DATA.education.filter(edu => edu.degree);
  readonly jobs = RESUME_DATA.experience;

  /** Highlights always visible on a job card; the rest open with "Show more" */
  readonly visibleHighlights = 3;

  private readonly openJobs = signal<ReadonlySet<string>>(new Set());

  isOpen(id: string): boolean {
    return this.openJobs().has(id);
  }

  toggle(id: string): void {
    this.openJobs.update(open => {
      const next = new Set(open);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  /** The translate pipe hands back arrays for bullet keys; anything else renders nothing */
  asList(value: unknown): string[] {
    return Array.isArray(value) ? value : [];
  }
}
