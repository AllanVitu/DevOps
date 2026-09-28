# tools/

Static-site generator for `docs/`. Zero runtime dependencies — plain Node.

## Rebuild the site

```bash
node tools/build.js
```

This regenerates `docs/index.html`, `docs/projects/*.html`, `docs/sitemap.xml`,
`docs/robots.txt` and `docs/site.webmanifest`. The output is committed, so
GitHub Pages serves it directly with no build step.

## Files

| File | Role |
|------|------|
| `build.js` | Renders every page: the bento homepage, one case study per published project, and the shared head / footer. |
| `projects.js` | **The file you normally edit.** One entry per public repository: copy, media, tile style, specs, case-study blocks, stack. |
| `profile.js` | Everything on the homepage that is not a project: status, pitch, location, parcours, stack. |
| `icons.js` | Inner markup of the Lucide icons used by the site. Each page inlines a sprite containing only the icons it actually renders — no icon CDN, no runtime JS to draw them. |
| `dimensions.json` | Intrinsic width/height of every image, so `<img>` always carries dimensions and nothing shifts while loading. |

## Adding a project

1. Drop the screenshots in `docs/assets/media/<project>/`, encoded as **both**
   `.avif` and `.webp` (see below).
2. Add the dimensions to `dimensions.json` (key = path under `assets/`, without
   the extension).
3. Add an entry to `projects.js`. `tier: 'featured'` gives it a homepage tile
   and its own case-study page; `tier: 'soon'` is a repository with no
   published code yet: a dashed "en préparation" tile linking to the repo, no
   page. Array order drives numbering, tile order and prev/next paging.
4. Run `node tools/build.js`.

`tile.style` picks the homepage tile: `'shot'` shows the cover screenshot
under the first three metrics; `'rack'` is a dark tile with a logo over a row
of item renders (`tile.logo`, `tile.rack`). `repo` is required; `live` is
optional (a resource pack has nothing to open in a browser) and only adds the
"Ouvrir" button when set.

The homepage grid (`.bento` in `site.css`) names its areas for **two featured
projects and one "soon" repository** (`p1`, `p2`, `soon`), so the page fits a
laptop screen without scrolling. A third featured project is still rendered,
auto-placed after the grid; to give it a proper slot, add an area to the
three `grid-template-areas` blocks (desktop, tablet, mobile).

## Re-encoding images

Images are served as AVIF with a WebP fallback, capped at 1600 px wide.
To process a new batch:

```bash
npm install sharp          # in a scratch folder, not in this repo
```

```js
const sharp = require('sharp');
const buf = require('fs').readFileSync('shot.png');
await sharp(buf).resize({ width: 1600, withoutEnlargement: true })
    .avif({ quality: 52, effort: 6 }).toFile('shot.avif');
await sharp(buf).resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 }).toFile('shot.webp');
```

## Adding an icon

`icons.js` holds the inner markup of each 24×24 Lucide icon, stroke-based.
To add one, copy the contents of the corresponding `<svg>` from
[lucide.dev](https://lucide.dev) (everything between the tags) into the map
under its kebab-case name, then reference it as `icon('my-icon')` in `build.js`.

## Editing the design

Styling is **not** generated — edit the CSS directly:

- `docs/css/site.css` — tokens (light + dark), tiles, buttons, bento homepage. Loaded everywhere.
- `docs/css/project.css` — case-study pages only.

Accents come from a `data-accent` attribute (`indigo`, `amber`, `emerald`,
taken from each project's `theme`) on a tile or on a case study's `<body>`.
It resolves `--accent` (text), `--accent-fill` (buttons, filled tiles) and
`--on-accent` (text on that fill), which every component reads.

`docs/js/app.js` is progressive enhancement only: theme toggle, tile
spotlight and the case-study carousel. Every page reads fine without it.
