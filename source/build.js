// Prerenders every route of the Nhơn Thịnh single-file site into static HTML for Vercel.
// Usage: node build.js <source.html> <outDir>
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const [, , SRC, OUT] = process.argv;
let src = fs.readFileSync(SRC, 'utf8');

// asset paths become root-relative so nested routes (/en/services) still find them
src = src.replace(/'img\//g, "'/img/").replace(/\\'img\//g, "\\'/img/");

const HEAD_EXTRA = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#01092D">
<style>html{-webkit-text-size-adjust:100%}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>
<script>window.__ROUTING='path'</script>
`;
const page = '<!doctype html>\n' + HEAD_EXTRA + src;

const vc = new VirtualConsole();
vc.on('jsdomError', e => { if (!/Not implemented/.test(String(e))) console.error('jsdom:', e.message); });

function render(url){
  const dom = new JSDOM(page, {
    url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w){
      w.__ROUTING = 'path';
      w.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = () => {};
    }
  });
  const w = dom.window;
  const html = '<!doctype html>\n' + w.document.documentElement.outerHTML;
  const info = { title: w.document.title, robots: w.document.querySelector('meta[name=robots]')?.content, lang: w.document.documentElement.lang,
                 h1: w.document.querySelectorAll('h1').length, main: w.document.getElementById('main').textContent.trim().length };
  w.close();
  return { html, info };
}

const SITE = 'https://__SITE__';
const routes = [];
// pull routes from the app itself so the list never drifts
{
  const dom = new JSDOM(page, { url: SITE + '/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w){ w.__ROUTING='path'; w.matchMedia = () => ({ matches:false, addListener(){}, removeListener(){} }); w.scrollTo = () => {}; } });
  const w = dom.window;
  const get = expr => w.eval(expr);
  const pages = Object.keys(get('PAGES'));
  for (const p of pages) for (const lang of ['vi','en']) routes.push({ path: get(`tok2path(tokenFor(${JSON.stringify(p)}, ${JSON.stringify(lang)}))`), page: p, lang });
  const evs = get('allEvents().map(e => ({slug:e.slug, demo:!!e.demo}))');
  for (const e of evs) for (const lang of ['vi','en']) routes.push({ path: get(`tok2path(tokenFor('event', ${JSON.stringify(lang)}, ${JSON.stringify(e.slug)}))`), page: 'event', lang, demo: e.demo });
  routes.siteUrl = get('CONFIG.siteUrl').replace(/\/$/, '');
  w.close();
}

const out = (p) => p === '/' ? 'index.html' : p.replace(/^\//, '') + '/index.html';
const report = [];
for (const r of routes){
  const { html, info } = render(routes.siteUrl + r.path);
  const file = path.join(OUT, out(r.path));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  report.push({ ...r, ...info });
}
{ const { html } = render(routes.siteUrl + '/khong-ton-tai'); fs.writeFileSync(path.join(OUT, '404.html'), html); }

// sitemap: indexable pages only, with language alternates
const today = new Date().toISOString().slice(0, 10);
const byKey = {};
report.filter(r => r.robots && r.robots.startsWith('index')).forEach(r => { const k = r.page + (r.page === 'event' ? r.path.split('/').pop() : ''); (byKey[k] = byKey[k] || {})[r.lang] = r.path; });
const urls = Object.values(byKey).flatMap(alts => Object.entries(alts).map(([lang, p]) => `  <url>
    <loc>${routes.siteUrl}${p}</loc>
    <lastmod>${today}</lastmod>
${Object.entries(alts).map(([l, ap]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${routes.siteUrl}${ap}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${routes.siteUrl}${alts.vi || p}"/>
  </url>`));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${routes.siteUrl}/sitemap.xml
`);
fs.writeFileSync(path.join(OUT, 'vercel.json'), JSON.stringify({
  cleanUrls: true,
  trailingSlash: false,
  headers: [
    { source: '/img/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    { source: '/(.*)', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] }
  ]
}, null, 2) + '\n');

console.table(report.map(r => ({ path: r.path, lang: r.lang, robots: (r.robots || '').split(',')[0], h1: r.h1, chars: r.main, title: r.title.slice(0, 48) })));
console.log('sitemap urls:', urls.length);
