import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import SITE from '../../site.config.json';

/**
 * Keeps <html lang>, the document title and the description / Open Graph /
 * Twitter Card tags in sync with the active language. The site is prerendered,
 * so the Spanish values are baked into index.html for link previews (LinkedIn,
 * WhatsApp) that don't run JavaScript. The domain comes from src/site.config.json.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  private readonly siteUrl = SITE.url.replace(/\/+$/, '');
  private started = false;

  init(): void {
    if (this.started) return;
    this.started = true;
    this.translate.onLangChange.subscribe(({ lang }) => this.apply(lang));
    if (this.translate.currentLang) this.apply(this.translate.currentLang);
  }

  private apply(lang: string): void {
    const t = (key: string) => this.translate.instant(key) as string;
    const title = t('seo.title');
    const description = t('seo.description');
    const image = `${this.siteUrl}${SITE.ogImage}`;
    const url = `${this.siteUrl}/`;

    this.document.documentElement.lang = lang;
    this.title.setTitle(title);

    const tags: Array<{ name?: string; property?: string; content: string }> = [
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Luis Steven Vargas Rodríguez' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: t('seo.imageAlt') },
      { property: 'og:locale', content: lang === 'en' ? 'en_US' : 'es_CR' },
      { property: 'og:locale:alternate', content: lang === 'en' ? 'es_CR' : 'en_US' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: t('seo.imageAlt') }
    ];
    for (const tag of tags) {
      const selector = tag.name ? `name="${tag.name}"` : `property="${tag.property}"`;
      this.meta.updateTag(tag, selector);
    }

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }
}
