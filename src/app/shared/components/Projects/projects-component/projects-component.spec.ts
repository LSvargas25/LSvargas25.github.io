import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, ChevronLeft, ChevronRight, Clock, Github, Lock, Play } from 'lucide-angular';

import { ProjectsComponent } from './projects-component';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent, TranslateModule.forRoot()],
      providers: [importProvidersFrom(LucideAngularModule.pick({ ChevronLeft, ChevronRight, Clock, Github, Lock, Play }))]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const originals = () => (Array.from(fixture.nativeElement.querySelectorAll('.project-card')) as HTMLElement[])
    .slice(0, component.projects.length);
  const name = (card: HTMLElement) => card.querySelector('.card-open')!.textContent!.trim();

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('orders the cards Expande, LvBuild, FitRos, FitHouse, Mis Finanzas, Pokedex, VCBikeService', () => {
    expect(component.projects.map(p => p.id))
      .toEqual(['expande', 'lvbuild', 'fitros', 'fithouse', 'finanzas', 'pokedex', 'vcbike']);
  });

  it('renders the set twice for the infinite loop, with the clone hidden from assistive tech', () => {
    const cards: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.project-card'));
    expect(cards.length).toBe(component.projects.length * 2);

    const clones = cards.slice(component.projects.length);
    clones.forEach(card => {
      expect(card.getAttribute('aria-hidden')).toBe('true');
      card.querySelectorAll('button, a').forEach(el => expect(el.getAttribute('tabindex')).toBe('-1'));
    });
  });

  it('opens the case study from the project-name button', () => {
    const button = fixture.nativeElement.querySelector('.project-card .card-open') as HTMLButtonElement;
    button.click();
    expect(component.selectedProject?.id).toBe('expande');
  });

  it('shows the logo on every card and the "Live demo" badge only where there is a demo', () => {
    const cards = originals();
    cards.forEach(card => expect(card.querySelector('.card-image-wrap img')).not.toBeNull());
    expect(cards.filter(c => c.querySelector('.card-live-badge')).map(name))
      .toEqual(['LvBuild', 'FitRos', 'Pokedex']);
  });

  it('gives public projects demo / code buttons and private ones a "private code" label', () => {
    const cards = originals();
    const links = (n: string) => Array.from(cards.find(c => name(c) === n)!.querySelectorAll('.card-actions a'))
      .map(a => a.getAttribute('href'));
    expect(links('LvBuild')).toEqual(['https://lvbuild-web.onrender.com', 'https://github.com/LSvargas25/LvBuild']);
    expect(links('FitRos')).toEqual(['https://fitros-web.onrender.com', 'https://github.com/LSvargas25/fitros-api']);
    expect(links('Pokedex')).toEqual(['https://pokedex-frontend-md48.onrender.com', 'https://github.com/LSvargas25/pokedex-frontend']);
    expect(links('Mis Finanzas')).toEqual(['https://github.com/LSvargas25/widget-finanzas']);
    expect(cards.filter(c => c.querySelector('.card-private')).map(name)).toEqual(['Expande', 'FitHouse', 'VCBikeService']);
  });

  it('does not open the case study when a demo or code link is clicked', () => {
    const link = fixture.nativeElement.querySelector('.card-actions a') as HTMLAnchorElement;
    link.addEventListener('click', e => e.preventDefault()); // keep the test from navigating
    link.click();
    expect(component.selectedProject).toBeNull();
  });
});
