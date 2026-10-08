/* ======================================================
   PROJECTS DATA MODEL
   Structural / non-translatable data (names, links, tech).
   Translatable copy lives in assets/i18n/{es,en}.json under
   "projects.items.<id>.*" — the *Key fields below point to it.
   Every case-study section is optional: when its field is
   omitted the section is not rendered.
====================================================== */

export type ProjectId = 'lvbuild' | 'fitros' | 'pokedex' | 'expande' | 'fithouse' | 'vcbike' | 'finanzas';

export interface ProjectTechIcon {
  /** Display name, used as alt/title — not translated */
  name: string;
  /** Icon URL (CDN or local asset) */
  icon: string;
}

export interface ProjectStackGroup {
  /** i18n key for the group label (e.g. "Backend") */
  labelKey: string;
  /** Technology names — not translated */
  items: string[];
}

export interface ProjectLayer {
  /** Project / layer name — not translated */
  name: string;
  /** i18n key for a one-line responsibility */
  responsibilityKey?: string;
}

export interface ProjectArchitecture {
  /**
   * How the tiers are drawn:
   * - 'rings': nested layers, first tier outermost, last tier at the core
   *   (Clean Architecture: dependencies point inward).
   * - 'flow': tiers left to right with arrows meaning "calls".
   */
  layout?: 'rings' | 'flow';
  tiers?: ProjectLayer[][];
  /** i18n key for the sentence explaining the diagram */
  summaryKey?: string;
  /** i18n key pointing to an array of bullet strings */
  pointsKey?: string;
  /**
   * i18n key pointing to an array of state machines:
   * { name, path: [{ label, note? }], branches? }
   */
  stateMachinesKey?: string;
}

/** Shape of one translated state machine (see ProjectArchitecture.stateMachinesKey) */
export interface ProjectStateMachine {
  name: string;
  path: { label: string; note?: string }[];
  branches?: string;
}

export interface ProjectHighlight {
  /** lucide icon name; must be listed in case-study.icons.ts */
  icon: string;
  /** i18n key for the short label */
  labelKey: string;
}

/** Drives the icon and label of a testing block */
export type ProjectTestKind = 'unit' | 'http' | 'integration' | 'component' | 'e2e' | 'ci';

export interface ProjectTestSuite {
  /** Unique within the project */
  id: string;
  /** Picks the icon */
  kind: ProjectTestKind;
  /** Which side of the app the suite covers; omitted for CI */
  scope?: 'backend' | 'frontend' | 'mobile';
  /** Tools / libraries — not translated */
  tools: string[];
  /** i18n key for the block label (e.g. "Unit tests of services") */
  titleKey: string;
  /** i18n key for an optional sentence on what the suite covers */
  descriptionKey?: string;
  /** i18n key pointing to an array of concrete things the suite validates */
  validatesKey: string;
}

export interface ProjectTesting {
  suites: ProjectTestSuite[];
}

export interface ProjectLinks {
  demo?: {
    url: string;
    /** Free hosting that sleeps when idle: shows the "may take a while to wake up" notice */
    coldStart?: boolean;
    /** i18n key for how to get in (e.g. "Play as a guest, no sign-up") */
    accessKey?: string;
    /** i18n key for a note on what the demo is (e.g. who the full version was built for) */
    noteKey?: string;
  };
  /** Swagger / OpenAPI docs */
  apiDocs?: string;
  backendRepo?: string;
  frontendRepo?: string;
  /** Single repository holding the whole project (rendered as one "Code" button) */
  repo?: string;
  /** Repo behind the card's "View code" button when there are two; defaults to the backend */
  primaryRepo?: 'backend' | 'frontend';
}

export interface ProjectCaseStudy {
  id: ProjectId;
  /** Project name — not translated */
  name: string;
  /** Not shown in the carousel; kept so it can be re-enabled later */
  hidden?: boolean;
  /** Source code is private: renders a disabled "Private code" button instead of repo links */
  privateCode?: boolean;
  /** i18n key for the line shown in the private-code panel (e.g. who owns the code) */
  privateNoteKey?: string;

  /**
   * Screenshot of the live demo: when set, the carousel card shows it instead of the
   * avatar, together with the demo and code buttons.
   */
  cardShot?: string;
  /** Round avatar on the carousel card */
  cardImage: string;
  /** i18n key for the avatar's alt text; falls back to the project name */
  cardImageAltKey?: string;
  /** The image is already a full circle: fill the avatar edge to edge, no white backing */
  cardImageFill?: boolean;
  /** Wide image at the top of the case study; falls back to the card avatar */
  heroImage?: string;
  /** Glow class shared with the global syncPulse animation (styles.scss) */
  glowClass: string;
  /** Accent color as an "r, g, b" triplet, used by the case-study modal */
  accentRgb: string;

  /** i18n key for the short card description */
  cardDescriptionKey: string;
  techIcons: ProjectTechIcon[];

  /** i18n key for the one-line tagline under the name */
  taglineKey: string;
  /** Key facts shown under the tagline — only facts already present in the copy */
  highlights?: ProjectHighlight[];
  stack?: ProjectStackGroup[];

  problemKey?: string;
  solutionKey?: string;
  roleKey?: string;
  architecture?: ProjectArchitecture;
  /** i18n keys pointing to arrays of bullet strings */
  decisionsKey?: string;
  featuresKey?: string;
  /** lucide icon per feature, in the same order as the translated features array */
  featureIcons?: string[];
  testing?: ProjectTesting;

  links: ProjectLinks;
}
