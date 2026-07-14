# file-system.md — Civion BD Website

**Purpose:** this is the authoritative map of how files must be organized
on disk for the site to actually build/run correctly — as deployed, not
as originally planned. `structure.md` (in your docs folder) describes the
*aspirational* nested architecture from early planning; this file
describes what was **actually built** and ships in `civion-bd-website.zip`.
If the two disagree, trust this file for anything currently live.

Everything is root-relative. **The site has no build step** — whatever is
in this tree is exactly what gets deployed.

---

## 1. Full tree

```
/                                   ← site root (GitHub Pages project root)
│
├── index.html                      Home page (the ONLY page that stays at root)
│
├── about/
│   └── index.html                  /about/index.html  (also reachable at /about/)
├── services/
│   └── index.html
├── projects/
│   ├── index.html                  Overview grid, with category filtering
│   ├── mrt/index.html              Case study — MRT Line-5 Northern Route
│   ├── devdaru/index.html          Case study — Devdaru Residential Complex
│   ├── radiant/index.html          Case study — Radiant Complex
│   ├── ulukhola/index.html         Case study — Ulukhola Factory Oversight Villa
│   ├── bosudha/index.html          Case study — Bosudha Supermarket
│   └── skymart/index.html          Case study — Project Skymart
├── team-and-partnerships/
│   └── index.html
├── careers/
│   ├── index.html                  linked from Home + Careers itself, not in top nav
│   └── courses/
│       └── index.html              Civion Academy — linked from Careers, not in top nav
├── contact/
│   └── index.html
│
├── includes/                       Fetched + injected into every page at runtime
│   ├── navbar.html
│   └── footer.html
│
├── assets/                         CODE ONLY — never media
│   ├── css/
│   │   ├── main.css                Design tokens + base system
│   │   └── animations.css          Motion system, hero shader wrapper, back-link
│   └── js/
│       ├── main.js                 Include injection, nav, counters, forms
│       └── animations.js           Scroll reveal, WebGL hero shader, project crossfade
│
├── media/                          ALL non-code media — the single media root
│   ├── logos/                      ✅ populated (real files)
│   │   ├── civion-bd-logo-light.png    white wordmark — used on dark nav/footer (default)
│   │   ├── civion-bd-logo-dark.png     black wordmark — for future light-bg contexts
│   │   ├── civion-bd-logo-square.png   icon + wordmark stacked, transparent
│   │   ├── civion-bd-logo-social.png   icon + wordmark, solid bg — default Open Graph share image
│   │   ├── civion-bd-logo-mark.png     icon-only crop — source for favicons
│   │   ├── favicon-16.png / favicon-32.png / apple-touch-icon.png
│   │
│   ├── hero/                       ✅ populated — hero-building-v01.mp4 (+ mobile crop) is the
│   │                                  live homepage hero; poster/thumbnail wired as poster/OG
│   │                                  image. v02 variants + blueprint stills are unused alternates.
│   ├── projects/
│   │   ├── mrt/                    ✅ populated — hero image + analysis video, both wired
│   │   │                              (video also embedded directly on projects/mrt/index.html)
│   │   ├── devdaru/                ✅ populated — hero image wired
│   │   ├── radiant/                ✅ populated — hero image wired
│   │   ├── ulukhola/                ✅ populated — hero image wired
│   │   ├── bosudha/                ✅ populated — hero image wired
│   │   └── skymart/                ✅ populated — hero image wired
│   ├── team/                       ✅ populated — Anway + Imran portraits wired (real photography,
│   │                                  not generated — portrait-backdrop-v01 is an unused extra)
│   ├── about/                      ✅ populated — about-process-v01 wired; about-values-v01 unused
│   ├── services/                   ✅ populated — 4 category illustrations + bg-blueprint-grid and
│   │                                  bg-construction-timelapse videos wired; bg-fe-mesh and
│   │                                  bg-wireframe-building are unused extras (see vidprompts.md)
│   ├── contact/                    ✅ populated — landscape variant wired; portrait variant unused
│   ├── partnerships/               ✅ populated — network illustration wired
│   └── careers/                    ✅ populated — culture-v02 wired; culture-v01 unused
│
├── data/                           Structured content mirror of database.md
│   ├── company.json
│   ├── services.json
│   ├── projects.json               Each entry includes a `url` field pointing at its case-study page
│   ├── team.json
│   └── partners.json
│
├── favicon.ico                     Must stay at root — browsers request it from /favicon.ico by default
├── robots.txt                      Must stay at root
├── sitemap.xml                     Must stay at root
├── _headers                        Cloudflare Pages-only mechanism — inert on GitHub Pages, kept
│                                     in case this repo is ever also mirrored to Cloudflare Pages
├── vidprompts.md                   Media generation briefs (Nano Banana + Veo), not deployed content
└── README.md                       Deployment + configuration guide, not deployed content
```

`✅ populated` folders hold real, wired-in media as of this pass. Where a
folder has both wired and unused files (noted inline above), the unused
ones are alternate takes (`v02`, a different crop/orientation) kept on
disk for an easy future swap — not leftover debris. New media sections not
listed above still follow the rule from §5: create the folder only when
you place the first real file in it.

There is no `workers/` folder and no `wrangler.toml` in this build — an
earlier pass included a Cloudflare Worker (Gemini proxy) behind a chat
widget; both the Worker and the widget's frontend (`assets/js/chat.js`,
its CSS in `animations.css`, and its `<script>` tag on every page) have
been removed. GitHub Pages serves static files only, so a server-side
proxy like that Worker can't run on this host anyway.

---

## 2. The two rules that make everything else make sense

**Rule 1 — every internal reference is relative, never root-absolute
(no leading `/`) and never a full domain.**
Every `<link>`, `<script src>`, `<img src>`, `<video>`/`<source>`,
`fetch()` call, and JSON path in this project is written as a plain
relative path — `assets/css/main.css`, `media/logos/...png`,
`services/index.html` — with **zero** assumption about domain or
deployment subpath. That's deliberate: it's what lets this exact folder
work unmodified whether it's deployed at a domain root
(`https://civionbd.com/`), a GitHub Pages user-site domain
(`https://civion-bd.github.io/`), a GitHub Pages *project* site nested in
a subpath (`https://someuser.github.io/civion-bd/`), or a Cloudflare
Pages/other preview URL — the browser resolves every path purely relative
to the current page's own URL, so it never needs to know what comes
before that.

The one wrinkle this creates: `about/index.html` sits one folder deeper
than `index.html`, so a plain `assets/css/main.css` reference would
resolve differently depending on which page wrote it. Every page's
`<head>`/`<script>` tags account for this directly — `index.html` writes
`assets/css/main.css`, `about/index.html` writes `../assets/css/main.css`
— and pages nested two folders deep (`projects/mrt/index.html`,
`careers/courses/index.html`) write `../../assets/css/main.css` —
computed once, by hand, per page, when the page was built.
`includes/navbar.html` and `includes/footer.html` are the exception:
they're a single shared file injected into pages at *multiple different
depths*, so they can't hardcode any particular relative prefix. See §3
for how that's resolved at runtime.

**Rule 2 — page URLs are `<page>/index.html`, not `<page>.html`** (except Home, which stays at the root as `index.html`).
GitHub Pages also serves the clean form (`/services/` resolves to
`/services/index.html` automatically — true of essentially every static
host, not a GitHub-specific feature), so both work — but every internal
link in this codebase uses the explicit `.../index.html` form. If you add
a new page, follow the same pattern: `mkdir newpage && newpage/index.html`,
and write its internal links the same relative way (`../` for anything
one level deep, `../../` for anything two levels deep, none for anything
at that same level).

---

## 3. How a page actually loads (the dependency chain)

1. Browser requests `/services/index.html`.
2. That file's `<head>` pulls in, in order: Google Fonts (external),
   `../assets/css/main.css`, `../assets/css/animations.css` — the `../`
   is there because `services/` is one folder below the site root (see
   Rule 1 above; `index.html` itself would write these without the `../`,
   and a two-deep page like `projects/mrt/index.html` writes `../../`).
3. `<body data-page="services" data-depth="1">` — every page declares its
   own folder depth here. Home is `data-depth="0"`; every `<page>/index.html`
   page is `data-depth="1"`; every `<page>/<sub>/index.html` page
   (project case studies, the courses page) is `data-depth="2"`. Body also
   contains `<div data-include="navbar"></div>` and
   `<div data-include="footer"></div>` — empty placeholders.
4. At the bottom of the page, `assets/js/main.js` loads (`defer`, itself
   referenced with the same depth adjustment). On `DOMContentLoaded` it:
   a. Reads `data-depth` off `<body>` and computes `BASE = '../'.repeat(depth)`
      (`''` for Home, `'../'` for depth-1 pages, `'../../'` for depth-2 pages).
   b. `fetch(BASE + 'includes/navbar.html')` and same for `footer.html`,
      injects the HTML into the two placeholder `<div>`s.
   c. Walks every `[href]`/`[src]` inside what it just injected and, for
      anything that isn't already an absolute URL/`mailto:`/`tel:`/`#...`,
      prepends `BASE` to it. This is the step that lets one shared
      `includes/navbar.html` — written with plain site-root-relative
      paths like `about/index.html`, no leading slash — work correctly
      whether it's injected into `index.html` (needs no prefix),
      `about/index.html` (needs `../`), or `projects/mrt/index.html`
      (needs `../../`).
   d. Fires a `civion:chrome-ready` custom event.
5. `assets/js/animations.js` (also `defer`, loaded after `main.js`)
   listens for `civion:chrome-ready` and only then runs its setup (scroll
   reveals, the hero video/WebGL shader fallback, project-card filtering)
   — this ordering matters because some of what it wires up needs the
   full page in place before measuring scroll position.

**If you add a new page:** give its `<body>` the correct `data-depth`
(0 at the site root, 1 one folder down, 2 two folders down — the
`'../'.repeat(depth)` logic extends cleanly to any depth), and write that
page's own `<head>`/`<script>` references with the matching number of
`../`. `includes/navbar.html`/`footer.html` need no changes — the rewrite
step in main.js handles any depth automatically.

**Practical consequence:** because step 4 uses `fetch()` for the
includes, **this site must be served over `http://` (a real local server),
not opened directly from disk via `file://`** — browsers block `fetch()`
of local files under the `file://` protocol, regardless of relative vs.
absolute paths. To preview locally:
```
cd civion-bd-website
python3 -m http.server 8080
# then open http://localhost:8080
```
or `npx serve`. This also means the site can be smoke-tested from **any**
local port or path prefix your dev server happens to use — nothing in the
codebase assumes it's reachable at `/`.

---

## 4. Where each kind of file goes

*(Paths below are written from the project root for readability — e.g.
`/media/logos/` just means "the `logos` folder inside `media`". Per Rule 1,
the actual `href`/`src` you write in a page is always relative and
depends on that page's own depth — `media/logos/...` from `index.html`,
`../media/logos/...` from a depth-1 page, `../../media/logos/...` from a
depth-2 page like `projects/mrt/index.html`.)*

| You're adding... | Goes in... | Notes |
|---|---|---|
| A new top-level page | `/<page-slug>/index.html` | Copy an existing page's `<head>` block (fonts, GA, favicon links) rather than retyping it; `data-depth="1"` |
| A new project case study | `/projects/<slug>/index.html` | `data-depth="2"`; `<slug>` must match the `slug` field in `data/projects.json` exactly; link it from `projects/index.html`'s card and add its URL to `sitemap.xml` |
| Shared CSS | `/assets/css/main.css` (tokens/components) or `animations.css` (motion) | Don't create a third CSS file unless a section is genuinely a different concern |
| Shared JS behavior | `/assets/js/main.js` (chrome/forms/counters) or `animations.js` (motion/visuals) | |
| A logo variant | `/media/logos/` | Follow the existing `civion-bd-logo-<variant>.png` naming |
| A project's hero render, gallery, or drawings | `/media/projects/<slug>/` | `<slug>` must match the `slug` field in `data/projects.json` exactly |
| A team portrait | `/media/team/` | Real photography — see `vidprompts.md`'s caution about not generating synthetic faces for named people |
| Any other section image/video (hero, about, services, contact, careers, partnerships) | `/media/<section>/` | Filenames follow `{scope}-{topic}-v{NN}.{ext}` per `animation.md`; exact filenames are already worked out in `vidprompts.md` |
| A new content fact (new project, new service, etc.) | `data/<file>.json` **and** the matching HTML page | This site hard-codes page copy in HTML for SEO/reliability (see README §Content model) — `data/*.json` is the structured mirror, kept in sync by hand |

---

## 5. Adding new media, or swapping in an unused alternate

1. Generate/produce the asset per its brief in `vidprompts.md` (or pick one
   of the already-delivered-but-unused alternates noted in §1, e.g. a `v02`).
2. Create the folder if it doesn't exist yet (e.g. `mkdir -p media/hero`).
3. Save the file under the **exact filename** `vidprompts.md` specifies.
4. Wire the `src`/`href` into the relevant page — search the page for the
   current filename it points to and swap it, or ask a coding agent to do
   this once the file exists.
5. If you're tracking asset status in `media-status.md` from the docs
   folder, flip that row to `READY` (or note the swap).

Never place a media file directly under `/media/` (root) — every asset
belongs in a named subfolder (`logos/`, `projects/<slug>/`, `team/`,
`hero/`, etc.) so the folder stays navigable as it grows.

---

## 6. Things that will break the site if changed carelessly

- **Nesting a page deeper than its declared level** (e.g. adding
  `projects/mrt/gallery/index.html`, three deep) without updating that
  page's `data-depth` to `3` and its own `<head>`/`<script>` references to
  `../../../` — `data-depth` is read as a plain integer and `BASE` is
  `'../'.repeat(depth)`, so it extends correctly to any depth, but only if
  you actually set it right on the new page.
- **Writing a new page's internal links with a leading `/`** — this
  codebase deliberately has none (Rule 1); a stray `/media/...` or
  `/about/index.html` will 404 the moment the site is deployed anywhere
  other than a domain root the same way `civion-bd.github.io` happens to
  be. Grep for `="/` across `*.html` occasionally to catch regressions —
  a clean site returns nothing.
- **Renaming `includes/navbar.html` or `includes/footer.html`** without
  updating the `data-include="...`" fetch paths in `assets/js/main.js`.
- **Editing `includes/navbar.html`/`footer.html` to use `../`-prefixed or
  leading-`/` links "to make them work from a subpage"** — don't. They're
  written once, relative to the site root with no prefix, on purpose; the
  `rewriteRelativeLinks()` step in `main.js` is what adapts them per page.
  Hardcoding a prefix into the include file itself would only be correct
  for one depth and silently break the others.
- **Renaming a page's folder** (e.g. `services/` → `our-services/`)
  without updating every internal link to it — there's no redirect layer,
  so old links would 404. Grep for the old path across `*.html`,
  `includes/*.html`, `data/*.json`, `sitemap.xml` before renaming anything.
- **Moving `_headers`, `robots.txt`, `sitemap.xml`, or `favicon.ico` out of
  the project root** — the latter three are read from fixed, conventional
  locations by browsers/crawlers and won't be found anywhere else
  (`_headers` itself only matters if this repo is ever deployed to
  Cloudflare Pages — see README §Deploying). These, plus `sitemap.xml`'s
  `<loc>` URLs and `robots.txt`'s `Sitemap:` line, are the only places in
  this project that legitimately need a real, absolute domain — a sitemap
  without one isn't valid. Update the domain in both if you move off
  `civion-bd.github.io`.
- **Adding a build step** (bundler, framework, etc.) without also updating
  `README.md`'s deploy instructions (currently "none" — static deploy) and
  re-checking that every relative path still resolves the same way
  post-build — most bundlers rewrite asset URLs, which would conflict with
  the `BASE`-prefixing this site already does by hand.
- **Editing a fact in only one place.** Per `database.md`'s Change
  Protocol: update `database.md` → the matching `data/*.json` file → the
  HTML page(s) that mention it, in that order, every time.

---

## 7. What's NOT part of the deployed site

`vidprompts.md`, `README.md`, and this file (`file-system.md`) are
project documentation — useful to keep in the repo for context, but
nothing in the live site links to them and GitHub Pages serving them
publicly at `/vidprompts.md` etc. is harmless but unintentional. If you'd
rather they not be publicly fetchable, move them outside the Pages
project root into a separate docs repo/folder that isn't deployed (GitHub
Pages has no per-file header mechanism like Cloudflare Pages' `_headers`,
so an `X-Robots-Tag: noindex` response header isn't an option here — a
`<meta name="robots" content="noindex">` tag or simply not deploying the
file are the two realistic options).
