// Writes public/robots.txt and public/sitemap.xml from src/site.config.json,
// so the final domain lives in exactly one place. Runs before every build
// (see the "prebuild" script in package.json).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { url } = JSON.parse(readFileSync(join(root, 'src/site.config.json'), 'utf8'));
const site = url.replace(/\/+$/, '');

if (site.includes('example.com')) {
  console.warn('[seo] site.config.json still uses the example.com placeholder; set the real domain before going live.');
}

writeFileSync(join(root, 'public/robots.txt'),
`User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`);

writeFileSync(join(root, 'public/sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

console.log(`[seo] robots.txt and sitemap.xml written for ${site}`);
