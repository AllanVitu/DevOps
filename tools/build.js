#!/usr/bin/env node
/* ==========================================================================
   BUILD.JS — Renders docs/ from tools/projects.js, tools/profile.js and
   tools/apps.js.

   The homepage is a bento grid of tiles; each published project gets a
   case-study page built from the same tiles, and the downloadable Windows
   apps share one launch page (apps/). Output is committed, so GitHub Pages
   needs no build step.

       node tools/build.js

   Zero runtime dependencies.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ICONS = require('./icons');
const SPRITES = require('./sprites');
const DIMS = require('./dimensions.json');
const PROJECTS = require('./projects');
const PROFILE = require('./profile');
const { apps: APPS, faq: FAQ } = require('./apps');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

/* Repositories with published work get a case-study page; 'soon' ones do not. */
const PAGES = PROJECTS.filter((p) => p.tier !== 'soon');
const SOON = PROJECTS.filter((p) => p.tier === 'soon');

/* --------------------------------------------------------------------------
   SITE CONSTANTS
   BASE must match the URL GitHub Pages actually serves docs/ from. It only
   affects canonical URLs, Open Graph and the sitemap.
   -------------------------------------------------------------------------- */
const SITE = {
    base: 'https://allanvitu.github.io/DevOps/docs/',
    name: 'Allan Vitu',
    role: 'Développeur Full-Stack & DevOps',
    email: 'allan.vitu90@gmail.com',
    year: 2026,
    github: 'https://github.com/allanvitu',
    linkedin: 'https://www.linkedin.com/in/allan-vitu-74a11039a/',
    instagram: 'https://www.instagram.com/allan.vitu/',
    doc: 'doc_technique/fiche-technique.html',
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
/* Display faces of the apps page only: condensed headings and the pixel font of TheEclipseCraft. */
const APP_FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,600..800&family=Pixelify+Sans:wght@500;700&display=swap';

/* Downloads are GitHub release assets: the builds are too large for the repository. */
const RELEASES = 'https://github.com/AllanVitu/DevOps/releases';

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const up = (depth) => (depth === 0 ? './' : '../');
const repoName = (p) => p.repo.split('/').pop();
const num = (p) => String(PROJECTS.indexOf(p) + 1).padStart(2, '0');

/**
 * Collects every icon id a page requests, so each page ships only its own sprite.
 *
 * `icon()` calls are spread throughout the template literals, which evaluate
 * left to right — the sprite therefore cannot be serialised inline, or it would
 * only contain the icons requested before it. Templates emit SPRITE_SLOT and
 * `resolve()` swaps in the finished sprite once the whole page is rendered.
 */
const SPRITE_SLOT = '<!--sprite-->';

function makeIconSet() {
    const used = new Set();

    const icon = (name, cls = 'icon') => {
        if (!ICONS[name]) throw new Error(`unknown icon: ${name}`);
        used.add(name);
        return `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
    };

    const resolve = (html) => {
        if (!html.includes(SPRITE_SLOT)) throw new Error('page template is missing SPRITE_SLOT');
        const sprite =
            `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
            [...used]
                .sort()
                .map(
                    (n) =>
                        `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</symbol>`
                )
                .join('') +
            `</svg>`;
        return html.replace(SPRITE_SLOT, sprite);
    };

    return { icon, resolve };
}

/** <picture> with AVIF + WebP and intrinsic dimensions, so nothing shifts on load. */
function picture(key, alt, { lazy = true, sizes = null, cls = '' } = {}) {
    const dim = DIMS[key];
    if (!dim) throw new Error(`no dimensions for: ${key}`);
    const src = (ext) => `ASSETS${key}.${ext}`;
    return (
        `<picture>` +
        `<source type="image/avif" srcset="${src('avif')}"${sizes ? ` sizes="${sizes}"` : ''}>` +
        `<img src="${src('webp')}" alt="${esc(alt)}" width="${dim.w}" height="${dim.h}"` +
        `${cls ? ` class="${cls}"` : ''}` +
        ` loading="${lazy ? 'lazy' : 'eager'}" decoding="async"${lazy ? '' : ' fetchpriority="high"'}>` +
        `</picture>`
    );
}

/** Inline SVG of a pixel sprite from sprites.js: one <rect> per horizontal run of one colour. */
function pixelArt(name) {
    const sprite = SPRITES[name];
    if (!sprite) throw new Error(`unknown sprite: ${name}`);
    const { rows, colors } = sprite;
    const rects = [];
    rows.forEach((row, y) => {
        for (let x = 0; x < row.length; ) {
            const c = row[x];
            let end = x + 1;
            while (row[end] === c) end++;
            if (c !== '.') rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${colors[c]}"/>`);
            x = end;
        }
    });
    return `<svg class="pixel" viewBox="0 0 ${rows[0].length} ${rows.length}" aria-hidden="true">${rects.join('')}</svg>`;
}

/* --------------------------------------------------------------------------
   APPS — downloadable Windows apps (tools/apps.js)
   -------------------------------------------------------------------------- */
const downloadUrl = (a) => `${RELEASES}/download/${a.download.tag}/${a.download.file}`;

/** The flavor of an app as CSS variables, under --f-* (or another prefix). */
const flavorVars = (a, p = 'f') => {
    const f = a.flavor;
    return `--${p}-a:${f.a};--${p}-b:${f.b};--${p}-deep:${f.deep};--${p}-pop:${f.pop};--${p}-on:${f.on};--${p}-text:${f.text};`;
};

/** The software box of an app, in CSS 3D (styles in site.css). Decorative. */
function box(a, { cls = '', s = null } = {}) {
    const dim = DIMS[`media/${a.media}/icon`];
    if (!dim) throw new Error(`no dimensions for: media/${a.media}/icon`);
    return (
        `<div class="box${cls ? ` ${cls}` : ''}" style="${flavorVars(a)}${s ? `--s:${s};` : ''}" aria-hidden="true"><div class="box-3d">` +
        `<div class="face front" data-pattern="${a.flavor.pattern}">` +
        `<span class="box-meta"><span>${esc(SITE.name)}</span><b>v${esc(a.version)}</b></span>` +
        `<img src="ASSETSmedia/${a.media}/icon.png" alt="" width="${dim.w}" height="${dim.h}" loading="lazy" decoding="async">` +
        `<span class="box-name">${esc(a.name)}</span><span class="box-tag">${esc(a.box.tag)}</span></div>` +
        `<div class="face back"><b>${esc(a.name)}</b><ul>${a.box.back.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><span class="box-code"></span></div>` +
        `<div class="face side right"><span>${esc(a.name)}</span></div>` +
        `<div class="face side left"><span>${esc(a.box.spine)}</span></div>` +
        `<div class="face cap top"></div><div class="face cap bottom"></div>` +
        `</div></div>`
    );
}

/* --------------------------------------------------------------------------
   BRAND MARKS
   Simple-Icons paths — these are filled, not stroked, so they stay out of the
   Lucide sprite.
   -------------------------------------------------------------------------- */
const BRAND = {
    github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    instagram: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.668-.014 4.948-.072c1.277-.06 2.148-.261 2.913-.558.788-.306 1.459-.717 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
    mail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.907 1.528-1.148C21.69 2.28 24 3.434 24 5.457z',
};

const brandIcon = (name, cls = 'icon') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="${BRAND[name]}"/></svg>`;

const SOCIALS = [
    ['mail', `mailto:${SITE.email}`, 'E-mail'],
    ['github', SITE.github, 'GitHub'],
    ['linkedin', SITE.linkedin, 'LinkedIn'],
    ['instagram', SITE.instagram, 'Instagram'],
];

const ext = (href) => (href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '');

/* --------------------------------------------------------------------------
   SHELL
   -------------------------------------------------------------------------- */
/* `css` lists the page's stylesheets beyond site.css; `fonts` its extra Google Fonts URLs. */
function head({ title, description, canonical, ogImage, depth, css = [], fonts = [] }) {
    const u = up(depth);
    const extraFonts = fonts
        .map((f) => `\n<link rel="stylesheet" media="print" onload="this.media='all'" href="${f}">\n<noscript><link rel="stylesheet" href="${f}"></noscript>`)
        .join('');
    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${SITE.name}">
<link rel="canonical" href="${canonical}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name} — Portfolio">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" href="${u}assets/brand/icon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="${u}assets/brand/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${u}assets/brand/icon-180.png">
<link rel="manifest" href="${u}site.webmanifest">
<meta name="theme-color" content="#eeeef1">

<script>
/* Resolve the theme before first paint so the page never flashes. */
(function(){try{var s=localStorage.getItem('theme');
document.documentElement.dataset.theme=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
}catch(e){document.documentElement.dataset.theme='light';}})();
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONTS}">
<link rel="stylesheet" media="print" onload="this.media='all'" href="${FONTS}">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>${extraFonts}

<link rel="stylesheet" href="${u}css/site.css">${css.map((name) => `\n<link rel="stylesheet" href="${u}css/${name}.css">`).join('')}
</head>`;
}

const themeToggle = (icon) =>
    `<button class="theme-toggle" id="themeToggle" type="button" aria-label="Changer de thème">${icon('sun', 'icon icon-sun')}${icon('moon', 'icon icon-moon')}</button>`;

function footer({ depth, scripts = [] }) {
    const u = up(depth);
    return `
    <footer class="footer">
        <p>&copy; ${SITE.year} ${SITE.name} — ${SITE.role}</p>
        <nav aria-label="Liens">
            <a href="${u}${SITE.doc}">Fiche technique</a>
            <a href="${SITE.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:${SITE.email}">${SITE.email}</a>
        </nav>
    </footer>

    <script src="${u}js/app.js" defer></script>${scripts.map((name) => `\n    <script src="${u}js/${name}.js" defer></script>`).join('')}`;
}

/* --------------------------------------------------------------------------
   HOMEPAGE — BENTO
   -------------------------------------------------------------------------- */
function buildIndex() {
    const { icon, resolve } = makeIconSet();
    const featured = PROJECTS.filter((p) => p.tier === 'featured');
    let i = 0; // stagger index for the entrance animation
    const arrow = `<span class="arrow" aria-hidden="true">${icon('arrow-right')}</span>`;

    /* A featured project, in the tile style its entry asks for. The first two
       take the named areas p1 / p2; any further one is auto-placed. */
    const featuredTile = (p, n) => {
        const area = n < 2 ? `grid-area:p${n + 1};` : '';
        const attrs = `class="tile tile--link t-${p.tile.style}" href="./projects/${p.slug}.html" data-accent="${p.theme}" style="${area}--i:${++i}" aria-label="Étude de cas ${esc(p.name)} — ${esc(p.kind)}"`;

        if (p.tile.style === 'rack') {
            return `
            <a ${attrs}>
                ${arrow}
                <p class="eyebrow">${esc(p.kind)} · ${esc(p.period)}</p>
                <h2><img class="logo" src="ASSETS${p.tile.logo}" alt="${esc(p.name)}" width="448" height="96"></h2>
                <p>${esc(p.tagline)}</p>
                <span class="rack">${p.tile.rack
                    .map(([file, label]) => `<span title="${esc(label)}"><img src="ASSETSmedia/${p.media}/render/${file}.webp" alt="${esc(label)}" width="512" height="512" loading="lazy" decoding="async"></span>`)
                    .join('')}</span>
            </a>`;
        }

        return `
            <a ${attrs}>
                ${arrow}
                <p class="eyebrow">${esc(p.kind)}</p>
                <h2>${esc(p.name)}</h2>
                <dl class="nums">${p.metrics
                    .slice(0, 3)
                    .map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`)
                    .join('')}</dl>
                <span class="shot">${picture(`media/${p.media}/${p.cover}`, p.slides[0][1], {
                    lazy: false,
                    sizes: '(max-width: 700px) 92vw, (max-width: 1180px) 60vw, 560px',
                })}</span>
            </a>`;
    };

    /* The downloadable apps, as one full-width banner linking to apps/. Its
       colours come from the first two flavors. */
    const appsTile = () => {
        if (APPS.length < 2) return '';
        const [a, b] = APPS;
        const names = APPS.map((x) => esc(x.name));
        const band = [...names, 'Gratuit', 'Windows 10 · 11', 'ZIP portable', 'Sans compte'].join(' ✦ ');
        return `
            <a class="tile tile--link t-apps" href="./apps/" style="${flavorVars(a, 'fa')}${flavorVars(b, 'fb')}--i:${++i}" aria-label="Télécharger mes apps Windows : ${names.join(' et ')}">
                ${arrow}
                <div class="copy">
                    <p class="eyebrow">À télécharger · Windows</p>
                    <h2>Deux apps Windows,<br>prêtes à installer.</h2>
                    <p>${names.join(' et ')} : gratuites, sans compte, en ZIP portable. Présentation complète et téléchargement sur la page dédiée.</p>
                    <ul class="chips">${APPS.map((x) => `<li class="chip">${esc(x.name)} ${esc(x.version)} · ${esc(x.download.size)}</li>`).join('')}</ul>
                </div>
                <span class="duo">${APPS.map((x) => box(x)).join('')}</span>
                <span class="band" aria-hidden="true"><span>${band} ✦ ${band} ✦ ${band} ✦ ${band} ✦ </span></span>
            </a>`;
    };

    const soonTile = (p, n) => `
            <a class="tile tile--link t-soon" href="${p.repo}" target="_blank" rel="noopener noreferrer" data-accent="${p.theme}" style="${n === 0 ? 'grid-area:soon;' : ''}--i:${++i}" aria-label="Dépôt ${esc(p.name)} sur GitHub — ${esc(p.kind)}">
                ${arrow}
                <p class="eyebrow">${esc(p.kind)}</p>
                <div><h2>${esc(p.name)}</h2><p>${esc(p.tagline)}</p></div>
            </a>`;

    const parcours = PROFILE.parcours
        .map((s) => {
            const p = s.project && PROJECTS.find((x) => x.slug === s.project);
            const title = p && p.tier !== 'soon' ? `<a href="./projects/${p.slug}.html">${esc(s.title)}</a>` : esc(s.title);
            return `<li${p ? ` data-accent="${p.theme}"` : ''}><time>${esc(s.date)}</time><div><b>${title}</b><span>${esc(s.org)}</span></div></li>`;
        })
        .join('\n                    ');

    const tiles = `
            <section class="tile t-intro" style="--i:0" aria-labelledby="name">
                <div class="top">
                    <p class="status">${esc(PROFILE.status)}</p>
                    ${themeToggle(icon)}
                </div>
                <h1 id="name">${esc(PROFILE.first)}<br>${esc(PROFILE.last)}</h1>
                <p class="role">${esc(SITE.role)}</p>
                <p class="pitch">${esc(PROFILE.pitch)} ${PAGES.length} projets publiés, ${SOON.length} en préparation.</p>
                <div class="ctas">
                    <a class="btn btn--ink" href="mailto:${SITE.email}">${icon('mail')} Me contacter</a>
                    <a class="btn btn--soft" href="./${SITE.doc}">${icon('file-code')} Fiche technique</a>
                </div>
            </section>
${featured.map(featuredTile).join('')}
${appsTile()}

            <figure class="tile t-photo" style="--i:${++i}">
                ${picture(PROFILE.avatar, 'Portrait d’Allan Vitu', { sizes: '(max-width: 700px) 92vw, 240px' })}
                <figcaption>${icon('map')} ${esc(PROFILE.location)}</figcaption>
            </figure>

            <section class="tile t-git" style="--i:${++i}" aria-labelledby="gh">
                <h2 class="eyebrow" id="gh">GitHub</h2>
                <p class="count"><b>${PROJECTS.length}</b> dépôts publics</p>
                <ul>${PROJECTS.map((p) => `<li><a href="${p.repo}" target="_blank" rel="noopener noreferrer">${esc(repoName(p))} ${icon('arrow-right')}</a></li>`).join('')}</ul>
            </section>

            <section class="tile t-path" style="--i:${++i}" aria-labelledby="path">
                <h2 class="eyebrow" id="path">Parcours</h2>
                <ol>
                    ${parcours}
                </ol>
            </section>

            <section class="tile t-stack" style="--i:${++i}" aria-labelledby="stack">
                <h2 class="eyebrow" id="stack">Stack</h2>
                <ul>${PROFILE.stack
                    .flatMap((g, gi) => g.items.map((it) => `<li class="chip${gi === 0 ? ' chip--accent' : ''}">${esc(it)}</li>`))
                    .join('')}</ul>
            </section>
${SOON.map(soonTile).join('')}

            <section class="tile t-contact" id="contact" style="--i:${++i}" aria-labelledby="contact-t">
                <h2 class="eyebrow" id="contact-t">Contact</h2>
                <p class="big">Travaillons<br>ensemble.</p>
                <div class="soc">${SOCIALS.map(([n, href, label]) => `<a href="${href}"${ext(href)} aria-label="${label}">${brandIcon(n)}</a>`).join('')}</div>
            </section>`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: SITE.name,
        jobTitle: SITE.role,
        email: `mailto:${SITE.email}`,
        url: SITE.base,
        image: `${SITE.base}assets/media/avatar.webp`,
        sameAs: [SITE.github, SITE.linkedin, SITE.instagram],
        knowsAbout: ['Vue.js', 'Vite', 'PHP', 'Docker', 'CI/CD', 'Progressive Web Apps', 'Claude API', 'DevOps'],
        alumniOf: { '@type': 'EducationalOrganization', name: 'Centre de Réadaptation de Mulhouse' },
        makesOffer: [
            ...PAGES.map((p) => ({
                '@type': 'Offer',
                itemOffered: { '@type': 'SoftwareApplication', name: p.name, description: p.summary, url: p.live || p.repo },
            })),
            ...APPS.map((a) => ({
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
                itemOffered: { '@type': 'SoftwareApplication', name: a.name, description: a.pitch, url: `${SITE.base}apps/#${a.slug}` },
            })),
        ],
    });

    const body = `<body class="home">
${SPRITE_SLOT}
    <a class="skip-link" href="#main">Aller au contenu</a>

    <main id="main" class="bento">${tiles}
    </main>
${footer({ depth: 0 })}
    <script type="application/ld+json">${jsonLd}</script>
</body>
</html>
`;

    return resolve(
        head({
            title: `${SITE.name} — ${SITE.role}`,
            description:
                "Portfolio d'Allan Vitu, développeur Full-Stack & DevOps : DevToolbox (PWA Vue 3 avec IA intégrée), BoxCraft (resource pack Minecraft), deux apps Windows à télécharger et les projets à venir.",
            canonical: SITE.base,
            ogImage: `${SITE.base}assets/media/devtoolbox/dashboard.webp`,
            depth: 0,
        }) + body
    );
}

/* --------------------------------------------------------------------------
   PROJECT PAGE
   -------------------------------------------------------------------------- */
function buildProject(p, index) {
    const { icon, resolve } = makeIconSet();
    const prev = PAGES[index - 1];
    const next = PAGES[index + 1];

    const actions = [
        p.live ? `<a class="btn btn--accent" href="${p.live}" target="_blank" rel="noopener noreferrer">Ouvrir ${esc(p.name)} ${icon('external-link')}</a>` : '',
        `<a class="btn ${p.live ? 'btn--soft' : 'btn--accent'}" href="${p.repo}" target="_blank" rel="noopener noreferrer">${brandIcon('github')} Code source</a>`,
        p.doc ? `<a class="btn btn--soft" href="../doc_technique/${p.doc}">${icon('file-code')} Fiche technique</a>` : '',
    ].filter(Boolean).join('\n                        ');

    const slides = p.slides
        .map(
            ([file, alt], i) =>
                `<div class="carousel-slide" aria-hidden="${i !== 0}">${picture(`media/${p.media}/${file}`, alt, {
                    lazy: i > 0,
                    sizes: '(max-width: 1100px) 100vw, 920px',
                })}</div>`
        )
        .join('\n                        ');

    const dots = p.slides
        .map((_, i) => `<button class="carousel-dot" type="button" aria-current="${i === 0}" aria-label="Vue ${i + 1} sur ${p.slides.length}"></button>`)
        .join('');

    const specs = p.specs
        .map(
            ([ic, title, text]) => `
                <li class="tile"><span class="c-icon">${icon(ic)}</span><div><strong>${esc(title)}</strong><span>${esc(text)}</span></div></li>`
        )
        .join('');

    const story = p.narrative
        ? `
        <div class="c-title"><h2>Le raisonnement</h2><p>Problème → Solution → Résultat</p></div>
        <div class="c-row c-3 c-story">
            <article class="tile"><h3 class="eyebrow">${icon('circle-alert')} Le problème</h3><p>${esc(p.narrative.problem)}</p></article>
            <article class="tile"><h3 class="eyebrow">${icon('lightbulb')} La solution</h3><p>${esc(p.narrative.solution)}</p></article>
            <article class="tile is-outcome"><h3 class="eyebrow">${icon('target')} Le résultat</h3><p>${esc(p.narrative.outcome)}</p></article>
        </div>`
        : '';

    const metrics = p.metrics
        ? `
        <div class="c-title"><h2>En chiffres</h2><p>Périmètre réel du projet</p></div>
        <dl class="tile c-metrics">
            ${p.metrics.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('\n            ')}
        </dl>`
        : '';

    const features = p.features
        ? `
        <div class="c-title"><h2>Architecture &amp; modules</h2><p>${esc(p.featuresSub || '')}</p></div>
        <div class="c-row ${p.features.length % 3 === 0 ? 'c-3' : 'c-2'}">
            ${p.features
                .map(
                    ([ic, title, html, tags]) => `<article class="tile c-feature">
                <header><span class="c-icon">${icon(ic)}</span><h3>${esc(title)}</h3></header>
                <p>${html}</p>
                <ul class="chips">${tags.map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul>
            </article>`
                )
                .join('\n            ')}
        </div>`
        : '';

    const end = `
        <div class="c-row c-end">
            <section class="tile c-stack" aria-labelledby="stack-t">
                <h2 class="eyebrow" id="stack-t" style="color:var(--accent)">Stack technique</h2>
                ${p.stack
                    .map(([group, items]) => `<div><h3 class="eyebrow">${esc(group)}</h3><ul>${items.map((it) => `<li class="chip chip--accent">${esc(it)}</li>`).join('')}</ul></div>`)
                    .join('\n                ')}
            </section>
            ${
                p.doc
                    ? `<aside class="tile c-doc">
                <div><p class="eyebrow">Documentation</p><h2>Fiche technique</h2><p>Contenu, langages, technologies et évolution du dépôt, sur une page.</p></div>
                <a class="btn" href="../doc_technique/${p.doc}">Lire la fiche ${icon('arrow-right')}</a>
            </aside>`
                    : ''
            }
        </div>`;

    const pagerLink = (target, dir) => {
        const [cls, ic, lbl] = dir === 'prev' ? ['prev', 'arrow-left', 'Projet précédent'] : ['next', 'arrow-right', 'Projet suivant'];
        return target
            ? `<a class="tile tile--link ${cls}" href="./${target.slug}.html" data-accent="${target.theme}">${icon(ic)}<span><span class="lbl">${lbl}</span><span class="ttl">${esc(target.name)}</span></span></a>`
            : `<a class="tile tile--link ${cls}" href="../">${icon(ic)}<span><span class="lbl">Retour</span><span class="ttl">Accueil</span></span></a>`;
    };

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: p.name,
        description: p.summary,
        url: p.live || p.repo,
        applicationCategory: p.live ? 'WebApplication' : 'GameApplication',
        operatingSystem: p.live ? 'Web' : 'Minecraft Java Edition',
        author: { '@type': 'Person', name: SITE.name, url: SITE.base },
        image: `${SITE.base}assets/media/${p.media}/${p.cover}.webp`,
    });

    const body = `<body data-accent="${p.theme}">
${SPRITE_SLOT}
    <a class="skip-link" href="#main">Aller au contenu</a>

    <header class="topbar">
        <a class="brand" href="../">${picture(PROFILE.avatar, '', { sizes: '34px' })} ${SITE.name}</a>
        <nav aria-label="Navigation">
            <a href="../">Accueil</a>
            <a href="../#contact">Contact</a>
        </nav>
        ${themeToggle(icon)}
    </header>

    <main id="main" class="case">
        <nav class="crumbs" aria-label="Fil d’Ariane">
            <a href="../">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span>
        </nav>

        <div class="c-grid">
            <header class="tile c-head" style="--i:0">
                <div>
                    <p class="eyebrow">Étude de cas ${num(p)} · ${esc(p.kind)} · ${esc(p.period)}</p>
                    <h1>${esc(p.title)}</h1>
                    <p class="tagline">${esc(p.tagline)}</p>
                    <div class="actions">
                        ${actions}
                    </div>
                </div>
                <div>
                    <p class="intro">${esc(p.intro)}</p>
                    <ul class="meta">${p.meta.map(([k, v]) => `<li class="chip">${esc(k)} · <b>${esc(v)}</b></li>`).join('')}</ul>
                </div>
            </header>

            <div class="tile c-gallery" style="--i:1">
                <div class="carousel" data-carousel tabindex="0" role="group" aria-roledescription="carrousel" aria-label="Captures de ${esc(p.name)}">
                    <div class="carousel-viewport">
                        ${slides}
                        <button class="carousel-arrow prev" type="button" aria-label="Vue précédente">${icon('chevron-left')}</button>
                        <button class="carousel-arrow next" type="button" aria-label="Vue suivante">${icon('chevron-right')}</button>
                    </div>
                    <div class="carousel-foot">
                        <p class="carousel-caption" aria-live="polite">${esc(p.slides[0][1])}</p>
                        <div class="carousel-dots">${dots}</div>
                    </div>
                </div>
            </div>

            <ul class="c-specs" aria-label="Points techniques">${specs}
            </ul>
        </div>
${story}${metrics}${features}${end}

        <nav class="c-row c-pager" aria-label="Navigation entre les projets">
            ${pagerLink(prev, 'prev')}
            ${pagerLink(next, 'next')}
        </nav>
    </main>
${footer({ depth: 1 })}
    <script type="application/ld+json">${jsonLd}</script>
</body>
</html>
`;

    return resolve(
        head({
            title: `${p.name} — ${SITE.name}`,
            description: p.summary,
            canonical: `${SITE.base}projects/${p.slug}.html`,
            ogImage: `${SITE.base}assets/media/${p.media}/${p.cover}.webp`,
            depth: 1,
            css: ['project'],
        }) + body
    );
}

/* --------------------------------------------------------------------------
   APPS PAGE — download page for the Windows apps, one colour world per app.
   Motion lives in js/apps.js; this markup is complete without it.
   -------------------------------------------------------------------------- */

/* Where the floating "ingredients" sit, around the hero boxes (first three
   around the first app, last three around the second) and around a
   chapter's pinned box. Positions are relative to their container. */
const HERO_SLOTS = [
    { x: '13%', y: '25%', size: 62, depth: 1.4 },
    { x: '22%', y: '80%', size: 52, depth: 0.8 },
    { x: '3%', y: '70%', size: 44, depth: 1.9 },
    { x: '84%', y: '13%', size: 56, depth: 1.2 },
    { x: '76%', y: '63%', size: 64, depth: 1.6 },
    { x: '94%', y: '50%', size: 44, depth: 0.9 },
];
const PIN_SLOTS = [
    { x: '6%', y: '14%', size: 78, depth: 1.3, spin: 70 },
    { x: '74%', y: '9%', size: 62, depth: 0.8, spin: -60 },
    { x: '82%', y: '52%', size: 86, depth: 1.6, spin: 90 },
    { x: '3%', y: '60%', size: 64, depth: 1, spin: -40 },
    { x: '62%', y: '82%', size: 56, depth: 1.2, spin: 50 },
    { x: '22%', y: '86%', size: 50, depth: 1.8, spin: -80 },
];

const WAVE = 'M0 48C180 8 360 8 540 40S900 88 1080 52 1320 8 1440 30V80H0Z';

function buildApps() {
    const { icon, resolve } = makeIconSet();
    const names = APPS.map((a) => a.name);

    const floater = (a, item, slot, n) => {
        const inner = a.floaters.type === 'pixel' ? pixelArt(item) : `<span class="chipicon">${icon(item)}</span>`;
        return `<span class="a-float" style="${flavorVars(a)}--x:${slot.x};--y:${slot.y};--size:${slot.size}px;--depth:${slot.depth};--spin:${slot.spin || 40};--delay:${(-n * 0.7).toFixed(1)}s"><span>${inner}</span></span>`;
    };

    /* "1 657" counts up from 0 in apps.js; anything else stays as written. */
    const number = ([value, label]) => {
        const m = /^(\d[\d\s ]*)(.*)$/.exec(value);
        const count = m ? ` data-count="${m[1].replace(/\D/g, '')}"${m[2] ? ` data-suffix="${esc(m[2])}"` : ''}` : '';
        return `<div><dt${count}>${esc(value)}</dt><dd>${esc(label)}</dd></div>`;
    };

    const dlButton = (a, label, cls = 'a-btn') =>
        `<a class="${cls}" href="${downloadUrl(a)}" data-download style="${flavorVars(a)}">${icon('download')} ${label}</a>`;

    const band = (a, cls) => {
        const words = [a.name, ...a.band].map(esc).join('<i>✦</i>') + '<i>✦</i>';
        return `<p class="a-band ${cls}" style="${flavorVars(a)}" aria-hidden="true"><span>${words.repeat(4)}</span></p>`;
    };

    /* ---- hero ---- */
    const hero = `
        <section class="a-hero" aria-labelledby="hero-t">
            <p class="a-kicker">${esc(SITE.name)} · Apps Windows gratuites</p>
            <p class="lead">Découvrez mes deux apps</p>
            <h1 class="d" id="hero-t">${APPS.map((a) => `<span class="name" style="${flavorVars(a)}">${esc(a.name)}</span>`).join(' <span class="amp">et</span> ')}</h1>
            <p class="sub">Deux saveurs, une même recette : faites main, gratuites, sans compte, et livrées en ZIP prêt à lancer.</p>
            <div class="acts">
                <a class="a-btn a-btn--ink" href="#gamme">Voir la gamme ${icon('arrow-down', 'icon icon-down')}</a>
            </div>
            <div class="duo" aria-hidden="true">${APPS.map((a, n) => box(a, { cls: `b${n + 1}` })).join('')}</div>
            <span class="a-sticker s1" style="${flavorVars(APPS[0])}" aria-hidden="true">100&nbsp;%<br>gratuit</span>
            <span class="a-sticker s2" style="${flavorVars(APPS[1])}" aria-hidden="true">Windows<br>10 · 11</span>
            ${APPS.map((a, n) => a.floaters.items.slice(0, 3).map((it, k) => floater(a, it, HERO_SLOTS[n * 3 + k], k)).join('')).join('')}
            ${APPS.map((a, n) => band(a, `r${n + 1}`)).join('')}
        </section>`;

    /* ---- la gamme ---- */
    const range = `
        <section class="a-section" id="gamme" aria-labelledby="gamme-t">
            <h2 class="a-h2 d" id="gamme-t" data-reveal>La gamme</h2>
            <p class="a-sub" data-reveal>Deux apps, deux saveurs. L’une remet ton PC d’attaque, l’autre accompagne tes parties de Minecraft.</p>
            <div class="a-cards">${APPS.map(
                (a, n) => `
                <article class="a-card" style="${flavorVars(a)}--rd:${n * 0.12}s"${a.font ? ` data-font="${a.font}"` : ''} data-reveal>
                    <p class="num">Saveur n°${n + 1} · ${esc(a.flavor.label)}</p>
                    ${box(a)}
                    <h3 class="d">${esc(a.name)}</h3>
                    <p>${esc(a.card)}</p>
                    <ul class="chips">${a.chips.map((c) => `<li class="chip">${esc(c)}</li>`).join('')}</ul>
                    <div class="acts">
                        <a class="a-btn" href="#${a.slug}">Découvrir ${icon('arrow-down')}</a>
                        ${dlButton(a, `Télécharger <small>${esc(a.download.size)}</small>`, 'a-btn a-btn--ghost')}
                    </div>
                </article>`
            ).join('')}
            </div>
        </section>`;

    /* ---- one chapter per app ---- */
    const chapter = (a, n) => {
        const dim = DIMS[`media/${a.media}/icon`];
        const shots = a.shots
            .map(
                ([file, alt]) => `
                        <figure class="a-shot">
                            <div class="win"><div class="bar"><i></i><i></i><i></i><b>${esc(a.name)}</b></div>${picture(`media/${a.media}/${file}`, alt, { sizes: '(max-width: 700px) 80vw, 780px' })}</div>
                            <figcaption>${esc(alt)}</figcaption>
                        </figure>`
            )
            .join('');

        return `
        <section class="a-flavor" id="${a.slug}" style="${flavorVars(a)}"${a.font ? ` data-font="${a.font}"` : ''} aria-labelledby="${a.slug}-t">
            <svg class="a-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVE}"/></svg>
            <div class="a-stage" data-scene>
                <div class="a-pin" aria-hidden="true">
                    ${box(a)}
                    ${a.floaters.items.map((it, k) => floater(a, it, PIN_SLOTS[k % PIN_SLOTS.length], k)).join('')}
                </div>
                <div class="a-story">
                    <p class="a-kicker">Saveur n°${n + 1} · ${esc(a.flavor.label)}</p>
                    <h2 class="a-name d" id="${a.slug}-t">${esc(a.name)}</h2>
                    <p class="a-tagline"><span>${esc(a.tagline)}</span></p>
                    <p class="a-pitch">${esc(a.pitch)}</p>
                    <dl class="a-nums">${a.numbers.map(number).join('')}</dl>

                    <div class="a-ticket" data-reveal>
                        <img class="ico" src="ASSETSmedia/${a.media}/icon.png" alt="" width="${dim.w}" height="${dim.h}" loading="lazy" decoding="async">
                        <div>
                            <p class="t-name">${esc(a.name)} ${esc(a.version)}</p>
                            <p class="t-meta">${esc(a.download.meta)} · ${esc(a.download.size)}</p>
                        </div>
                        ${dlButton(a, `Télécharger <small>${esc(a.download.file)}</small>`)}
                        <div class="dash" aria-hidden="true"></div>
                        <p class="a-hash"><span>SHA-256</span><code>${esc(a.download.sha256)}</code><button type="button" data-copy="${esc(a.download.sha256)}" aria-label="Copier l’empreinte SHA-256 de ${esc(a.name)}">${icon('copy')}<span>Copier</span></button></p>
                        <p class="alt">Toutes les versions sur <a href="${RELEASES}" target="_blank" rel="noopener noreferrer">GitHub Releases</a>.</p>
                    </div>

                    <h3 class="a-ingr-title d" data-reveal>Les ingrédients</h3>
                    <ul class="a-ingr">${a.features
                        .map(([ic, title, text], k) => `
                        <li data-reveal style="--rd:${(k % 2) * 0.1}s"><span class="ic">${icon(ic)}</span><h4>${esc(title)}</h4><p>${text}</p></li>`)
                        .join('')}
                    </ul>
                </div>
            </div>

            <div class="a-reel" data-reel>
                <div class="a-reel-sticky">
                    <div class="a-reel-head">
                        <h3 class="d">En vrai, ça donne ça</h3>
                        <p>${a.shots.length} captures · faites défiler →</p>
                    </div>
                    <div class="a-reel-track" tabindex="0" role="region" aria-label="Captures d’écran de ${esc(a.name)}">${shots}
                    </div>
                </div>
            </div>

            <div class="a-how">
                <div data-reveal>
                    <h3 class="d">Installer en 3&nbsp;étapes</h3>
                    <ol class="a-steps">${a.steps.map((s) => `<li><span>${s}</span></li>`).join('')}</ol>
                    <ul class="a-req">${a.requirements.map((r) => `<li class="chip">${esc(r)}</li>`).join('')}</ul>
                </div>
                <aside class="a-notes" data-reveal style="--rd:0.15s" aria-label="Bon à savoir sur ${esc(a.name)}">
                    <h3>Bon à savoir</h3>
                    <ul>${a.notes.map((t) => `<li><span>${t}</span></li>`).join('')}</ul>
                </aside>
            </div>
        </section>`;
    };

    /* ---- which one? ---- */
    const pick = `
        <section class="a-section" aria-labelledby="pick-t">
            <h2 class="a-h2 d" id="pick-t" data-reveal>Laquelle est faite pour toi&nbsp;?</h2>
            <div class="a-pick-grid">${APPS.map(
                (a, n) => `
                <div class="a-pick-col" style="${flavorVars(a)}--rd:${n * 0.12}s"${a.font ? ` data-font="${a.font}"` : ''} data-reveal>
                    <h3 class="d">${esc(a.name)}</h3>
                    <ul>${a.pick.map((t) => `<li><span>${esc(t)}</span></li>`).join('')}</ul>
                    ${dlButton(a, `Télécharger <small>${esc(a.download.size)}</small>`)}
                </div>`
            ).join('\n                <p class="a-pick-vs d" aria-hidden="true">ou</p>')}
            </div>
        </section>`;

    const faq = `
        <section class="a-section a-faq" id="faq" aria-labelledby="faq-t">
            <h2 class="a-h2 d" id="faq-t" data-reveal>Questions</h2>
            ${FAQ.map(([q, a]) => `<details data-reveal><summary>${esc(q)}</summary><div class="ans">${a}</div></details>`).join('\n            ')}
        </section>`;

    const end = `
        <section class="a-end" aria-labelledby="end-t">
            <h2 class="d" id="end-t" data-reveal>Bonne install’&nbsp;!</h2>
            <p data-reveal>Un bug, une idée, un retour&nbsp;? Écris-moi à <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
            <div class="acts" data-reveal>${APPS.map((a) => dlButton(a, esc(a.name))).join('')}</div>
            <a class="home" href="../">← Retour au portfolio</a>
        </section>`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': APPS.map((a) => ({
            '@type': 'SoftwareApplication',
            name: a.name,
            description: a.pitch,
            softwareVersion: a.version,
            applicationCategory: a.category,
            operatingSystem: 'Windows 10, Windows 11',
            downloadUrl: downloadUrl(a),
            fileSize: a.download.size,
            url: `${SITE.base}apps/#${a.slug}`,
            image: `${SITE.base}assets/media/${a.media}/icon.png`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            author: { '@type': 'Person', name: SITE.name, url: SITE.base },
        })),
    });

    const body = `<body class="apps-page">
${SPRITE_SLOT}
    <a class="skip-link" href="#main">Aller au contenu</a>

    <header class="a-nav">
        <a class="brand" href="../">${picture(PROFILE.avatar, '', { sizes: '34px' })}<span>${SITE.name}</span></a>
        <nav aria-label="Navigation">
            ${APPS.map((a) => `<a href="#${a.slug}" style="${flavorVars(a)}"><span class="long">${esc(a.name)}</span><span class="short">${esc(a.short)}</span></a>`).join('\n            ')}
            <a href="#faq">FAQ</a>
        </nav>
        ${themeToggle(icon)}
    </header>

    <main id="main">${hero}${range}${APPS.map(chapter).join('')}${pick}${faq}${end}
    </main>
${footer({ depth: 1, scripts: ['apps'] })}
    <script type="application/ld+json">${jsonLd}</script>
</body>
</html>
`;

    const first = APPS[0];
    return resolve(
        head({
            title: `Télécharger ${names.join(' & ')} — ${SITE.name}`,
            description: `${names.join(' et ')}, deux apps Windows gratuites d’${SITE.name} : présentation, captures, installation et téléchargement.`,
            canonical: `${SITE.base}apps/`,
            ogImage: `${SITE.base}assets/media/${first.media}/${first.shots[0][0]}.webp`,
            depth: 1,
            css: ['apps'],
            fonts: [APP_FONTS],
        }) + body
    );
}

/* --------------------------------------------------------------------------
   STATIC FILES
   -------------------------------------------------------------------------- */
function buildManifest() {
    return JSON.stringify(
        {
            name: `${SITE.name} — ${SITE.role}`,
            short_name: 'Allan Vitu',
            description: "Portfolio d'Allan Vitu, développeur Full-Stack & DevOps.",
            lang: 'fr',
            start_url: './',
            scope: './',
            display: 'standalone',
            background_color: '#eeeef1',
            theme_color: '#eeeef1',
            icons: [
                { src: './assets/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                { src: './assets/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                { src: './assets/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
        },
        null,
        2
    );
}

function buildSitemap() {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
        { loc: SITE.base, priority: '1.0' },
        ...(APPS.length ? [{ loc: `${SITE.base}apps/`, priority: '0.9' }] : []),
        ...PAGES.map((p) => ({ loc: `${SITE.base}projects/${p.slug}.html`, priority: '0.8' })),
        { loc: `${SITE.base}${SITE.doc}`, priority: '0.6' },
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (u) => `    <url>
        <loc>${u.loc}</loc>
        <lastmod>${today}</lastmod>
        <priority>${u.priority}</priority>
    </url>`
    )
    .join('\n')}
</urlset>
`;
}

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${SITE.base}sitemap.xml
`;

/* --------------------------------------------------------------------------
   RUN
   -------------------------------------------------------------------------- */
function write(rel, content) {
    const file = path.join(DOCS, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    // Asset URLs are authored root-relative to assets/ then rewritten per depth.
    const depth = rel.includes('/') ? '../' : './';
    fs.writeFileSync(file, content.split('ASSETS').join(`${depth}assets/`));
    console.log(`  ${rel.padEnd(34)} ${String(Math.round(content.length / 1024)).padStart(4)} KB`);
}

console.log('building docs/\n');
write('index.html', buildIndex());
PAGES.forEach((p, i) => write(`projects/${p.slug}.html`, buildProject(p, i)));
if (APPS.length) write('apps/index.html', buildApps());
write('site.webmanifest', buildManifest());
write('sitemap.xml', buildSitemap());
write('robots.txt', ROBOTS);
console.log(`\ndone — ${PROJECTS.length} projects (${PAGES.length} with a page), ${APPS.length} downloadable apps`);
