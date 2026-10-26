import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const site = (process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
const robots = `User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /login\nDisallow: /signup\nDisallow: /shared\nDisallow: /share/\nSitemap: ${site}/sitemap.xml\n`
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc></url><url><loc>${site}/about</loc></url><url><loc>${site}/help</loc></url></urlset>\n`
await Promise.all([
  writeFile(resolve('public/robots.txt'), robots),
  writeFile(resolve('public/sitemap.xml'), sitemap),
])
const html = await readFile(resolve('index.html'), 'utf8')
await writeFile(resolve('index.html'), html.replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${site}/$2`))
