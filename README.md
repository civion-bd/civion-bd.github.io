# Civion BD — Website (Version 1)

Static HTML5 / CSS3 / vanilla JavaScript site, built against the project's
own governing docs (`plan.md`, `structure.md`, `database.md`, `design.md`,
`animation.md`, `add-ins.md`) and the Stitch mockups / token spec in
`stitch_corporate_website_design/industrial_elegance/DESIGN.md`.

## What's here

```
index.html                     Home (stays at root)
about/index.html               About
services/index.html            Services (overview)
projects/index.html            Projects (overview, with category filtering)
projects/<slug>/index.html     Individual project case studies (mrt, devdaru,
                                radiant, ulukhola, bosudha, skymart)
team-and-partnerships/index.html  Team & Partnerships (nav: "Team & Partners")
careers/index.html             Careers (Recruitment + Learning) — linked from Home, not in top nav
careers/courses/index.html     Civion Academy (informational only, V1) — linked from Careers
contact/index.html             Contact

includes/
  navbar.html, footer.html     Injected into every page by assets/js/main.js

assets/
  css/main.css                 Design tokens + base system (colors, type, buttons, cards, nav, forms)
  css/animations.css           Motion system (reveals, hero shader wrapper, storyboards)
  js/main.js                   Include injection, mobile nav, scroll state, counters, Formspree wiring
  js/animations.js             Scroll reveal, WebGL hero shader, project background crossfade
  images/                      Placeholder logo SVGs — replace with final brand files (see below)

data/
  company.json, services.json, projects.json, team.json, partners.json
                                Structured content mirroring database.md — see "Content model" below

media/
  logos/                        Real Civion BD logo files (light/dark/square/social + favicon set)

_headers                         Cloudflare Pages caching + security headers (inert on GitHub Pages —
                                  kept in case this site is ever also mirrored to Cloudflare Pages)
robots.txt, sitemap.xml, favicon.ico   Basic SEO / browser chrome
vidprompts.md                    Nano Banana + Veo prompts for every planned media asset, mapped to exact filenames
```

## URL structure

Every page except Home lives at `/<page>/index.html` (e.g.
`/services/index.html`) rather than a flat `/services.html`. Project case
studies and the courses page nest one level deeper still —
`/projects/mrt/index.html`, `/careers/courses/index.html`. GitHub Pages (like
virtually every static host) also serves these at the clean `/services/` URL
automatically (a directory request resolves to its `index.html`), so both
forms work — internal links in this build use the explicit `.../index.html`
form for clarity.

**Every internal path in this project is relative — never root-absolute,
never a hardcoded domain.** This means the site works unmodified under
any domain or subpath (a custom domain, `civion-bd.github.io`, a repo
served from a subpath like `<user>.github.io/<repo>/`, a preview URL —
all of it), because the browser resolves every reference purely against
the current page's own URL. The one thing this requires: each page's
`<body data-depth="N">` tells `main.js` how many folders deep that page
sits, so the shared `includes/navbar.html`/`footer.html` (written once,
with plain root-relative-style paths) get the right `../` prefix
rewritten in at runtime. Full mechanics — and the checklist for adding a
new page without breaking this — are in `file-system.md` §§1–3.

**One deliberate exception:** `og:image` meta tags are also written as
relative paths for the same domain-agnostic reason, but the Open Graph
spec technically wants absolute URLs — most social-media crawlers (Slack,
Discord, iMessage) resolve relative OG URLs fine, but Facebook/LinkedIn's
crawlers are the least reliable about it. If link-preview images don't
render on a specific platform once this is live, that's the first thing
to check — swap that one meta tag to a full `https://civion-bd.github.io/...`
URL (or your final custom domain) once it's locked in; nothing else needs
to change.

## Media status

All media from `vidprompts.md` has been generated and wired in (delivered
via `media.zip`): the homepage hero video, all 6 project hero renders (+
the MRT analysis video), both team portraits (real photography, not
generated), the 4 service category illustrations, the About page process
diagram, the Partnerships network illustration, and the Careers/Contact
imagery. Two ambient background videos are also live (Services page and
Projects page hero). See `file-system.md` §1 for the exact file-by-file
map of what's wired where, and which alternates (`v02`s, unused crops)
are sitting on disk for an easy future swap — nothing was deleted, so
swapping in a different take is a one-line change, not a new asset.

Stills arrived as `.webp.png`/`.webp.jpg` and were re-encoded to real
`.webp` during integration (this cut file sizes by roughly 90%, e.g. a
2.5MB PNG became a ~250KB WebP) — if generating a fresh batch later,
export directly to `.webp` to skip that step.

**The logo is real** (from `logos.zip`) and already wired everywhere: nav,
footer, favicon (`.ico` + PNG set + apple-touch-icon), and Open Graph
social image. Files live in `media/logos/`:
- `civion-bd-logo-light.png` — white wordmark, used on the site's dark nav/footer (default)
- `civion-bd-logo-dark.png` — black wordmark, for any future light-background context
- `civion-bd-logo-square.png` — icon + wordmark stacked, transparent
- `civion-bd-logo-social.png` — icon + wordmark on solid dark background, used as the default OG share image (the homepage and each project page override this with their own real image instead)
- `civion-bd-logo-mark.png` / `favicon-*.png` / `apple-touch-icon.png` — icon-only crop, for the browser tab and home-screen icon

**Note on naming:** `database.md` §11 lists the footer logo as `Logo-Dark.png` — but pixel-checking the actual delivered files shows `Logo-Dark.png` has **black** text and `Logo-Light.png` has **white** text (the names describe the logo's own color, not which background it's meant for). Since this site's nav and footer are dark, a black logo there would be invisible — so the nav/footer use `civion-bd-logo-light.png` (white text) instead, and `civion-bd-logo-dark.png` is kept on hand for any future light-background context. Worth a one-line fix in `database.md` §11 so this doesn't trip up the next pass.

The full cinematic storyboard animations in `animation.md` / `Update.md`
(the drafting-table cover-sheet reveal, the frame-by-frame partnership
handshake sequence, the rotating illuminated globe) are implemented here in
a **simplified, still-technical form** — CSS/SVG-driven scroll reveals, a
WebGL flow-field hero (adapted from your `shader/code.html`), and an
icon-based storyboard strip — rather than bespoke frame-by-frame artwork.
Producing the full versions needs actual illustration/animation assets,
which is Phase 3 (Media) work, not something to fabricate here.

`careers/index.html` and `careers/courses/index.html` are built (per
`plan.md`'s Page-by-Page spec) even though `database.md` §10's current live
nav doesn't list them — they're reachable from the homepage's "Careers &
Learning" section and from Careers itself, matching the "Courses reachable
from Careers" note in `structure.md`/`plan.md`. No specific open positions
are invented; the Careers page says so plainly rather than fabricating
listings, per the Honesty Policy pattern the rest of this project follows.

Each of the 6 delivered projects also has its own case-study page under
`projects/<slug>/index.html`, linked from both the Projects overview cards
and the 3 featured cards on Home. These pull the same facts already
established in `data/projects.json` / `database.md` — no project detail
was invented to fill them out; the two projects without a `technicalDetails`
list keep to what's known (scope, software, codes) rather than padding
with invented specifics.

## Deviations from add-ins.md worth knowing about

- **Icons:** Material Symbols Outlined instead of Font Awesome, to match
  what your Stitch mockups already use in production (`design.md` §Icons
  says outlined/consistent-stroke is what matters; `add-ins.md` itself
  says update the doc to match reality when a build has already settled
  something).
- **GSAP / AOS / Swiper:** not pulled in. The reveal system, hero shader,
  and project-card filtering are done in vanilla JS, which clears the
  add-ins.md Dependency Checklist test ("Can it be achieved with
  HTML/CSS/Vanilla JS?") and keeps the Performance targets (95+ desktop /
  90+ mobile) easier to hit. If you want GSAP's timeline sequencing for a
  future, more elaborate hero animation, it can be added as a CDN
  `<script>` without touching anything else.
- **No AI assistant / chat widget in this version.** An earlier pass
  included a Cloudflare Worker (Gemini proxy) powering a chat widget; it's
  been removed. GitHub Pages serves static files only and has no
  equivalent to a Worker, so a proxy like that would need a separate
  serverless host (Cloudflare Workers, a small Node function elsewhere,
  etc.) if this is revisited later — nothing in the current codebase
  depends on it.

## Content model

Per `add-ins.md`, content should be "sourced from JSON, never hard-coded
into HTML." For this first version, page copy is written directly into the
HTML (matching `database.md` exactly, fact for fact) for reliability and
SEO — search engines and simple `fetch()` previews see full content
immediately, with no client-side render step. The `data/*.json` files are
maintained in parallel as the structured, machine-readable mirror of
`database.md` (useful for a future search index, or moving to client-side
rendering later). `data/projects.json` also carries a `url` field per
project pointing at its case-study page, kept in sync with the HTML.

**If you change a fact, update it in three places, in this order** (per
`database.md` §14's Change Protocol): `database.md` → the matching
`data/*.json` file → the HTML page(s) that mention it.

## Deploying

### 1. GitHub Pages (frontend)
This site is a plain static build with no build step, so GitHub Pages can
serve it directly from a repo.

```
git init && git add -A && git commit -m "Civion BD site v1"
git remote add origin https://github.com/civion-bd/civion-bd.github.io.git
git push -u origin main
```

Naming the repo **exactly** `civion-bd.github.io` makes it a GitHub *user/
organization site* — GitHub serves it automatically at
`https://civion-bd.github.io/` (the domain root, no repo-name subpath),
with no separate "enable Pages" step required for most account types
(double-check **Settings → Pages** on the repo the first time; if it shows
as not yet published, set the source to the `main` branch there). If you
ever deploy this same folder from a *differently-named* repo instead (a
"project site"), GitHub serves it at `https://<user>.github.io/<repo>/`
instead — this codebase doesn't care either way, since every internal path
is relative (see URL structure above).

Because `main.js` loads `includes/navbar.html`/`footer.html` via `fetch()`,
this site must be served over `http://`/`https://`, not opened directly
from disk via `file://`. To preview locally before pushing:
```
cd civion-bd-website
python3 -m http.server 8080
# then open http://localhost:8080
```

### 2. Formspree (contact + careers forms) — done
Both forms already point at `https://formspree.io/f/xwvgeqdk`. No action
needed unless you want to split contact vs. careers submissions into two
separate Formspree forms later.

### 3. Google Maps / Calendar (Contact page)
The Maps embed in `contact/index.html` is wired to the real office address
(Mirpur DOHS, Dhaka-1216) via a plain `<iframe>` (add-ins.md: iframe only,
no Maps JS API key needed) — verify the pin looks right and adjust the
query string if needed. The Calendar embed is still a `.media-frame`
placeholder pending a booking link.

### 4. Analytics — done
Every page's `<head>` loads the GA4 `gtag.js` snippet with your real
Measurement ID (`G-GGPD788ZMY`) already in place:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GGPD788ZMY"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-GGPD788ZMY', { anonymize_ip: true });
</script>
```
No action needed. Search Console verification isn't wired (needs a
production domain to verify against first — `civion-bd.github.io` works
once the repo is live, or wait until a custom domain is attached).

### 5. `_headers` (Cloudflare Pages only — not used by GitHub Pages)
`_headers` at the repo root sets baseline security headers and a caching
policy, and is picked up automatically **if** this repo is ever deployed
to Cloudflare Pages. GitHub Pages has no equivalent mechanism (it serves a
fixed header set with no per-file configuration), so this file is
currently inert — harmless to keep, but it isn't doing anything on the
live site. If you want equivalent security headers on GitHub Pages, the
usual routes are a `<meta>`-tag equivalent for the handful of headers that
support one, or fronting the GitHub Pages site with a CDN (e.g. Cloudflare
in "DNS only"/proxy mode) that can inject headers at the edge.

A commented-out `Content-Security-Policy` line is left in `_headers` as a
starting point for whichever of these paths you take.

## Still open (flagged, not improvised — per plan.md's rule)

- Google Calendar booking link (Contact page — Maps is wired, Calendar isn't yet)
- A custom domain, if you want one instead of `civion-bd.github.io`
- Real security headers if `_headers` staying inert (see §5 above) isn't acceptable long-term
