import { ResumeData } from './resume.model';

/* ======================================================
   RESUME DATA — single source of truth for structural data
   (names, dates, links, tech names). Translatable copy lives
   in assets/i18n/{es,en}.json under "resume.*" — see the
   *Key fields below for which key maps to which i18n entry.

   The downloadable PDFs (assets/cv/) are printed from this online CV.
====================================================== */

export const RESUME_DATA: ResumeData = {
  fullName: 'Luis Steven Vargas Rodríguez',
  roleTagKey: 'resume.roleTag',

  // Single place the PDF paths/filenames are defined — ResumeSheetService
  // picks the one for the active language.
  pdf: {
    es: { path: 'assets/cv/Luis_Vargas_CV_es.pdf', fileName: 'Luis_Vargas_CV.pdf' },
    en: { path: 'assets/cv/Luis_Vargas_Resume_en.pdf', fileName: 'Luis_Vargas_Resume.pdf' }
  },

  contact: {
    location: 'San José, Costa Rica',
    phoneDisplay: '+506 8671 7413',
    phoneHref: 'tel:+50686717413',
    email: 'luisstevenvargasr@gmail.com',
    github: {
      label: 'github.com/LSvargas25',
      url: 'https://github.com/LSvargas25'
    },
    linkedin: {
      label: 'linkedin.com/in/luis-steven-vargas-rodríguez',
      url: 'https://www.linkedin.com/in/luis-steven-vargas-rodr%C3%ADguez/'
    }
  },

  skills: [
    {
      id: 'languagesFrameworks',
      labelKey: 'resume.skillGroups.languagesFrameworks',
      items: ['C#', '.NET', 'ASP.NET Core', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Python']
    },
    {
      id: 'databases',
      labelKey: 'resume.skillGroups.databases',
      items: ['SQL Server (Data Modeling, Stored Procedures)', 'MongoDB', 'PostgreSQL']
    },
    {
      id: 'other',
      labelKey: 'resume.skillGroups.other',
      items: ['REST APIs', 'Clean Architecture principles', 'SOLID', 'JWT Authentication', 'Git', 'Xamarin.Forms', 'Windows Forms', 'AI-assisted automation']
    },
    {
      id: 'productivityTools',
      labelKey: 'resume.skillGroups.productivityTools',
      items: ['Microsoft Office / Microsoft 365 (Word, Excel, PowerPoint)']
    }
  ],

  experience: [
    {
      id: 'expande',
      roleKey: 'resume.experience.role',
      company: 'Soluciones Expande',
      location: 'San José, Costa Rica',
      dateRange: { start: '2023', current: true },
      subtitleKey: 'resume.experience.subtitle',
      bulletsKey: 'resume.experience.bullets',
      logo: 'assets/images/expande-256.webp',
      highlightsKey: 'experience.jobs.expande.highlights'
    }
  ],

  projects: [
    {
      id: 'lvconstrucciones',
      name: 'LvBuild (LV Construcciones)',
      taglineKey: 'resume.projects.lvconstrucciones.tagline',
      bulletsKey: 'resume.projects.lvconstrucciones.bullets'
    }
  ],

  education: [
    {
      id: 'licentiate',
      titleKey: 'resume.education.licentiate',
      institution: 'Castro Carazo University',
      year: '2025',
      honors: true,
      degree: true
    },
    {
      id: 'bachelor',
      titleKey: 'resume.education.bachelor',
      institution: 'Castro Carazo University',
      year: '2024',
      degree: true
    },
    {
      id: 'englishCert',
      titleKey: 'resume.education.englishCert',
      institution: 'Discovery Academy',
      year: '2024'
    },
    {
      id: 'continuingEd',
      titleKey: 'resume.education.continuingEd',
      institution: 'VLA Academy',
      year: '2026',
      ongoing: true
    }
  ]
};
