# yulan.me

## What this is

Personal portfolio for Yulan Galagoda, cyber security engineer and AI researcher. All content (profile copy, projects, experience, education, skills, certifications, side-projects, even the logo and portrait) lives in a Notion workspace, and the site rebuilds on every push so editing Notion is editing the live site.

---

## Updating content

1. Open Notion → **Yulan** workspace → **Yulan.me - Site Source**.
2. Open any of the eight databases (Profile, Experience, Education, Skills, Certifications, Projects, Research & Pubs, Side Worlds).
3. Edit any row. Tick the **Visible** checkbox to publish; untick to hide.
4. Sort order on the site follows the **Order** number.
5. Trigger a rebuild — Cloudflare Pages → Deployments → **Retry deployment** (or push a commit to the repo). The next build pulls fresh content from Notion.

> Build-time only: the site is a static export. Notion is queried during `next build`, not at request time. Save → rebuild → live.

---

## Uploading your logo

1. Open Notion → **Profile** database → the **Site Meta** row.
2. Click the **Image** property → drag in a PNG or SVG.
3. Source size doesn't matter. CSS constrains the rendered image to **28 px** in the header and **24 px** in the footer.
4. Trigger a rebuild.

The same image becomes the header logo, the footer logo, **and** the favicon set (16×16, 32×32, 180×180 Apple touch). To revert to the YG monogram fallback, just delete the file from the Image property and rebuild.

---

## Uploading your portrait

1. Open Notion → **Profile** database → the **Hero** row.
2. Drag a JPG or PNG into the **Image** property.
3. Trigger a rebuild.

The portrait fills the About section's portrait slot. Delete the file to fall back to the placeholder silhouette.

---

## Local development

```bash
cd yulan-me-next
npm install
cp .env.example .env.local
# edit .env.local and paste your NOTION_TOKEN
npm run dev
```

Open http://localhost:3000. The Next.js dev server re-runs the Notion fetcher whenever you reload, so edits made in Notion show up on refresh.

---

## Production build

```bash
npm run build
```

Outputs a fully static site to `out/`. Drop `out/` onto any static host.

---

## Cloudflare Pages setup

1. Push this repo to GitHub.
2. Cloudflare Pages dashboard → **Create project** → **Connect to GitHub** → pick the repo.
3. Build settings:
   - **Framework preset:** None (or "Next.js (Static HTML Export)")
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
4. Environment variables → add `NOTION_TOKEN` with your integration token. Make sure the Notion integration has access to the parent page **Yulan.me - Site Source** (and therefore to all eight child databases).
5. Save and deploy.

**To rebuild after editing Notion:** open Cloudflare Pages → Deployments → click the **⋯** menu on the latest deployment → **Retry deployment**. Or set up a Deploy Hook (Cloudflare Pages → Settings → Builds & deployments → Deploy hooks) and POST to it from a Notion automation / cron.

---

## Tech stack

- **Next.js 14** (App Router) with `output: 'export'` for fully static HTML
- **Notion Data Sources API** via `@notionhq/client` (2025-09-03)
- **Plain CSS** with custom properties. Three files (`tokens.css`, `base.css`, `site.css`), no Tailwind
- **Fonts:** Cormorant Garamond (display), Inter Tight (body), JetBrains Mono (mono). Google Fonts CDN
- **Image pipeline:** `sharp` downloads Notion-hosted files at build time and generates the favicon set
- **Hosting:** Cloudflare Pages
- **Asset paths:** `next.config.mjs` sets `assetPrefix: './'` so the built site works whether it's served from the domain root or a sub-path. Leave that line alone.

---

## Credits

Designed by **Yulan Galagoda**. Built in collaboration with AI: Perplexity, Claude Opus 4.7, Claude Sonnet 4.6.
