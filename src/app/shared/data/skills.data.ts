/* ======================================================
   SKILLS DATA — Professional Profile technology grid.
   Logos are official SVGs (Devicon / Simple Icons / xUnit media)
   stored locally in assets/icons/tech, so nothing is fetched from
   a CDN at runtime. Each logo appears exactly once.
   Category labels and soft skills are translated under "profile.*".
====================================================== */

export interface TechSkill {
  /** Technology name — not translated; used for the tooltip and aria-label */
  name: string;
  icon: string;
}

export interface SkillCategory {
  id: string;
  /** i18n key for the category title */
  labelKey: string;
  items: TechSkill[];
}

const icon = (file: string) => `assets/icons/tech/${file}.svg`;

/* Order is chosen so the wrapping rows balance out:
   [Backend · Databases · Desktop/Mobile] [Frontend · Testing] [AI · DevOps & tools] */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'backend',
    labelKey: 'profile.skills.backend',
    items: [
      { name: 'C#',                    icon: icon('csharp') },
      { name: '.NET / ASP.NET Core',   icon: icon('dotnet') },
      { name: 'Entity Framework Core', icon: icon('efcore') },
      { name: 'Python',                icon: icon('python') },
      { name: 'FastAPI',               icon: icon('fastapi') },
      { name: 'Node.js',               icon: icon('nodejs') },
      { name: 'Express',               icon: icon('express') }
    ]
  },
  {
    id: 'databases',
    labelKey: 'profile.skills.databases',
    items: [
      { name: 'SQL Server', icon: icon('sqlserver') },
      { name: 'PostgreSQL', icon: icon('postgresql') },
      { name: 'MongoDB',    icon: icon('mongodb') },
      { name: 'SQLite',     icon: icon('sqlite') },
      { name: 'Supabase',   icon: icon('supabase') }
    ]
  },
  {
    id: 'desktopMobile',
    labelKey: 'profile.skills.desktopMobile',
    items: [
      { name: 'Xamarin.Forms', icon: icon('xamarin') },
      // No official Windows Forms logo exists; the site's existing local asset is reused
      { name: 'Windows Forms', icon: 'assets/icons/WinForms.png' }
    ]
  },
  {
    id: 'frontend',
    labelKey: 'profile.skills.frontend',
    items: [
      { name: 'Angular',      icon: icon('angular') },
      { name: 'React',        icon: icon('react') },
      { name: 'TypeScript',   icon: icon('typescript') },
      { name: 'JavaScript',   icon: icon('javascript') },
      { name: 'HTML5',        icon: icon('html5') },
      { name: 'CSS3',         icon: icon('css3') },
      { name: 'Tailwind CSS', icon: icon('tailwindcss') },
      { name: 'Sass',         icon: icon('sass') }
    ]
  },
  {
    id: 'testing',
    labelKey: 'profile.skills.testing',
    items: [
      { name: 'xUnit',      icon: icon('xunit') },
      { name: 'Vitest',     icon: icon('vitest') },
      { name: 'Jasmine',    icon: icon('jasmine') },
      { name: 'Playwright', icon: icon('playwright') }
    ]
  },
  {
    id: 'ai',
    labelKey: 'profile.skills.ai',
    items: [
      { name: 'ChatGPT',        icon: icon('openai') },
      { name: 'Claude',         icon: icon('claude') },
      // Claude Code has no logo of its own in the icon sets; Anthropic's mark keeps it distinct from Claude
      { name: 'Claude Code',    icon: icon('anthropic') },
      { name: 'GitHub Copilot', icon: icon('githubcopilot') },
      { name: 'Gemini',         icon: icon('googlegemini') }
    ]
  },
  {
    id: 'tools',
    labelKey: 'profile.skills.tools',
    items: [
      { name: 'Git',            icon: icon('git') },
      { name: 'GitHub',         icon: icon('github') },
      { name: 'GitHub Actions', icon: icon('githubactions') },
      { name: 'Docker',         icon: icon('docker') },
      { name: 'Render',         icon: icon('render') },
      { name: 'Swagger',        icon: icon('swagger') },
      { name: 'Visual Studio',  icon: icon('visualstudio') },
      { name: 'VS Code',        icon: icon('vscode') },
      { name: 'Figma',          icon: icon('figma') }
    ]
  }
];

/** i18n key pointing to the translated array of soft skills (text chips, no icons) */
export const SOFT_SKILLS_KEY = 'profile.softSkills.items';
