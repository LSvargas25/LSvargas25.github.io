import { Component, Input, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';
import {
  ProjectCaseStudy, ProjectStateMachine, ProjectTestKind, ProjectTestSuite
} from '../../../data/projects.model';

/** 'context' is problem → solution shown side by side */
type CaseStudySectionId =
  | 'context' | 'role' | 'architecture'
  | 'decisions' | 'features' | 'testing' | 'links';

/** Fixed section order; a section only renders when it has translated content. */
const SECTION_ORDER: CaseStudySectionId[] = [
  'context', 'role', 'architecture',
  'decisions', 'features', 'testing', 'links'
];

/** A decision split into its headline and the explanation after the first colon, when there is one */
export interface CaseStudyDecision {
  title: string;
  detail?: string;
}

export interface CaseStudyFeature {
  icon: string;
  text: string;
}

/** lucide icon per testing block (see case-study.icons.ts) */
const TEST_ICONS: Record<ProjectTestKind, string> = {
  unit:        'flask-conical',
  http:        'server',
  integration: 'database',
  component:   'app-window',
  e2e:         'route',
  ci:          'workflow'
};

@Component({
  selector: 'app-case-study',
  standalone: true,
  imports: [NgTemplateOutlet, TranslateModule, LucideAngularModule, ScrollRevealDirective],
  templateUrl: './case-study.component.html',
  styleUrls: ['./case-study.component.scss']
})
export class CaseStudyComponent {
  @Input({ required: true }) project!: ProjectCaseStudy;

  /** id of the heading, used by the modal for aria-labelledby */
  readonly titleId = 'case-study-title';

  readonly testIcons = TEST_ICONS;

  private readonly translate = inject(TranslateService);

  /**
   * Sections with real content, in display order. Evaluated against the loaded
   * translations (not just the data keys), so a key that is missing or still
   * loading never leaves an empty heading behind. Re-evaluated on change
   * detection, which the translate pipe triggers when translations or the
   * language change.
   */
  get sections(): CaseStudySectionId[] {
    return SECTION_ORDER.filter(id => this.hasSection(id));
  }

  /** Testing blocks that have a translated label and at least one example. */
  get testSuites(): ProjectTestSuite[] {
    return (this.project.testing?.suites ?? []).filter(
      s => this.hasText(s.titleKey) && this.list(s.validatesKey).length > 0
    );
  }

  /** Heading for the problem → solution section: names whichever halves exist */
  get contextTitleKey(): string {
    const problem = this.hasText(this.project.problemKey);
    const solution = this.hasText(this.project.solutionKey);
    const id = problem && solution ? 'context' : problem ? 'problem' : 'solution';
    return `projects.caseStudy.sections.${id}`;
  }

  /** Translated state machines, keeping only well-formed entries */
  get stateMachines(): ProjectStateMachine[] {
    const key = this.project.architecture?.stateMachinesKey;
    if (!key) return [];
    const value = this.translate.instant(key);
    if (!Array.isArray(value)) return [];
    return value.filter((m): m is ProjectStateMachine =>
      !!m && typeof m.name === 'string' && Array.isArray(m.path) && m.path.length > 0
    );
  }

  get lastTierIndex(): number {
    return (this.project.architecture?.tiers?.length ?? 1) - 1;
  }

  /**
   * Decisions as headline + detail. Copy such as "Single-flight token refresh: when several
   * requests…" already carries its reason after the colon; anything else is headline only.
   */
  get decisions(): CaseStudyDecision[] {
    return this.list(this.project.decisionsKey).map(text => {
      const cut = text.indexOf(': ');
      return cut > 0 && cut < 60
        ? { title: text.slice(0, cut), detail: text.slice(cut + 2) }
        : { title: text };
    });
  }

  /** Features paired with their icon by position (projects.data.ts keeps both in the same order) */
  get features(): CaseStudyFeature[] {
    const icons = this.project.featureIcons ?? [];
    return this.list(this.project.featuresKey).map((text, i) => ({ icon: icons[i] ?? 'sparkles', text }));
  }

  /** Translated array for `key`; anything else (missing key, plain string) is an empty list. */
  list(key: string | undefined): string[] {
    if (!key) return [];
    const value = this.translate.instant(key);
    return Array.isArray(value) ? value.filter(v => typeof v === 'string' && v.trim()) : [];
  }

  /** True when `key` resolves to a non-empty translated string (ngx-translate echoes unknown keys). */
  hasText(key: string | undefined): boolean {
    if (!key) return false;
    const value = this.translate.instant(key);
    return typeof value === 'string' && value.trim() !== '' && value !== key;
  }

  sectionNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  private hasSection(id: CaseStudySectionId): boolean {
    const p = this.project;
    switch (id) {
      case 'context':      return this.hasText(p.problemKey) || this.hasText(p.solutionKey);
      case 'role':         return this.hasText(p.roleKey);
      case 'architecture': return !!p.architecture?.tiers?.length
                               || this.hasText(p.architecture?.summaryKey)
                               || this.list(p.architecture?.pointsKey).length > 0
                               || this.stateMachines.length > 0;
      case 'decisions':    return this.list(p.decisionsKey).length > 0;
      case 'features':     return this.list(p.featuresKey).length > 0;
      case 'testing':      return this.testSuites.length > 0;
      case 'links': {
        const l = p.links;
        return !!(p.privateCode || l.demo || l.apiDocs || l.repo || l.backendRepo || l.frontendRepo);
      }
    }
  }
}
