import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, Award, Briefcase, CalendarDays, ChevronDown, GraduationCap, MapPin } from 'lucide-angular';

import { ExperienceComponent } from './experience-component';
import es from '../../../../../assets/i18n/es.json';
import en from '../../../../../assets/i18n/en.json';

describe('ExperienceComponent', () => {
  let fixture: ComponentFixture<ExperienceComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceComponent, TranslateModule.forRoot()],
      providers: [importProvidersFrom(LucideAngularModule.pick({ Award, Briefcase, CalendarDays, ChevronDown, GraduationCap, MapPin }))]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', es);
    translate.setTranslation('en', en);
    translate.use('es');

    fixture = TestBed.createComponent(ExperienceComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const text = (sel: string) => Array.from(el.querySelectorAll(sel)).map(n => n.textContent!.replace(/\s+/g, ' ').trim());

  it('renders two columns, Education and Work experience, with the same subtitle style', () => {
    expect(el.querySelectorAll('.exp-grid > .exp-col').length).toBe(2);
    expect(text('.exp-subtitle')).toEqual(['Educación', 'Experiencia laboral']);
  });

  it('lists the formal degrees as compact cards with institution and year, no emoji', () => {
    expect(el.querySelectorAll('.edu-card').length).toBe(2);
    expect(text('.edu-card .exp-meta')).toEqual(['Castro Carazo University · 2025', 'Castro Carazo University · 2024']);
    expect(el.textContent).not.toContain('📘');
  });

  it('shows the Expande logo, role, dates and location on the job card', () => {
    const logo = el.querySelector('.job-logo img') as HTMLImageElement;
    expect(logo.getAttribute('src')).toBe('assets/images/expande-256.webp');
    expect(logo.alt).toBe('Logo de Soluciones Expande');
    expect(text('.job-company')).toEqual(['Soluciones Expande']);
    expect(text('.job-card .exp-meta')[0]).toBe('2023 – Presente San José, Costa Rica');
  });

  it('shows three highlights and reveals the rest with "Ver más" / "Ver menos"', () => {
    const more = el.querySelector('.job-more') as HTMLElement;
    const button = el.querySelector('.job-toggle') as HTMLButtonElement;
    expect(el.querySelectorAll('.job-card > .job-list li').length).toBe(3);
    expect(more.querySelectorAll('li').length).toBe(4);
    expect(more.classList).not.toContain('is-open');
    expect(more.hasAttribute('inert')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent!.trim()).toBe('Ver más');

    button.click();
    fixture.detectChanges();
    expect(more.classList).toContain('is-open');
    expect(more.hasAttribute('inert')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.textContent!.trim()).toBe('Ver menos');
  });

  it('switches every label to English', async () => {
    TestBed.inject(TranslateService).use('en');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(text('.exp-subtitle')).toEqual(['Education', 'Work experience']);
    expect(text('.job-toggle')).toEqual(['Show more']);
  });
});
