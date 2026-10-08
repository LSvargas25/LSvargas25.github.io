import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

import { CaseStudyComponent } from './case-study.component';
import { CASE_STUDY_ICONS } from './case-study.icons';
import { PROJECTS } from '../../../data/projects.data';
import { ProjectId } from '../../../data/projects.model';
import es from '../../../../../assets/i18n/es.json';
import en from '../../../../../assets/i18n/en.json';

describe('CaseStudyComponent', () => {
  let fixture: ComponentFixture<CaseStudyComponent>;
  let el: HTMLElement;

  // jsdom has no IntersectionObserver; ScrollRevealDirective only needs observe/disconnect.
  beforeAll(() => {
    (globalThis as any).IntersectionObserver ??= class {
      observe() {}
      disconnect() {}
    };
  });

  // Real Spanish copy: sections only render when their translated content exists.
  async function render(id: ProjectId, translations: object = es) {
    await TestBed.configureTestingModule({
      imports: [CaseStudyComponent, TranslateModule.forRoot()],
      providers: [importProvidersFrom(LucideAngularModule.pick(CASE_STUDY_ICONS))]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', translations);
    translate.use('es');

    fixture = TestBed.createComponent(CaseStudyComponent);
    fixture.componentRef.setInput('project', PROJECTS.find(p => p.id === id)!);
    fixture.detectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement;
  }

  const sectionIds = () =>
    Array.from(el.querySelectorAll('.cs-section-title')).map(h => h.id.replace('cs-', ''));
  const links = () => Array.from(el.querySelectorAll<HTMLAnchorElement>('a.cs-btn'));

  it('renders every LvBuild section in the case-study order', async () => {
    await render('lvbuild');
    expect(sectionIds()).toEqual([
      'context', 'role', 'architecture', 'decisions', 'features', 'testing', 'links'
    ]);
  });

  it('shows demo, backend, frontend and Swagger links for LvBuild, plus the cold-start notice', async () => {
    await render('lvbuild');
    expect(links().map(a => a.href)).toEqual([
      'https://lvbuild-web.onrender.com/',
      'https://github.com/LSvargas25/LvBuild',
      'https://github.com/LSvargas25/lvbuild-web',
      'https://lvbuild-api.onrender.com/swagger'
    ]);
    links().forEach(a => {
      expect(a.target).toBe('_blank');
      expect(a.rel).toBe('noopener noreferrer');
    });
    expect(el.querySelector('.cs-note')).not.toBeNull();
  });

  it('shows the FitRos demo with its one-click access, demo-version and cold-start notes', async () => {
    await render('fitros');
    expect(links().map(a => a.href)).toEqual([
      'https://fitros-web.onrender.com/',
      'https://github.com/LSvargas25/fitros-api',
      'https://github.com/LSvargas25/fitros-web'
    ]);
    expect(el.querySelector('button.cs-btn')).toBeNull();
    expect(el.querySelectorAll('.cs-note').length).toBe(3);
  });

  it('renders a disabled "private code" button and no links for private projects', async () => {
    await render('expande');
    const button = el.querySelector<HTMLButtonElement>('button.cs-btn--disabled');
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(true);
    expect(button!.textContent).toContain('Código privado');
    expect(links().length).toBe(0);
    expect(el.querySelector('a[href*="github.com"]')).toBeNull();
  });

  it('omits sections without data', async () => {
    await render('expande');
    expect(sectionIds()).toEqual(['context', 'role', 'architecture', 'decisions', 'features', 'links']);
  });

  it('shows problem → solution side by side, or the solution alone when there is no problem', async () => {
    await render('lvbuild');
    expect(el.querySelector('#cs-context')!.textContent).toContain('Problema y solución');
    expect(el.querySelectorAll('.cs-context-panel').length).toBe(2);
    expect(el.querySelector('.cs-context-arrow')).not.toBeNull();

    TestBed.resetTestingModule();
    await render('pokedex');
    expect(el.querySelector('#cs-context')!.textContent).toContain('Solución');
    expect(el.querySelectorAll('.cs-context-panel').length).toBe(1);
    expect(el.querySelector('.cs-context-arrow')).toBeNull();
  });

  it('shows the author photo, small and lazy, in the role section of every project that has one', async () => {
    for (const id of ['lvbuild', 'fitros', 'pokedex'] as const) {
      TestBed.resetTestingModule();
      await render(id);
      const photo = el.querySelector<HTMLImageElement>('.cs-role .cs-role-photo')!;
      expect(photo.getAttribute('src'), id).toBe('assets/images/principal-avatar-112.webp');
      expect(photo.alt).toBe('Luis Steven Vargas');
      expect(photo.getAttribute('loading')).toBe('lazy');
    }
  });

  it('uses the LvBuild app icon, padded, in the header and keeps the dashboard as the hero image', async () => {
    await render('lvbuild');
    const avatar = el.querySelector<HTMLElement>('.cs-avatar')!;
    const logo = avatar.querySelector('img')!;
    expect(logo.getAttribute('src')).toBe('assets/images/lvbuild-app-icon.svg');
    expect(logo.alt).toBe('Logo de LvBuild');
    expect(avatar.classList).toContain('cs-avatar--pad');
    expect(el.querySelector('.cs-hero img')!.getAttribute('src')).toBe('assets/images/demo-lvbuild-1200.webp');

    TestBed.resetTestingModule();
    await render('fitros');
    expect(el.querySelector('.cs-avatar img')!.getAttribute('src')).toBe('assets/images/fitros-app-logo.webp');
    expect(el.querySelector('.cs-avatar')!.classList).toContain('cs-avatar--fill');
  });

  it('renders the key facts under the tagline', async () => {
    await render('lvbuild');
    const facts = Array.from(el.querySelectorAll('.cs-highlight')).map(f => f.textContent!.trim());
    expect(facts).toEqual(['Demo en vivo', '5 roles', 'Integración con PostgreSQL 16 real', 'CI con cero warnings']);
  });

  it('nests the LvBuild layers from the outside in, each with its responsibility', async () => {
    await render('lvbuild');
    const rings = Array.from(el.querySelectorAll<HTMLElement>('.cs-ring')).map(r =>
      Array.from(r.querySelector(':scope > .cs-ring-layers')!.querySelectorAll('.cs-layer-name'))
        .map(n => n.textContent!.trim())
    );
    expect(rings).toEqual([['LvApi', 'LvInfrastructure'], ['LvApplication'], ['LvDomain']]);
    // each inner ring sits inside the previous one
    expect(el.querySelector('.cs-ring .cs-ring .cs-ring.cs-ring--core')).not.toBeNull();
    expect(el.querySelectorAll('.cs-layer-role').length).toBe(4);
    expect(el.querySelector('.cs-rings figcaption')!.textContent).toContain('hacia el centro');
  });

  it('draws Pokedex as a request flow instead of rings', async () => {
    await render('pokedex');
    expect(el.querySelector('.cs-ring')).toBeNull();
    expect(Array.from(el.querySelectorAll('.cs-flow-node')).map(n => n.textContent!.trim()))
      .toEqual(['Angular 20', 'Node / Express', 'PokeAPI']);
  });

  it('shows the four LvBuild state machines with their main path and branches', async () => {
    await render('lvbuild');
    const machines = Array.from(el.querySelectorAll('.cs-machine')).map(m => ({
      name: m.querySelector('.cs-machine-name')!.textContent!.trim(),
      path: Array.from(m.querySelectorAll('.cs-state-label')).map(s => s.textContent!.trim()),
      branches: m.querySelector('.cs-machine-branches')?.textContent!.trim()
    }));
    expect(machines.map(m => m.name)).toEqual(['Presupuesto', 'Oferta', 'Bitácora semanal', 'Factura']);
    expect(machines[0].path).toEqual(['Borrador', 'Revisión', 'Enviado', 'Aprobado por el cliente']);
    expect(machines[0].branches).toContain('Revisión → Corrección → Revisión');
    expect(el.querySelector('.cs-state-note')!.textContent).toContain('PDF disponible');
  });

  it('splits a decision into headline and reason only when the copy already has one', async () => {
    await render('lvbuild');
    const decisions = Array.from(el.querySelectorAll('.cs-decision')).map(d => ({
      title: d.querySelector('.cs-decision-title')!.textContent!.trim(),
      detail: d.querySelector('.cs-decision-detail')?.textContent!.trim() ?? null
    }));
    expect(decisions.length).toBe(8);
    expect(decisions[7]).toEqual({
      title: 'Refresh de token single-flight',
      detail: 'si varias peticiones encuentran el token vencido, se hace un solo refresh.'
    });
    expect(decisions[0].detail).toBeNull();
  });

  it('gives every feature its own icon', async () => {
    await render('lvbuild');
    const features = el.querySelectorAll('.cs-feature');
    expect(features.length).toBe(6);
    features.forEach(f => expect(f.querySelector('.cs-tile-icon lucide-icon')).not.toBeNull());
  });

  it('frames the demo and code links as a final call to action', async () => {
    await render('lvbuild');
    expect(el.querySelector('.cs-cta .cs-cta-lead')!.textContent).toContain('Pruébalo en vivo');

  });

  it('falls back to the generic private-code line when a project has no note of its own', async () => {
    const withoutNote = structuredClone(es) as typeof es;
    delete (withoutNote.projects.items.expande as Partial<typeof es.projects.items.expande>).privateNote;
    await render('expande', withoutNote);
    expect(el.querySelector('.cs-cta--private .cs-cta-lead')!.textContent!.trim()).toBe('El código de este proyecto es privado.');
  });

  it('shows Expande as a private production system', async () => {
    await render('expande');
    expect(Array.from(el.querySelectorAll('.cs-highlight')).map(f => f.textContent!.trim()))
      .toEqual(['En producción', '2 bodegas + 1 punto de venta', 'Mantenimiento continuo', 'Código privado']);
    expect(el.querySelectorAll('.cs-feature').length).toBe(10);
    expect(el.querySelector('#cs-testing')).toBeNull();
    expect(el.querySelector('.cs-cta--private .cs-cta-lead')!.textContent!.trim())
      .toBe('Sistema en producción; el código pertenece a Soluciones Expande.');
  });

  it('gives Mis Finanzas a live demo and a single code button', async () => {
    await render('finanzas');
    expect(links().map(a => [a.href, a.textContent!.replace(/\s+/g, ' ').trim()])).toEqual([
      ['https://widget-finanzas.onrender.com/', 'Ver demo (se abre en una pestaña nueva)'],
      ['https://github.com/LSvargas25/widget-finanzas', 'Código (se abre en una pestaña nueva)']
    ]);
    expect(el.querySelector('.cs-note')).not.toBeNull();
    expect(el.querySelector('#cs-testing')).toBeNull();
    // every decision in this project carries its reason after the colon
    el.querySelectorAll('.cs-decision').forEach(d => expect(d.querySelector('.cs-decision-detail')).not.toBeNull());
  });

  it('tells who owns the code of FitHouse and VCBikeService in the private panel', async () => {
    await render('fithouse');
    expect(el.querySelector('.cs-cta--private .cs-cta-lead')!.textContent!.trim()).toBe('El código y la app pertenecen al gimnasio.');

    TestBed.resetTestingModule();
    await render('vcbike');
    expect(el.querySelector('.cs-cta--private .cs-cta-lead')!.textContent!.trim()).toBe('El código pertenece a VCBikeService.');
  });

  it('renders the full FitHouse case study with its Android and API test blocks', async () => {
    await render('fithouse');
    expect(sectionIds()).toEqual(['context', 'role', 'architecture', 'features', 'testing', 'links']);
    expect(Array.from(el.querySelectorAll('.cs-highlight')).map(f => f.textContent!.trim()))
      .toEqual(['Tesis de Licenciatura', 'Graduado con honores', 'App Android', 'Código privado']);
    expect(Array.from(el.querySelectorAll('.cs-flow-node')).map(n => n.textContent!.trim()))
      .toEqual(['App Android', 'API C#', 'SQL Server']);
    expect(testBlocks().map(b => [b.title, b.scope])).toEqual([
      ['Pruebas del backend (API)', 'Backend'],
      ['Pruebas de la app Android', 'Móvil']
    ]);
    // no tools were provided for these suites, so no empty chip row
    expect(el.querySelector('.cs-test-tools')).toBeNull();
  });

  it('renders VCBikeService without a testing section', async () => {
    await render('vcbike');
    expect(sectionIds()).toEqual(['context', 'role', 'architecture', 'features', 'links']);
    expect(el.querySelectorAll('.cs-feature').length).toBe(5);
  });

  const testBlocks = () =>
    Array.from(el.querySelectorAll('.cs-test')).map(t => ({
      title: t.querySelector('.cs-test-kind')!.textContent!.trim(),
      scope: t.querySelector('.cs-test-scope')?.textContent!.trim() ?? null,
      description: t.querySelector('.cs-test-description')?.textContent!.trim() ?? null,
      tools: Array.from(t.querySelectorAll('.cs-chip')).map(c => c.textContent!.trim()),
      validates: Array.from(t.querySelectorAll('.cs-test-validates li')).map(li => li.textContent!.trim())
    }));

  it('renders each LvBuild testing block with its label, tools and concrete examples', async () => {
    await render('lvbuild');
    const blocks = testBlocks();
    expect(blocks.map(b => b.title)).toEqual([
      'Unitarias de servicios', 'HTTP sobre el pipeline real', 'Integración con PostgreSQL 16 real', 'Frontend', 'CI'
    ]);
    expect(blocks[0].tools).toEqual(['xUnit', 'FluentAssertions', 'EF Core InMemory']);
    expect(blocks[0].description).toContain('24 pruebas de su máquina de estados');
    expect(blocks[2].validates).toContain('Emitir factura descuenta stock y asigna número.');
    expect(blocks[3].scope).toBe('Frontend');
    // CI is not tied to a side of the app
    expect(blocks[4].scope).toBeNull();
    expect(blocks[4].validates).toContain('El contenedor no corre como root.');
    blocks.forEach(b => expect(b.validates.length).toBeGreaterThan(0));
    expect(el.querySelectorAll('.cs-test .cs-tile-icon lucide-icon').length).toBe(5);
  });

  it('hides the testing heading when the translated content is missing', async () => {
    const withoutTesting = structuredClone(es) as typeof es;
    delete (withoutTesting.projects.items.lvbuild as Partial<typeof es.projects.items.lvbuild>).testing;
    await render('lvbuild', withoutTesting);
    expect(el.querySelector('#cs-testing')).toBeNull();
    expect(sectionIds()).not.toContain('testing');
  });

  it('renders the four FitRos testing blocks', async () => {
    await render('fitros');
    expect(testBlocks().map(b => b.title)).toEqual(['Handlers aislados', 'Tests a nivel API por módulo', 'Frontend Angular', 'CI']);
  });

  it('has no testing section for Expande', async () => {
    await render('expande');
    expect(el.querySelector('#cs-testing')).toBeNull();
    expect(el.querySelector('.cs-test')).toBeNull();
  });

  describe('data integrity', () => {
    const get = (o: unknown, key: string) =>
      key.split('.').reduce<any>((acc, part) => acc?.[part], o);
    // PascalCase export names -> kebab-case icon names (Building2 -> building-2)
    const registered = new Set(
      Object.keys(CASE_STUDY_ICONS).map(n =>
        n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-z])([0-9])/g, '$1-$2').toLowerCase()
      )
    );

    for (const [lang, copy] of [['es', es], ['en', en]] as const) {
      it(`has one icon per feature in ${lang}`, () => {
        for (const p of PROJECTS.filter(p => p.featuresKey)) {
          expect(p.featureIcons?.length, p.id).toBe(get(copy, p.featuresKey!).length);
        }
      });
    }

    it('only uses icons that are registered', () => {
      const used = PROJECTS.flatMap(p => [
        ...(p.featureIcons ?? []),
        ...(p.highlights ?? []).map(h => h.icon)
      ]);
      used.forEach(icon => expect(registered.has(icon), icon).toBe(true));
    });
  });
});
