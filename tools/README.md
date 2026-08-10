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
| `build.js` | Renders every page. Holds the shared shell (head, nav, drawer, footer) that used to be copy-pasted across ten HTML files. |
| `projects.js` | **The only file you normally edit.** One entry per project: copy, media, specs, case-study blocks, stack. |
| `icons.js` | Inner markup of the Lucide icons used by the site. Each page inlines a sprite containing only the icons it actually renders — no icon CDN, no runtime JS to draw them. |
| `dimensions.json` | Intrinsic width/height of every image, so `<img>` always carries dimensions and nothing shifts while loading. |

## Adding a project

1. Drop the screenshots in `docs/assets/media/<project>/`, encoded as **both**
   `.avif` and `.webp` (see below).
2. Add the dimensions to `dimensions.json` (key = path under `assets/`, without
   the extension).
3. Add an entry to `projects.js`. `tier: 'featured'` puts it in the main grid
   with a full case study; `tier: 'archive'` puts it in the compact list.
   Array order drives numbering, grid order and prev/next paging.
4. Run `node tools/build.js`.

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

- `docs/css/site.css` — tokens, shell, homepage. Loaded everywhere.
- `docs/css/project.css` — case-study pages only.

A project page is themed by a single `data-project` value on `<body>`
(`violet`, `cyan`, `amber`, `emerald`, `indigo`, `lime`); every component reads
the resulting `--p` variable.
