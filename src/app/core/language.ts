import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type AppLanguage = 'es' | 'en';
export const LANG_STORAGE_KEY = 'lang';

/**
 * Picks the language before the first render (saved choice, then browser
 * language, then Spanish) and waits for its JSON. Doing this in a component's
 * ngOnInit changed already-checked bindings (NG0100) and briefly showed keys.
 */
export function initLanguage(): Promise<unknown> {
  const translate = inject(TranslateService);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  translate.addLangs(['es', 'en']);
  translate.setDefaultLang('es');

  let lang: AppLanguage = 'es';
  if (isBrowser) {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      /* storage blocked: fall back to the browser language */
    }
    if (saved === 'es' || saved === 'en') lang = saved;
    else if (translate.getBrowserLang() === 'en') lang = 'en';
  }

  // A failed load must not block the app; the default language still renders
  return firstValueFrom(translate.use(lang)).catch(() => undefined);
}
