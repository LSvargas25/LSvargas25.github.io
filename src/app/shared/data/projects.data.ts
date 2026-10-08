import { ProjectCaseStudy, ProjectTechIcon } from './projects.model';

/* ======================================================
   PROJECTS DATA — single source of truth for the Projects
   carousel and the case-study modal. Array order is display
   order. Translatable copy lives in assets/i18n/{es,en}.json
   under "projects.items.<id>.*".
====================================================== */

const TECH = {
  angular:    { name: 'Angular',     icon: 'assets/icons/tech/angular.svg' },
  react:      { name: 'React',       icon: 'assets/icons/tech/react.svg' },
  typescript: { name: 'TypeScript',  icon: 'assets/icons/tech/typescript.svg' },
  dotnet:     { name: 'ASP.NET Core', icon: 'assets/icons/tech/dotnet.svg' },
  csharp:     { name: 'C#',          icon: 'assets/icons/tech/csharp.svg' },
  postgresql: { name: 'PostgreSQL',  icon: 'assets/icons/tech/postgresql.svg' },
  docker:     { name: 'Docker',      icon: 'assets/icons/tech/docker.svg' },
  nodejs:     { name: 'Node.js',     icon: 'assets/icons/tech/nodejs.svg' },
  express:    { name: 'Express',     icon: 'assets/icons/tech/express.svg' },
  supabase:   { name: 'Supabase',    icon: 'assets/icons/tech/supabase.svg' },
  tailwind:   { name: 'Tailwind CSS', icon: 'assets/icons/tech/tailwindcss.svg' },
  sqlserver:  { name: 'SQL Server',  icon: 'assets/icons/tech/sqlserver.svg' },
  xamarin:    { name: 'Xamarin.Forms', icon: 'assets/icons/tech/xamarin.svg' },
  winforms:   { name: 'Windows Forms', icon: 'assets/icons/WinForms.png' },
  python:     { name: 'Python',      icon: 'assets/icons/tech/python.svg' },
  fastapi:    { name: 'FastAPI',     icon: 'assets/icons/tech/fastapi.svg' },
  javascript: { name: 'JavaScript',  icon: 'assets/icons/tech/javascript.svg' }
} satisfies Record<string, ProjectTechIcon>;

const STACK_LABEL = {
  backend:  'projects.caseStudy.stack.backend',
  frontend: 'projects.caseStudy.stack.frontend',
  mobile:   'projects.caseStudy.stack.mobile',
  testing:  'projects.caseStudy.stack.testing',
  desktop:  'projects.caseStudy.stack.desktop',
  data:     'projects.caseStudy.stack.dataReports'
};

const item = (id: string) => `projects.items.${id}`;
/** A layer in an architecture diagram, with its i18n responsibility line */
const layer = (id: string, name: string, key: string) =>
  ({ name, responsibilityKey: `${item(id)}.architecture.layers.${key}` });
/** Key fact under the tagline; shared labels live in projects.caseStudy.highlights */
const fact = (icon: string, labelKey: string) => ({ icon, labelKey });
const LIVE_DEMO    = fact('play', 'projects.caseStudy.highlights.liveDemo');
const PRIVATE_CODE = fact('lock', 'projects.caseStudy.privateBadge');
/** i18n keys for one testing block: projects.items.<id>.testing.<suite>.{title,description,validates} */
const suite = (id: string, name: string, withDescription = false) => ({
  titleKey: `${item(id)}.testing.${name}.title`,
  ...(withDescription ? { descriptionKey: `${item(id)}.testing.${name}.description` } : {}),
  validatesKey: `${item(id)}.testing.${name}.validates`
});

export const PROJECTS: ProjectCaseStudy[] = [
  {
    id: 'expande',
    name: 'Expande',
    privateCode: true,
    privateNoteKey: `${item('expande')}.privateNote`,
    cardImage: 'assets/images/expande-256.webp',
    glowClass: 'expande-glow',
    accentRgb: '184, 155, 106',
    cardDescriptionKey: 'projects.cards.expande.description',
    techIcons: [TECH.angular, TECH.tailwind, TECH.csharp, TECH.dotnet, TECH.sqlserver],
    taglineKey: `${item('expande')}.tagline`,
    highlights: [
      fact('circle-check', `${item('expande')}.highlights.production`),
      fact('warehouse',    `${item('expande')}.highlights.locations`),
      fact('refresh-cw',   `${item('expande')}.highlights.maintenance`),
      PRIVATE_CODE
    ],
    stack: [
      { labelKey: STACK_LABEL.backend,  items: ['ASP.NET Core', 'C#', 'EF Core', 'SQL Server', 'JWT'] },
      { labelKey: STACK_LABEL.frontend, items: ['Angular', 'TypeScript', 'Tailwind CSS'] }
    ],
    problemKey:  `${item('expande')}.problem`,
    solutionKey: `${item('expande')}.solution`,
    roleKey:     `${item('expande')}.role`,
    architecture: {
      layout: 'flow',
      tiers: [[{ name: 'Angular + Tailwind' }], [{ name: 'API ASP.NET Core' }], [{ name: 'SQL Server · EF Core' }]],
      summaryKey: `${item('expande')}.architecture.summary`
    },
    decisionsKey: `${item('expande')}.decisions`,
    featuresKey:  `${item('expande')}.features`,
    featureIcons: [
      'package', 'arrow-left-right', 'truck', 'store', 'receipt',
      'credit-card', 'file-text', 'hard-hat', 'chart-column', 'shield-check'
    ],
    links: {}
  },

  {
    id: 'lvbuild',
    name: 'LvBuild',
    // Circular terracotta logo; the dashboard screenshot stays as the hero image
    cardImage: 'assets/images/lvbuild-icon.webp',
    cardImageAltKey: `${item('lvbuild')}.logoAlt`,
    cardImageFill: true,
    cardShot: 'assets/images/demo-lvbuild-640.webp',
    heroImage: 'assets/images/demo-lvbuild-1200.webp',
    glowClass: 'lvbuild-glow',
    // Mean terracotta of the logo, so card glow and modal accents match it
    accentRgb: '161, 85, 58',
    cardDescriptionKey: 'projects.cards.lvbuild.description',
    techIcons: [TECH.dotnet, TECH.postgresql, TECH.docker, TECH.react, TECH.typescript],
    taglineKey: `${item('lvbuild')}.tagline`,
    highlights: [
      LIVE_DEMO,
      fact('users',       `${item('lvbuild')}.highlights.roles`),
      fact('database',    `${item('lvbuild')}.highlights.integration`),
      fact('badge-check', `${item('lvbuild')}.highlights.ci`)
    ],
    stack: [
      { labelKey: STACK_LABEL.backend,  items: ['ASP.NET Core 8', 'EF Core 9', 'PostgreSQL 16', 'Docker', 'JWT', 'QuestPDF'] },
      { labelKey: STACK_LABEL.frontend, items: ['React 19', 'TypeScript', 'Vite', 'Tailwind', 'shadcn/ui', 'TanStack Query', 'react-hook-form', 'zod'] },
      { labelKey: STACK_LABEL.testing,  items: ['xUnit', 'FluentAssertions', 'WebApplicationFactory', 'Testcontainers', 'Vitest', 'Testing Library', 'MSW'] }
    ],
    problemKey:  `${item('lvbuild')}.problem`,
    solutionKey: `${item('lvbuild')}.solution`,
    roleKey:     `${item('lvbuild')}.role`,
    architecture: {
      layout: 'rings',
      tiers: [
        [layer('lvbuild', 'LvApi', 'api'), layer('lvbuild', 'LvInfrastructure', 'infrastructure')],
        [layer('lvbuild', 'LvApplication', 'application')],
        [layer('lvbuild', 'LvDomain', 'domain')]
      ],
      summaryKey: `${item('lvbuild')}.architecture.summary`,
      pointsKey:  `${item('lvbuild')}.architecture.points`,
      stateMachinesKey: `${item('lvbuild')}.architecture.stateMachines`
    },
    decisionsKey: `${item('lvbuild')}.decisions`,
    featuresKey:  `${item('lvbuild')}.features`,
    featureIcons: ['file-text', 'chart-column', 'calendar-days', 'warehouse', 'receipt', 'shield-check'],
    testing: {
      suites: [
        { id: 'unit',        kind: 'unit',        scope: 'backend',  tools: ['xUnit', 'FluentAssertions', 'EF Core InMemory'], ...suite('lvbuild', 'unit', true) },
        { id: 'http',        kind: 'http',        scope: 'backend',  tools: ['WebApplicationFactory'],                         ...suite('lvbuild', 'http') },
        { id: 'integration', kind: 'integration', scope: 'backend',  tools: ['Testcontainers', 'PostgreSQL 16'],               ...suite('lvbuild', 'integration', true) },
        { id: 'web',         kind: 'component',   scope: 'frontend', tools: ['Vitest', 'Testing Library', 'MSW'],              ...suite('lvbuild', 'web') },
        { id: 'ci',          kind: 'ci',                             tools: ['GitHub Actions', 'Docker'],                      ...suite('lvbuild', 'ci') }
      ]
    },
    links: {
      demo: {
        url: 'https://lvbuild-web.onrender.com',
        coldStart: true,
        accessKey: `${item('lvbuild')}.demo.access`,
        noteKey: `${item('lvbuild')}.demo.note`
      },
      apiDocs: 'https://lvbuild-api.onrender.com/swagger',
      backendRepo: 'https://github.com/LSvargas25/LvBuild',
      frontendRepo: 'https://github.com/LSvargas25/lvbuild-web'
    }
  },

  {
    id: 'fitros',
    name: 'FitRos',
    cardImage: 'assets/images/fitros-logo.webp',
    cardShot: 'assets/images/demo-fitros-640.webp',
    heroImage: 'assets/images/demo-fitros-1200.webp',
    glowClass: 'fitros-glow',
    accentRgb: '34, 197, 94',
    cardDescriptionKey: 'projects.cards.fitros.description',
    techIcons: [TECH.angular, TECH.dotnet, TECH.csharp, TECH.postgresql],
    taglineKey: `${item('fitros')}.tagline`,
    highlights: [
      LIVE_DEMO,
      fact('layers',     `${item('fitros')}.highlights.cleanArchitecture`),
      fact('users',      `${item('fitros')}.highlights.roles`),
      fact('file-check', `${item('fitros')}.highlights.tests`)
    ],
    stack: [
      { labelKey: STACK_LABEL.backend,  items: ['ASP.NET Core', 'C#', 'EF Core', 'PostgreSQL', 'JWT'] },
      { labelKey: STACK_LABEL.frontend, items: ['Angular', 'TypeScript'] },
      { labelKey: STACK_LABEL.testing,  items: ['xUnit', 'FluentAssertions', 'EF Core InMemory'] }
    ],
    problemKey:  `${item('fitros')}.problem`,
    solutionKey: `${item('fitros')}.solution`,
    roleKey:     `${item('fitros')}.role`,
    architecture: {
      layout: 'rings',
      tiers: [
        [layer('fitros', 'FitRos.API', 'api'), layer('fitros', 'FitRos.Infrastructure', 'infrastructure')],
        [layer('fitros', 'FitRos.Application', 'application')],
        [layer('fitros', 'FitRos.Domain', 'domain')]
      ],
      summaryKey: `${item('fitros')}.architecture.summary`,
      pointsKey:  `${item('fitros')}.architecture.points`
    },
    decisionsKey: `${item('fitros')}.decisions`,
    featuresKey:  `${item('fitros')}.features`,
    featureIcons: ['shield-check', 'log-in', 'mail-check', 'dumbbell'],
    testing: {
      suites: [
        { id: 'handlers', kind: 'unit', scope: 'backend',  tools: ['xUnit', 'FluentAssertions', 'EF Core InMemory'], ...suite('fitros', 'handlers', true) },
        { id: 'api',      kind: 'http', scope: 'backend',  tools: ['xUnit', 'FluentAssertions'],                     ...suite('fitros', 'api', true) },
        { id: 'web',      kind: 'unit', scope: 'frontend', tools: ['Angular'],                                       ...suite('fitros', 'web', true) },
        { id: 'ci',       kind: 'ci',                      tools: ['GitHub Actions'],                                ...suite('fitros', 'ci') }
      ]
    },
    links: {
      demo: {
        url: 'https://fitros-web.onrender.com',
        coldStart: true,
        accessKey: `${item('fitros')}.demo.access`,
        noteKey: `${item('fitros')}.demo.note`
      },
      backendRepo: 'https://github.com/LSvargas25/fitros-api',
      frontendRepo: 'https://github.com/LSvargas25/fitros-web'
    }
  },

  {
    id: 'fithouse',
    name: 'FitHouse',
    privateCode: true,
    privateNoteKey: `${item('fithouse')}.privateNote`,
    cardImage: 'assets/images/FitHouse.png',
    glowClass: 'fithouse-glow',
    accentRgb: '220, 50, 50',
    cardDescriptionKey: 'projects.cards.fithouse.description',
    techIcons: [TECH.xamarin, TECH.csharp, TECH.sqlserver],
    taglineKey: `${item('fithouse')}.tagline`,
    highlights: [
      fact('graduation-cap', `${item('fithouse')}.highlights.thesis`),
      fact('award',          `${item('fithouse')}.highlights.honors`),
      fact('smartphone',     `${item('fithouse')}.highlights.android`),
      PRIVATE_CODE
    ],
    stack: [
      { labelKey: STACK_LABEL.backend, items: ['C#', 'ASP.NET (API)', 'SQL Server'] },
      { labelKey: STACK_LABEL.mobile,  items: ['Xamarin.Forms', 'Android'] }
    ],
    problemKey:  `${item('fithouse')}.problem`,
    solutionKey: `${item('fithouse')}.solution`,
    roleKey:     `${item('fithouse')}.role`,
    architecture: {
      layout: 'flow',
      tiers: [[{ name: 'App Android' }], [{ name: 'API C#' }], [{ name: 'SQL Server' }]],
      summaryKey: `${item('fithouse')}.architecture.summary`
    },
    featuresKey: `${item('fithouse')}.features`,
    featureIcons: ['scale', 'trending-up', 'dumbbell', 'users'],
    testing: {
      suites: [
        { id: 'api',     kind: 'http', scope: 'backend', tools: [], ...suite('fithouse', 'api') },
        { id: 'android', kind: 'unit', scope: 'mobile',  tools: [], ...suite('fithouse', 'android') }
      ]
    },
    links: {}
  },

  {
    id: 'finanzas',
    name: 'Mis Finanzas',
    cardImage: 'assets/images/mis-finanzas-icon.webp',
    glowClass: 'finanzas-glow',
    accentRgb: '4, 120, 87',
    cardDescriptionKey: 'projects.cards.finanzas.description',
    techIcons: [TECH.python, TECH.fastapi, TECH.postgresql, TECH.javascript],
    taglineKey: `${item('finanzas')}.tagline`,
    highlights: [
      LIVE_DEMO,
      fact('smartphone', `${item('finanzas')}.highlights.pwa`),
      fact('code',       `${item('finanzas')}.highlights.python`),
      fact('github',     `${item('finanzas')}.highlights.openSource`)
    ],
    stack: [
      { labelKey: STACK_LABEL.backend,  items: ['Python', 'FastAPI', 'SQLAlchemy', 'SQLite / PostgreSQL', 'JWT'] },
      { labelKey: STACK_LABEL.frontend, items: ['HTML', 'CSS', 'JavaScript', 'PWA (manifest + service worker)'] }
    ],
    problemKey:  `${item('finanzas')}.problem`,
    solutionKey: `${item('finanzas')}.solution`,
    roleKey:     `${item('finanzas')}.role`,
    architecture: {
      layout: 'flow',
      tiers: [
        [{ name: 'PWA (HTML/CSS/JS + service worker)' }],
        [{ name: 'API FastAPI (/api/*)' }],
        [{ name: 'SQLAlchemy' }],
        [{ name: 'SQLite / PostgreSQL' }]
      ],
      summaryKey: `${item('finanzas')}.architecture.summary`
    },
    decisionsKey: `${item('finanzas')}.decisions`,
    featuresKey:  `${item('finanzas')}.features`,
    featureIcons: ['wallet', 'circle-plus', 'trending-up', 'layout-dashboard', 'users', 'file-code'],
    links: {
      demo: { url: 'https://widget-finanzas.onrender.com', coldStart: true },
      repo: 'https://github.com/LSvargas25/widget-finanzas'
    }
  },

  {
    id: 'pokedex',
    name: 'Pokedex',
    cardImage: 'assets/images/Pokedex.png',
    cardShot: 'assets/images/demo-pokedex-640.webp',
    heroImage: 'assets/images/demo-pokedex-1200.webp',
    glowClass: 'pokedex-glow',
    accentRgb: '220, 50, 50',
    cardDescriptionKey: 'projects.cards.pokedex.description',
    techIcons: [TECH.angular, TECH.typescript, TECH.nodejs, TECH.express, TECH.supabase],
    taglineKey: `${item('pokedex')}.tagline`,
    highlights: [
      LIVE_DEMO,
      fact('swords', `${item('pokedex')}.highlights.battles`),
      fact('route',  `${item('pokedex')}.highlights.e2e`)
    ],
    stack: [
      { labelKey: STACK_LABEL.frontend, items: ['Angular 20', 'TypeScript', 'GSAP', 'Web Audio'] },
      { labelKey: STACK_LABEL.backend,  items: ['Node.js', 'Express', 'Supabase Auth', 'PokeAPI'] },
      { labelKey: STACK_LABEL.testing,  items: ['Jasmine', 'Karma', 'Playwright', 'node:test', 'supertest'] }
    ],
    solutionKey: `${item('pokedex')}.solution`,
    roleKey:     `${item('pokedex')}.role`,
    architecture: {
      layout: 'flow',
      tiers: [[{ name: 'Angular 20' }], [{ name: 'Node / Express' }], [{ name: 'PokeAPI' }]],
      summaryKey: `${item('pokedex')}.architecture.summary`
    },
    decisionsKey: `${item('pokedex')}.decisions`,
    featuresKey:  `${item('pokedex')}.features`,
    featureIcons: ['log-in', 'swords', 'sparkles', 'volume-2'],
    testing: {
      suites: [
        { id: 'e2e', kind: 'e2e',  scope: 'frontend', tools: ['Playwright'],             ...suite('pokedex', 'e2e') },
        { id: 'web', kind: 'unit', scope: 'frontend', tools: ['Jasmine', 'Karma'],       ...suite('pokedex', 'web', true) },
        { id: 'api', kind: 'http', scope: 'backend',  tools: ['node:test', 'supertest'], ...suite('pokedex', 'api') },
        { id: 'ci',  kind: 'ci',                      tools: ['GitHub Actions'],         ...suite('pokedex', 'ci') }
      ]
    },
    links: {
      demo: {
        url: 'https://pokedex-frontend-md48.onrender.com',
        coldStart: true,
        accessKey: `${item('pokedex')}.demo.access`
      },
      primaryRepo: 'frontend',
      backendRepo: 'https://github.com/LSvargas25/pokedex-backend',
      frontendRepo: 'https://github.com/LSvargas25/pokedex-frontend'
    }
  },

  {
    id: 'vcbike',
    name: 'VCBikeService',
    privateCode: true,
    privateNoteKey: `${item('vcbike')}.privateNote`,
    cardImage: 'assets/images/VCBikeService.webp',
    glowClass: 'vcbike-glow',
    accentRgb: '80, 80, 80',
    cardDescriptionKey: 'projects.cards.vcbike.description',
    techIcons: [TECH.winforms, TECH.csharp, TECH.sqlserver],
    taglineKey: `${item('vcbike')}.tagline`,
    highlights: [
      fact('graduation-cap', `${item('vcbike')}.highlights.graduation`),
      fact('store',          `${item('vcbike')}.highlights.installed`),
      fact('file-text',      `${item('vcbike')}.highlights.reports`),
      PRIVATE_CODE
    ],
    stack: [
      { labelKey: STACK_LABEL.desktop, items: ['C#', 'Windows Forms'] },
      { labelKey: STACK_LABEL.data,    items: ['SQL Server', 'Crystal Reports'] }
    ],
    problemKey:  `${item('vcbike')}.problem`,
    solutionKey: `${item('vcbike')}.solution`,
    roleKey:     `${item('vcbike')}.role`,
    architecture: {
      layout: 'flow',
      tiers: [[{ name: 'Windows Forms' }], [{ name: 'C#' }], [{ name: 'SQL Server' }, { name: 'Crystal Reports' }]],
      summaryKey: `${item('vcbike')}.architecture.summary`
    },
    featuresKey: `${item('vcbike')}.features`,
    featureIcons: ['package-plus', 'shopping-cart', 'wrench', 'calculator', 'file-text'],
    links: {}
  }
];
