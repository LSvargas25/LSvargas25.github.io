/* ======================================================
   RESUME DATA MODEL
   Structural / non-translatable data (names, dates, links).
   Translatable text lives in assets/i18n/{es,en}.json under
   the "resume.*" keys referenced here (e.g. roleTagKey).
====================================================== */

export interface ResumeContactLink {
  /** Display text, e.g. "github.com/Lsvargas25" */
  label: string;
  /** Full URL used in the href */
  url: string;
}

export interface ResumeContact {
  location: string;
  phoneDisplay: string;
  /** tel: href, digits only after the scheme */
  phoneHref: string;
  email: string;
  github: ResumeContactLink;
  linkedin: ResumeContactLink;
}

export interface ResumeDateRange {
  start: string;
  /** Omit when `current` is true */
  end?: string;
  /** Renders as the translated "Present" label instead of `end` */
  current?: boolean;
}

export interface ResumeSkillGroup {
  id: string;
  /** i18n key for the category label (e.g. "Databases") */
  labelKey: string;
  /** Technology names — not translated */
  items: string[];
}

export interface ResumeExperienceEntry {
  id: string;
  /** i18n key for the role title */
  roleKey: string;
  /** Company name — not translated */
  company: string;
  /** Location shown in the subtitle — not translated */
  location: string;
  dateRange: ResumeDateRange;
  /** i18n key for the subtitle sentence; interpolates {{location}} */
  subtitleKey: string;
  /** i18n key pointing to an array of bullet strings */
  bulletsKey: string;
  /** Company logo for the Experience section */
  logo?: string;
  /** i18n key for the short bullets (max. two lines each) shown in the Experience section */
  highlightsKey?: string;
}

export interface ResumeProjectEntry {
  id: string;
  /** Project name — not translated */
  name: string;
  /** i18n key for the one-line tagline */
  taglineKey: string;
  /** i18n key pointing to an array of bullet strings */
  bulletsKey: string;
}

export interface ResumeEducationEntry {
  id: string;
  /** i18n key for the degree/certification title */
  titleKey: string;
  /** Institution name — not translated */
  institution: string;
  /** Year — not translated */
  year: string;
  /** Shows the translated "(ongoing)" suffix */
  ongoing?: boolean;
  /** Shows the translated "graduated with honors" note */
  honors?: boolean;
  /** Formal degree (shown in the Experience timeline); certifications and courses are not */
  degree?: boolean;
}

export interface ResumeData {
  /** Full name — not translated */
  fullName: string;
  /** i18n key for the role tagline under the name */
  roleTagKey: string;
  contact: ResumeContact;
  /** Downloadable CV per language (printed from the online CV), read by the download logic */
  pdf: Record<'es' | 'en', { path: string; fileName: string }>;
  skills: ResumeSkillGroup[];
  experience: ResumeExperienceEntry[];
  projects: ResumeProjectEntry[];
  education: ResumeEducationEntry[];
}
