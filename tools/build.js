#!/usr/bin/env node
/* ==========================================================================
   BUILD.JS — Renders docs/ from tools/projects.js.

   The shell (head, nav, drawer, footer) was previously copy-pasted across ten
   files, which is how the project numbering drifted out of sync. It now lives
   here once. Output is committed, so GitHub Pages needs no build step.

       node tools/build.js

   Zero runtime dependencies.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ICONS = require('./icons');
const DIMS = require('./dimensions.json');
const PROJECTS = require('./projects');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

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
};

const NAV = [
    ['#about', 'À propos'],
    ['#experience', 'Parcours'],
    ['#projects', 'Projets'],
    ['#contact', 'Contact'],
];

/* Labels for the filter chips. Derived from the projects themselves below, so
   removing a project can never leave a chip that matches nothing. */
const FILTER_LABELS = {
    vue: 'Vue.js',
    vanilla: 'Vanilla JS',
    pwa: 'PWA',
    api: 'API',
    game: 'Game',
};

const FILTERS = [
    ['all', 'Tous'],
    ...Object.entries(FILTER_LABELS).filter(([key]) =>
        PROJECTS.some((p) => p.filters.includes(key))
    ),
];

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const up = (depth) => (depth === 0 ? './' : '../');

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
    ['github', SITE.github, 'GitHub'],
    ['linkedin', SITE.linkedin, 'LinkedIn'],
    ['instagram', SITE.instagram, 'Instagram'],
];

/* --------------------------------------------------------------------------
   SHELL
   -------------------------------------------------------------------------- */
function head({ title, description, canonical, ogImage, depth, extraCss }) {
    const u = up(depth);
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
<meta name="theme-color" content="#f7f7fb">

<script>
/* Resolve the theme before first paint so the page never flashes, and flag
   that scripting is on — reveal animations only hide content when it can be
   revealed again. */
(function(){document.documentElement.classList.add('js');
try{var s=localStorage.getItem('theme');
document.documentElement.dataset.theme=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
}catch(e){document.documentElement.dataset.theme='light';}})();
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Roboto+Mono:wght@400;500&display=swap">
<link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Roboto+Mono:wght@400;500&display=swap">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Roboto+Mono:wght@400;500&display=swap"></noscript>

<link rel="stylesheet" href="${u}css/site.css">${extraCss ? `\n<link rel="stylesheet" href="${u}css/project.css">` : ''}
</head>`;
}

function navbar({ depth, icon }) {
    const u = up(depth);
    const home = depth === 0 ? '' : u;
    const links = NAV.map(([h, l]) => `<a href="${home}${h}">${l}</a>`).join('\n            ');
    const social = SOCIALS.map(
        ([n, href, label]) => `<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${brandIcon(n)}</a>`
    ).join('\n                ');

    return `
    <a class="skip-link" href="#main">Aller au contenu</a>

    <div class="backdrop" aria-hidden="true"></div>

    <header class="nav" id="nav">
        <div class="nav-progress" aria-hidden="true"></div>
        <a class="nav-brand" href="${depth === 0 ? '#' : u}" aria-label="${SITE.name} — accueil">
            <img src="${u}assets/brand/logo.svg" alt="" width="28" height="28">
            Allan<span class="gradient-text">/</span>Vitu
        </a>
        <nav class="nav-links" aria-label="Navigation principale">
            ${links}
        </nav>
        <div class="nav-actions">
            <div class="nav-social">
                ${social}
            </div>
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Changer de thème">
                ${icon('sun', 'icon icon-sun')}${icon('moon', 'icon icon-moon')}
            </button>
            <a class="btn btn--ghost btn--sm" href="mailto:${SITE.email}" data-magnetic>${icon('mail')} Contact</a>
            <button class="nav-burger" id="navBurger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navDrawer">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>

    <div class="nav-drawer" id="navDrawer">
        ${NAV.map(([h, l]) => `<a href="${home}${h}">${l}</a>`).join('\n        ')}
        <div class="nav-drawer-social">
            ${social}
        </div>
    </div>`;
}

function footer({ depth }) {
    const social = SOCIALS.map(
        ([n, href, label]) => `<a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${brandIcon(n)}</a>`
    ).join('\n                ');

    return `
    <footer class="footer">
        <div class="shell footer-inner">
            <p>&copy; ${SITE.year} ${SITE.name} — ${SITE.role}</p>
            <div class="footer-social">
                ${social}
            </div>
        </div>
    </footer>

    <script src="${up(depth)}js/app.js" defer></script>`;
}

/* --------------------------------------------------------------------------
   HOMEPAGE
   -------------------------------------------------------------------------- */
function buildIndex() {
    const { icon, resolve } = makeIconSet();
    const featured = PROJECTS.filter((p) => p.tier === 'featured');
    const archive = PROJECTS.filter((p) => p.tier === 'archive');
    const num = (p) => String(PROJECTS.indexOf(p) + 1).padStart(2, '0');

    const themeVar = {
        violet: 'var(--accent)',
        cyan: 'var(--c-cyan)',
        amber: 'var(--c-amber)',
        emerald: 'var(--c-emerald)',
        indigo: 'var(--c-indigo)',
        lime: 'var(--c-lime)',
    };

    /* --- Sticky index --- */
    const indexLinks = PROJECTS.map((p, i) => {
        const opener = i === featured.length && archive.length
            ? `<p class="divider">Aussi</p>\n                        `
            : '';
        return `${opener}<a href="#p-${p.slug}"><span class="n">${num(p)}</span><span>${esc(p.name)}</span></a>`;
    }).join('\n                        ');

    /* --- Full chapter: the four highlighted projects --- */
    const fullChapters = featured
        .map(
            (p, i) => `
                    <article class="chapter reveal" id="p-${p.slug}" data-theme-accent="${p.theme}">
                        <a class="chapter-media" href="./projects/${p.slug}.html" tabindex="-1" aria-hidden="true">
                            ${picture(`media/${p.media}/${p.cover}`, '', {
                                lazy: i > 0,
                                sizes: '(max-width: 1000px) 100vw, 880px',
                            })}
                            <span class="open-hint"><span>Ouvrir l’étude de cas ${icon('arrow-right')}</span></span>
                        </a>
                        <p class="chapter-kicker">
                            <span class="n">${num(p)}</span>
                            <span class="sep">/</span>
                            ${p.tags.map((t) => esc(t)).join(' <span class="sep">·</span> ')}
                        </p>
                        <h3><a href="./projects/${p.slug}.html">${esc(p.name)}</a></h3>
                        <p class="chapter-lead">${esc(p.summary)}</p>
                        <div class="chapter-story">
                            <div>
                                <h4>Le problème</h4>
                                <p>${esc(p.narrative.problem)}</p>
                            </div>
                            <div>
                                <h4>Le choix technique</h4>
                                <p>${esc(p.narrative.solution)}</p>
                            </div>
                        </div>
                        <div class="chapter-actions">
                            <a class="btn btn--chapter" href="./projects/${p.slug}.html">Étude de cas ${icon('arrow-right')}</a>
                            <a class="btn btn--ghost" href="${p.live}" target="_blank" rel="noopener noreferrer">Ouvrir le projet ${icon('external-link')}</a>
                        </div>
                    </article>`
        )
        .join('');

    /* --- Compact chapter: secondary projects keep a page but not the stage --- */
    const compactChapters = archive
        .map(
            (p) => `
                    <article class="chapter chapter--compact reveal" id="p-${p.slug}" data-theme-accent="${p.theme}">
                        <div class="chapter-row">
                            <a class="chapter-media" href="./projects/${p.slug}.html" tabindex="-1" aria-hidden="true">
                                ${picture(`media/${p.media}/${p.cover}`, '', { sizes: '200px' })}
                            </a>
                            <div>
                                <p class="chapter-kicker">
                                    <span class="n">${num(p)}</span>
                                    <span class="sep">/</span>
                                    ${p.tags.map((t) => esc(t)).join(' <span class="sep">·</span> ')}
                                </p>
                                <h3><a href="./projects/${p.slug}.html">${esc(p.name)}</a></h3>
                                <p class="chapter-lead">${esc(p.summary)}</p>
                            </div>
                            <a class="btn btn--ghost btn--sm" href="./projects/${p.slug}.html">Voir ${icon('arrow-right')}</a>
                        </div>
                    </article>`
        )
        .join('');

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: SITE.name,
        jobTitle: SITE.role,
        email: `mailto:${SITE.email}`,
        url: SITE.base,
        image: `${SITE.base}assets/media/avatar.webp`,
        sameAs: [SITE.github, SITE.linkedin, SITE.instagram],
        knowsAbout: ['Vue.js', 'PHP', 'Docker', 'CI/CD', 'Progressive Web Apps', 'DevOps'],
        alumniOf: { '@type': 'EducationalOrganization', name: 'Centre de Réadaptation de Mulhouse' },
        makesOffer: PROJECTS.map((p) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'SoftwareApplication', name: p.name, description: p.summary, url: p.live },
        })),
    });

    const body = `<body>
${SPRITE_SLOT}
${navbar({ depth: 0, icon })}

    <main id="main">
        <!-- ── HERO ─────────────────────────────────────────────────────── -->
        <section class="shell hero">
            <p class="hero-badge"><span class="dot" aria-hidden="true"></span> Disponible — freelance &amp; CDI</p>
            <h1>Je construis des apps web<br><span class="gradient-text">robustes &amp; premium.</span></h1>
            <p class="hero-sub">Développeur Full-Stack &amp; DevOps. Du design system au pipeline CI/CD, je conçois des applications complètes, performantes et durables.</p>
            <div class="hero-cta">
                <a class="btn btn--primary" href="#projects" data-magnetic>Voir les projets ${icon('arrow-down')}</a>
                <a class="btn btn--ghost" href="#contact" data-magnetic>Me contacter ${icon('arrow-right')}</a>
            </div>
            <p class="hero-meta">
                <span>${icon('layers')} Vue 3 · PHP 8</span>
                <span>${icon('server')} Docker · CI/CD</span>
                <span>${icon('smartphone')} PWA offline-first</span>
            </p>
        </section>

        <!-- ── À PROPOS ─────────────────────────────────────────────────── -->
        <section class="shell section reveal" id="about">
            <div class="about-grid">
                <div class="about-copy">
                    <p class="section-eyebrow">À propos</p>
                    <h2 class="section-title">Allan Vitu</h2>
                    <p>Diplômé du titre professionnel <strong>DWWM</strong> au Centre de Réadaptation de Mulhouse, je conçois des applications web de bout en bout — de la maquette au déploiement.</p>
                    <p>Je travaille principalement en <strong>Vue 3</strong> et <strong>PHP 8</strong>, avec un intérêt marqué pour les <strong>PWA offline-first</strong> et l'outillage DevOps qui rend un déploiement ennuyeux. Chaque projet ci-dessous est parti d'un besoin réel, pas d'un tutoriel.</p>
                    <dl class="about-stats">
                        <div><dt>${PROJECTS.length}</dt><dd>Projets en ligne</dd></div>
                        <div><dt>PWA</dt><dd>Spécialité</dd></div>
                        <div><dt>Full</dt><dd>Stack &amp; DevOps</dd></div>
                    </dl>
                </div>
                <div class="about-card panel">
                    <div class="about-avatar">${picture('media/avatar', 'Portrait d’Allan Vitu', { sizes: '104px' })}</div>
                    <div class="about-code">
<pre><code><span class="k">const</span> allan = {
  role:    <span class="s">"Full-Stack &amp; DevOps"</span>,
  stack:   [<span class="s">"Vue 3"</span>, <span class="s">"PHP 8"</span>, <span class="s">"Docker"</span>],
  focus:   <span class="s">"PWA &amp; CI/CD"</span>,
  status:  <span class="s">"available"</span>,
}<span class="p">;</span></code></pre>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── STACK ────────────────────────────────────────────────────── -->
        <section class="shell section reveal">
            <p class="section-eyebrow">Compétences</p>
            <h2 class="section-title">Stack</h2>
            <div class="caps">
                <div>
                    <h3>${icon('layers')} Frontend</h3>
                    <p>Web Components, PWA et rendu côté serveur. Des interfaces réactives, accessibles et tenables dans le temps.</p>
                    <div class="tag-row">
                        <span class="tag tag--accent">Vue 3</span><span class="tag tag--accent">JavaScript ES6+</span>
                        <span class="tag tag--accent">TailwindCSS</span><span class="tag tag--accent">HTML / CSS</span>
                    </div>
                </div>
                <div>
                    <h3>${icon('database')} Backend &amp; data</h3>
                    <p>APIs REST sécurisées, bases relationnelles et NoSQL.</p>
                    <div class="tag-row">
                        <span class="tag tag--accent">PHP 8</span><span class="tag tag--accent">MySQL</span>
                        <span class="tag tag--accent">Node.js</span><span class="tag tag--accent">NoSQL</span>
                    </div>
                </div>
                <div>
                    <h3>${icon('server')} DevOps</h3>
                    <p>Automatisation des déploiements, conteneurisation et pipelines CI/CD.</p>
                    <div class="tag-row">
                        <span class="tag tag--accent">Docker</span><span class="tag tag--accent">CI/CD</span>
                        <span class="tag tag--accent">Linux</span><span class="tag tag--accent">Cloud</span>
                    </div>
                </div>
            </div>
            <figure class="gh-chart">
                <figcaption>${icon('git-commit')} Activité GitHub — 12 derniers mois</figcaption>
                <img src="https://ghchart.rshah.org/8b5cf6/allanvitu" alt="Graphique des contributions GitHub d’Allan Vitu sur l’année écoulée" loading="lazy" decoding="async" width="663" height="104">
            </figure>
        </section>

        <!-- ── PARCOURS ─────────────────────────────────────────────────── -->
        <section class="shell section reveal" id="experience">
            <p class="section-eyebrow">Parcours</p>
            <h2 class="section-title">Expérience</h2>
            <ol class="timeline">
                <li>
                    <span class="timeline-date">2024 — 2025</span>
                    <h3>Titre professionnel DWWM</h3>
                    <p class="org">Centre de Réadaptation de Mulhouse</p>
                    <p>Formation intensive en développement web &amp; web mobile : projets full-stack, méthodologies agiles et architectures modernes.</p>
                </li>
                <li>
                    <span class="timeline-date">2025 — 2026</span>
                    <h3>Projets personnels — Full-Stack &amp; DevOps</h3>
                    <p class="org">Autodidacte</p>
                    <p>Conception de FORGE UI, FocusBrain, Rytiger RPG et RégionDex. Approfondissement de Vue 3, Docker et des chaînes de déploiement continu.</p>
                </li>
                <li>
                    <span class="timeline-date">2026 — Aujourd’hui</span>
                    <h3>Ouvert aux opportunités</h3>
                    <p class="org">Freelance &amp; CDI</p>
                    <p>Disponible pour des missions en applications web performantes, PWA mobile-first et infrastructures cloud.</p>
                </li>
            </ol>
        </section>

        <!-- ── PROJETS ──────────────────────────────────────────────────── -->
        <section class="shell section" id="projects">
            <div class="reveal">
                <p class="section-eyebrow">Projets</p>
                <h2 class="section-title">Ce que je construis</h2>
                <p class="section-lead">${featured.length} projets détaillés, chacun avec le problème qu'il résout et le choix technique qui en découle. Tous sont en ligne et utilisables.</p>
            </div>

            <div class="chapters">
                <nav class="chapter-index" aria-label="Index des projets">
                    <p class="chapter-index-label">Projets</p>
                    ${indexLinks}
                </nav>

                <div class="chapter-flow">${fullChapters}${compactChapters}
                </div>
            </div>
        </section>

        <!-- ── CONTACT ──────────────────────────────────────────────────── -->
        <section class="shell section contact reveal" id="contact">
            <p class="section-eyebrow">Contact</p>
            <h2 class="section-title">Travaillons ensemble</h2>
            <p class="contact-lead">Diplômé DWWM, disponible en freelance comme en CDI. Architecture cloud, PWA ou CI/CD — écrivez-moi.</p>
            <div class="contact-links">
                <a class="contact-link" data-brand="mail" href="mailto:${SITE.email}" aria-label="Envoyer un e-mail">${brandIcon('mail')}</a>
                <a class="contact-link" data-brand="github" href="${SITE.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${brandIcon('github')}</a>
                <a class="contact-link" data-brand="linkedin" href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${brandIcon('linkedin')}</a>
                <a class="contact-link" data-brand="instagram" href="${SITE.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${brandIcon('instagram')}</a>
            </div>
            <p class="contact-mail"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
        </section>
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
                "Portfolio d'Allan Vitu, développeur Full-Stack & DevOps. Applications web performantes, PWA offline-first et infrastructures cloud.",
            canonical: SITE.base,
            ogImage: `${SITE.base}assets/media/forgeui/accueil.webp`,
            depth: 0,
        }) + body
    );
}

/* --------------------------------------------------------------------------
   PROJECT PAGE
   -------------------------------------------------------------------------- */
function buildProject(project, index) {
    const { icon, resolve } = makeIconSet();
    const p = project;
    const num = String(index + 1).padStart(2, '0');
    const prev = PROJECTS[index - 1];
    const next = PROJECTS[index + 1];

    const slides = p.slides
        .map(
            ([file, alt], i) =>
                `                    <div class="carousel-slide" aria-hidden="${i !== 0}">${picture(
                    `media/${p.media}/${file}`,
                    alt,
                    { lazy: i > 0, sizes: '(max-width: 940px) 100vw, 700px' }
                )}</div>`
        )
        .join('\n');

    const dots = p.slides
        .map(
            (_, i) =>
                `<button class="carousel-dot" type="button" aria-current="${i === 0}" aria-label="Vue ${i + 1} sur ${p.slides.length}"></button>`
        )
        .join('');

    const specs = p.specs
        .map(
            ([ic, title, text]) => `
                    <li>
                        <span class="spec-icon">${icon(ic)}</span>
                        <div><strong>${esc(title)}</strong><span>${esc(text)}</span></div>
                    </li>`
        )
        .join('');

    const narrative = p.narrative
        ? `
        <section class="p-section reveal">
            <h2>Le raisonnement</h2>
            <p class="sub">Problème → Solution → Résultat</p>
            <div class="narrative">
                <article class="panel">
                    <h3>${icon('circle-alert')} Le problème</h3>
                    <p>${esc(p.narrative.problem)}</p>
                </article>
                <article class="panel">
                    <h3>${icon('lightbulb')} La solution</h3>
                    <p>${esc(p.narrative.solution)}</p>
                </article>
                <article class="panel">
                    <h3>${icon('target')} Le résultat</h3>
                    <p>${esc(p.narrative.outcome)}</p>
                </article>
            </div>
        </section>`
        : '';

    const metrics = p.metrics
        ? `
        <section class="p-section reveal">
            <h2>En chiffres</h2>
            <p class="sub">Périmètre réel du projet</p>
            <dl class="metrics">
                ${p.metrics.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('\n                ')}
            </dl>
        </section>`
        : '';

    const features = p.features
        ? `
        <section class="p-section reveal">
            <h2>Architecture &amp; modules</h2>
            <p class="sub">Chaque module est un store indépendant, persisté localement.</p>
            <div class="features">
                ${p.features
                    .map(
                        ([ic, title, html, tags]) => `<article class="panel panel--lift">
                    <header><span class="f-icon">${icon(ic)}</span><h3>${esc(title)}</h3></header>
                    <p>${html}</p>
                    <div class="tag-row">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
                </article>`
                    )
                    .join('\n                ')}
            </div>
        </section>`
        : '';

    const stack = `
        <section class="p-section reveal">
            <h2>Stack technique</h2>
            <p class="sub">Ce qui fait tourner le projet</p>
            <div class="stack-groups">
                ${p.stack
                    .map(
                        ([group, items]) => `<div>
                    <h3>${esc(group)}</h3>
                    <div class="tag-row">${items.map((i) => `<span class="pill">${esc(i)}</span>`).join('')}</div>
                </div>`
                    )
                    .join('\n                ')}
            </div>
        </section>`;

    const video = p.video
        ? (() => {
              const [file, posterKey, label] = p.video;
              const poster = DIMS[`media/${p.media}/${posterKey}`];
              return `
        <section class="p-section p-video reveal">
            <h2>Gameplay</h2>
            <p class="sub">${esc(label)}</p>
            <div class="video-frame" data-video>
                <video preload="none" playsinline poster="../assets/media/${p.media}/${posterKey}.webp" width="${poster.w}" height="${poster.h}">
                    <source data-src="../assets/media/${p.media}/${file}" type="video/mp4">
                    Votre navigateur ne prend pas en charge la lecture vidéo.
                </video>
                <button class="video-play" type="button" aria-label="Lancer la vidéo de gameplay">
                    <span class="disc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
                    <small>${esc(label)}</small>
                </button>
            </div>
        </section>`;
          })()
        : '';

    const docBanner = p.doc
        ? `
        <aside class="doc-banner reveal">
            <div>
                <h2>Documentation technique</h2>
                <p>Architecture détaillée, choix d’implémentation et schémas.</p>
            </div>
            <a class="btn btn--project" href="../doc_technique/${p.doc}">Lire la doc ${icon('file-code')}</a>
        </aside>`
        : '';

    const pager = `
        <nav class="p-pager" aria-label="Navigation entre les projets">
            ${
                prev
                    ? `<a class="pager-link prev" href="./${prev.slug}.html">${icon('arrow-left')}<span><span class="lbl">Projet précédent</span><span class="ttl">${esc(prev.name)}</span></span></a>`
                    : `<a class="pager-link prev" href="../#projects">${icon('arrow-left')}<span><span class="lbl">Retour</span><span class="ttl">Tous les projets</span></span></a>`
            }
            ${
                next
                    ? `<a class="pager-link next" href="./${next.slug}.html">${icon('arrow-right')}<span><span class="lbl">Projet suivant</span><span class="ttl">${esc(next.name)}</span></span></a>`
                    : `<a class="pager-link next" href="../#projects">${icon('arrow-right')}<span><span class="lbl">Retour</span><span class="ttl">Tous les projets</span></span></a>`
            }
        </nav>`;

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: p.name,
        description: p.summary,
        url: p.live,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web',
        author: { '@type': 'Person', name: SITE.name, url: SITE.base },
        image: `${SITE.base}assets/media/${p.media}/${p.cover}.webp`,
    });

    const body = `<body data-project="${p.theme}">
${SPRITE_SLOT}
${navbar({ depth: 1, icon })}

    <main id="main" class="shell">
        <nav class="crumbs" aria-label="Fil d’Ariane">
            <a href="../">Accueil</a><span class="sep" aria-hidden="true">/</span>
            <a href="../#projects">Projets</a><span class="sep" aria-hidden="true">/</span>
            <span aria-current="page">${esc(p.name)}</span>
        </nav>

        <header class="p-head reveal">
            <p class="p-eyebrow">${p.tier === 'featured' ? 'Étude de cas' : 'Projet'} // ${num}</p>
            <h1>${esc(p.title)}</h1>
            <p class="p-tagline">${esc(p.tagline)}</p>
            <p>${esc(p.intro)}</p>
            <dl class="p-meta">
                ${p.meta.map(([k, v]) => `<span>${esc(k)} — <b>${esc(v)}</b></span>`).join('\n                ')}
            </dl>
        </header>

        <div class="p-body reveal">
            <div>
                <div class="carousel" data-carousel tabindex="0" role="group" aria-roledescription="carrousel" aria-label="Captures de ${esc(p.name)}">
                    <div class="carousel-viewport">
${slides}
                        <button class="carousel-arrow prev" type="button" aria-label="Vue précédente">${icon('chevron-left')}</button>
                        <button class="carousel-arrow next" type="button" aria-label="Vue suivante">${icon('chevron-right')}</button>
                    </div>
                    <div class="carousel-dots">${dots}</div>
                </div>
                <p class="carousel-status" role="status" aria-live="polite"></p>
            </div>

            <div class="p-specs panel">
                <h2>Points techniques</h2>
                <ul class="spec-list">${specs}
                </ul>
                <div class="p-actions">
                    <a class="btn btn--project" href="${p.live}" target="_blank" rel="noopener noreferrer">Ouvrir ${esc(p.name)} ${icon('external-link')}</a>
                    ${p.doc ? `<a class="btn btn--project-ghost" href="../doc_technique/${p.doc}">Documentation technique ${icon('file-code')}</a>` : ''}
                </div>
            </div>
        </div>
${narrative}${metrics}${features}${stack}${video}${docBanner}
${pager}
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
            extraCss: true,
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
            background_color: '#f7f7fb',
            theme_color: '#f7f7fb',
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
        ...PROJECTS.map((p) => ({ loc: `${SITE.base}projects/${p.slug}.html`, priority: '0.8' })),
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
PROJECTS.forEach((p, i) => write(`projects/${p.slug}.html`, buildProject(p, i)));
write('site.webmanifest', buildManifest());
write('sitemap.xml', buildSitemap());
write('robots.txt', ROBOTS);
console.log(`\ndone — ${PROJECTS.length} projects (${PROJECTS.filter((p) => p.tier === 'featured').length} featured)`);
