# AI Maintenance Reference — Telco Tech Namibia

> **Audience:** Any AI agent (Claude, Gemini, or other) tasked with maintaining or expanding this website.
> Read this file fully before making changes. It is the single source of truth; `PROJECT_CONTEXT.md` and `README.md` are historical and defer to this document.
> **Keep this file updated** whenever you change the architecture, theme, pipeline, or deployment.

---

## 1. Mission & Trajectory

This site is a research platform for the **Namibian telecommunications landscape** — licenses, spectrum, tariffs, numbering, equipment approvals, Acts, Regulations, and Government Gazettes, all extracted from official CRAN (Communications Regulatory Authority of Namibia) publications.

- **Current (demo):** `https://telcotech.peon.tech`
- **Future (production):** `https://telcoanalysis.com` — a fully fledged research site of the Namibian telco landscape and beyond
- **Planned features (not yet built):** newsletter over digital channels (WhatsApp first), notification of new gazettes, curated highlights of the telco landscape. Design decisions should keep these in mind — keep data machine-readable and pages statically enumerable.

**Owner:** Ricky Innes (see `/about`) — telco core network builder/integrator, delegates build and maintenance of this site to AI agents.

## 2. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro (SSG, v6) | Static output to `dist/` |
| UI | React via `@astrojs/react` | Only for interactive islands; prefer plain `.astro` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + `@tailwindcss/typography` | No `tailwind.config` — v4 CSS-first config in `src/styles/global.css` |
| Search | Pagefind (post-build index, `npx pagefind --site dist` in the build script) | UI embedded on `/gazettes` |
| SEO | `@astrojs/sitemap` + canonical/OG meta in `Layout.astro` | `site:` set in `astro.config.mjs` |
| Node | ≥ 22.12 (CI uses 24) | |

## 3. Repository Layout

```
/opt/telcotech
├── astro.config.mjs          # site URL lives here — see §8 migration
├── package.json              # build = astro build && npx pagefind --site dist
├── .github/workflows/deploy.yml
├── public/                   # favicon, robots.txt
├── AI_MAINTENANCE.md         # ← this file
└── src/
    ├── styles/global.css     # THE theme file (Gruvbox Tactical HUD) — §4
    ├── layouts/Layout.astro  # nav + HUD status strip + footer + SEO meta
    ├── components/DataTable.astro   # generic table renderer for JSON datasets
    ├── content.config.ts     # collection schemas (gazettes, acts, regulations)
    ├── content/
    │   ├── gazettes/*.md     # frontmatter: title, id, year
    │   ├── acts/*.md         # frontmatter: title, id
    │   └── regulations/*.md  # frontmatter: title, id
    ├── data/*.json           # structured datasets — §5
    └── pages/
        ├── index.astro       # bento-grid dashboard (counts per category)
        ├── about.astro       # owner bio page
        ├── telecom|broadcasting|spectrum|tariffs|numbers|equipment.astro
        └── gazettes|acts|regulations/{index,[id]}.astro
```

## 4. Theme: Gruvbox Tactical HUD

The entire visual identity is defined by CSS variables in `src/styles/global.css`. Dark mode (default) is **Gruvbox Dark hard** with an amber/orange accent; light mode is **Gruvbox Light hard** with burnt orange. Toggled via the `.dark` class on `<html>` + `localStorage.theme` (script in `Layout.astro`).

### Variables (consume these — NEVER hardcode colors in pages)

| Variable | Purpose | Dark value | Light value |
|---|---|---|---|
| `--bg-color` | page background | `#1d2021` | `#f9f5d7` |
| `--text-color` | body text | `#ebdbb2` | `#3c3836` |
| `--text-dim` | secondary text | `#a89984` | `#7c6f64` |
| `--accent-color` | primary accent (amber) | `#fe8019` | `#af3a03` |
| `--accent-2` | secondary (aqua) — status dots | `#8ec07c` | `#427b58` |
| `--alert-color` | errors/alerts | `#fb4934` | `#9d0006` |
| `--bento-bg` | panel background | `#282828` | `#fbf1c7` |
| `--bento-border` | panel borders | `#504945` | `#d5c4a1` |
| `--row-hover` | table row hover | orange α .07 | orange α .08 |
| `--glow` / `--glow-hover` | panel shadows | orange glow | soft gray |
| `--grid-line` / `--scanline` | HUD overlays | subtle | subtler |

### HUD building blocks

- `.terminal-box` — the universal panel: gruvbox panel bg, 1px border, **accent corner brackets** (top-left + bottom-right, via `::before`/`::after`; they grow on hover). Because corners use both pseudo-elements, don't add other `::before/::after` styling to a `.terminal-box`.
- `.hud-label` — micro-label style for section headers, e.g. `Signal_Origin //`, `Core_Modules //`. Use for all section labels.
- `.hud-dot` — pulsing aqua status dot (respects `prefers-reduced-motion`).
- Body overlays: `body::before` = tactical grid (48px), `body::after` = CRT scanlines. Pure CSS; the old `public/tech-bg.png` raster is no longer referenced.
- Layout chrome: nav bar → HUD status strip (`SYS:ONLINE · GRID:NAMIBIA · SRC:CRAN_PUBLIC_RECORDS · LAST_SYNC:<build date>`) → content → footer (nav links + data disclaimer).

### Style rules

1. Every panel is a `.terminal-box`. Headers uppercase, tracking-wide, monospace.
2. Colors only via the CSS variables above (Tailwind arbitrary values like `text-[var(--accent-color)]`, `hover:bg-[var(--row-hover)]`).
3. Both themes must work — test dark AND light after visual changes.
4. Mobile rules (learned the hard way): keep `initial-scale=1` in the viewport meta; wide content gets `overflow-x-auto` on its container; `.prose` already has word-break + scrollable tables/pre in `global.css`; wrap header rows with `flex-wrap`.

## 5. Data Architecture & Pipeline

Two kinds of content:

**A. Markdown documents** (`src/content/`) — full gazettes/acts/regulations rendered via content collections (`content.config.ts` schemas). Cleaned source markdown lives on the maintainer's server at `/opt/cran_clean_mds/docs/` (outside the repo); helper Python/Node scripts in `/opt/` clean and move files into `src/content/`, then commit/push (commit message style: "Reprocess formatted markdown documents").

**B. Structured JSON** (`src/data/`) — tables extracted from the markdown. The `unified_*.json` files are the canonical ones consumed by pages:
`unified_telecom.json`, `unified_broadcasting.json`, `unified_spectrum.json`, `unified_numbers.json`, `tariffs.json`, `typeApprovedEquipment.json`. (Non-unified `*Licenses.json` files are legacy intermediates.)

- The dashboard (`index.astro`) shows `array.length` counts per dataset.
- `DataTable.astro` renders the generic `{gazette, data: {header[], rows[][]}}` shape; `telecom.astro` etc. render dataset-specific columns.
- Gazette detail pages deep-link to the original PDF at `https://www.lac.org.na/laws/{year}/{id}.pdf`.

**Adding a gazette:** drop `NNNN.md` with frontmatter (`title`, `id: "NNNN"`, `year: NNNN`) into `src/content/gazettes/` — routing, listing, search and counts pick it up automatically at build.

## 6. Build, Verify, Deploy

```bash
cd /opt/telcotech
npm run build        # astro build + pagefind index — MUST pass before pushing
```

- **Deploy:** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → Node 24, `npm ci`, `npm run build`, rsync `dist/` over SSH (port 65002) to Hostinger. Secrets: `SSH_KEY`, `SSH_HOST`, `SSH_USER`, `DEPLOY_PATH`.
- Remote: `git@github.com:peon0tech-svg/telcotech.git`
- Always run the local build before pushing; a broken push burns a deploy cycle.
- `LAST_SYNC` in the HUD strip is stamped at build time (`Layout.astro`), so every deploy refreshes it.

## 7. SEO / Discoverability

- `site:` in `astro.config.mjs` drives sitemap, canonical links and `og:url`.
- `Layout.astro` accepts an optional `description` prop per page — set it for new pages.
- `public/robots.txt` points to `/sitemap-index.xml`.

## 8. Domain Migration Checklist (telcotech.peon.tech → telcoanalysis.com)

1. `astro.config.mjs` — change the `site:` URL (single marked line).
2. `public/robots.txt` — update the Sitemap URL.
3. GitHub secret `DEPLOY_PATH` / Hostinger vhost — point at the new domain's docroot.
4. Grep for the old domain: `grep -rn "peon.tech" src/ public/ *.md *.mjs`.
5. Consider a 301 redirect from the old domain after cutover.

## 9. Feature Backlog (owner's stated direction)

- Gazette watch: notify on new CRAN gazettes (WhatsApp / digital channels).
- Newsletter with telco landscape highlights.
- RSS/Atom feed (cheap win: `@astrojs/rss` over the gazettes collection).
- Expanded analysis/research sections beyond Namibia.

When implementing notification features, remember the site is fully static — server-side pieces (webhooks, WhatsApp API senders) must live outside this repo (owner has self-hosted infrastructure managed with pyinfra; ask before coupling).

## 10. Working Agreements

- The owner reviews copy carefully — for user-facing prose (especially `/about`), **propose text and get approval before implementing**.
- No employer names or job titles on the About page; achievements framed around building exchanges, teams and organisations.
- Keep commit messages descriptive; push to `main` triggers a live deploy, so batch related changes into one push.
- Update THIS file when you change anything it describes.
