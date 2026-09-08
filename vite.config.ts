/// <reference types="vitest/config" />
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Base path del sito.
 *
 * - User site  (https://JusTMeth25.github.io/)             -> BASE_PATH vuoto
 * - Project site (https://JusTMeth25.github.io/NOME-REPO/) -> BASE_PATH=NOME-REPO
 *
 * Si imposta con la variabile d'ambiente BASE_PATH al momento della build:
 *   BASE_PATH=Portfolio-Page npm run build
 * Le barre iniziali/finali sono opzionali e vengono normalizzate qui: senza la
 * barra iniziale la variabile funziona anche in Git Bash su Windows, che
 * altrimenti riscrive i valori tipo "/Nome" in un percorso Windows.
 * Il workflow GitHub Actions la calcola dal nome del repository.
 */
function normalizeBase(value: string | undefined): string {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

const basePath = normalizeBase(process.env.BASE_PATH)

/**
 * URL finale del sito, es. https://JusTMeth25.github.io/Portfolio-Page/
 * Se non è impostato, canonical / og:url / sitemap / robots NON vengono
 * generati: meglio nessun metadato che un dominio segnaposto sbagliato.
 */
const siteUrl = process.env.SITE_URL?.replace(/\/?$/, '/') ?? ''

function siteMetadata(): Plugin {
  return {
    name: 'portfolio-site-metadata',
    apply: 'build',
    transformIndexHtml(html) {
      if (!siteUrl) return html
      const tags = [
        `<link rel="canonical" href="${siteUrl}" />`,
        `<meta property="og:url" content="${siteUrl}" />`,
        `<meta property="og:image" content="${siteUrl}og-image.png" />`,
        `<meta name="twitter:image" content="${siteUrl}og-image.png" />`,
      ].join('\n    ')
      return html.replace('</head>', `  ${tags}\n  </head>`)
    },
    closeBundle() {
      if (!siteUrl) return
      const out = join(process.cwd(), 'dist')
      const today = new Date().toISOString().slice(0, 10)
      writeFileSync(
        join(out, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
      )
      writeFileSync(
        join(out, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`,
      )
    },
  }
}

export default defineConfig({
  base: basePath,
  plugins: [react(), siteMetadata()],
  build: {
    target: 'es2022',
    // Il bundle 3D viaggia in un chunk separato caricato in lazy dalla hero.
    chunkSizeWarningLimit: 900,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
