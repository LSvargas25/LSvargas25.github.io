import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProfileComponent } from './profile-component';
import { SKILL_CATEGORIES } from '../../../../data/skills.data';
import es from '../../../../../../assets/i18n/es.json';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let el: HTMLElement;

  // jsdom has no IntersectionObserver; the reveal animation only needs observe/disconnect.
  beforeAll(() => {
    (globalThis as any).IntersectionObserver ??= class {
      observe() {}
      disconnect() {}
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, TranslateModule.forRoot()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', es);
    translate.use('es');

    fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  const allSkills = SKILL_CATEGORIES.flatMap(c => c.items);

  it('never repeats a logo or a technology name in the section', () => {
    const icons = allSkills.map(s => s.icon);
    const names = allSkills.map(s => s.name);
    expect(new Set(icons).size).toBe(icons.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('serves every logo from local assets, never from a CDN', () => {
    allSkills.forEach(s => expect(s.icon, s.name).toMatch(/^assets\//));
    el.querySelectorAll<HTMLImageElement>('.skill-icon img')
      .forEach(img => expect(img.getAttribute('src')).not.toMatch(/^https?:/));
  });

  it('renders the seven categories in order with their translated titles', () => {
    expect(Array.from(el.querySelectorAll('.skill-title')).slice(0, 7).map(t => t.textContent!.trim())).toEqual([
      'Backend', 'Bases de datos', 'Escritorio y móvil', 'Frontend', 'Testing', 'IA', 'DevOps y herramientas'
    ]);
  });

  it('gives every logo a name for the tooltip, an aria-label and keyboard focus', () => {
    const icons = Array.from(el.querySelectorAll<HTMLElement>('.skill-icon'));
    expect(icons.length).toBe(allSkills.length);
    icons.forEach(icon => {
      const name = icon.getAttribute('aria-label');
      expect(name).toBeTruthy();
      expect(icon.getAttribute('data-label')).toBe(name);
      expect(icon.getAttribute('tabindex')).toBe('0');
      expect(icon.getAttribute('role')).toBe('img');
      // the logo itself is decorative; the name lives on the button
      expect(icon.querySelector('img')!.getAttribute('alt')).toBe('');
    });
  });

  it('shows soft skills as text chips without logos', () => {
    const chips = Array.from(el.querySelectorAll('.soft-chip'));
    expect(chips.map(c => c.textContent!.trim())).toEqual([
      'Resolución de problemas', 'Trabajo en equipo', 'Comunicación con clientes', 'Aprendizaje continuo', 'Adaptabilidad'
    ]);
    expect(el.querySelector('.soft-skills-section img')).toBeNull();
  });
});
