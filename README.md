# Portafolio — Luis Steven Vargas Rodríguez

Portafolio personal en Angular 21: perfil, experiencia, proyectos como casos de estudio, CV en línea y formulario de contacto. Disponible en español e inglés.

## Stack

- Angular 21 (componentes standalone, control flow `@if`/`@for`), prerenderizado a HTML estático.
- Tailwind CSS + SCSS por componente.
- ngx-translate: textos en `src/assets/i18n/{es,en}.json`.
- EmailJS para el formulario de contacto (sin backend propio).
- GSAP/AOS para animaciones; fondo Vanta (three.js + p5) solo en escritorio, cargado bajo demanda.

## Desarrollo

```bash
npm ci
npm start          # http://localhost:4200
npm test           # pruebas unitarias (Vitest)
npm run build      # salida estática en dist/my-app/browser
```

`npm run build` ejecuta antes `scripts/generate-seo-files.mjs`, que genera `public/robots.txt` y `public/sitemap.xml` a partir de `src/site.config.json`.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Datos del CV (fuente única de experiencia, educación y contacto) | `src/app/shared/data/resume.data.ts` |
| Proyectos / casos de estudio | `src/app/shared/data/projects.data.ts` |
| Tecnologías de Professional Profile | `src/app/shared/data/skills.data.ts` |
| Textos traducidos | `src/assets/i18n/es.json`, `src/assets/i18n/en.json` |
| Título, descripción y etiquetas Open Graph | `src/app/core/seo.service.ts` |
| Dominio público e imagen OG | `src/site.config.json` |
| PDF del CV (es / en) | `src/assets/cv/` |
| Íconos de tecnologías (SVG locales) | `src/assets/icons/tech/` |

Los datos viven en archivos `*.data.ts` y el texto visible en los JSON de traducción: para agregar un proyecto se añade su entrada en `projects.data.ts` y sus claves en ambos idiomas.

## Despliegue (GitHub Pages)

Publicado en **https://lsvargas25.github.io**.

El sitio es estático (`outputMode: "static"`, la única ruta se prerenderiza). `.github/workflows/deploy.yml` corre las pruebas y el build en cada PR y, en cada push a `main`, publica `dist/my-app/browser` con `actions/upload-pages-artifact` y `actions/deploy-pages`. En **Settings → Pages** la fuente es **GitHub Actions**.

- `public/404.html` redirige cualquier ruta desconocida a la página principal.
- El dominio vive en `src/site.config.json` (canonical, Open Graph, `robots.txt` y `sitemap.xml` lo toman de ahí).
- Los PDF del CV (`src/assets/cv/`) se imprimen desde el CV en línea; si cambia el CV, hay que volver a generarlos.
