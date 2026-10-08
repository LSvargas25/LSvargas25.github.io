import { ApplicationConfig, importProvidersFrom, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LucideAngularModule, Instagram, ChevronLeft, ChevronRight } from 'lucide-angular';
// Registered at the root: Angular HMR cannot resolve imported values in a component's providers
import { CASE_STUDY_ICONS } from './shared/components/Projects/case-study/case-study.icons';

import { routes } from './app.routes';
import { initLanguage } from './core/language';

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      LucideAngularModule.pick({ Instagram, ChevronLeft, ChevronRight, ...CASE_STUDY_ICONS }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideAppInitializer(initLanguage)
  ]
};
