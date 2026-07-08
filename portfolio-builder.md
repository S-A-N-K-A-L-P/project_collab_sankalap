# S.A.N.K.A.L.P. — Portfolio Builder

> **Status:** Design document — planning only, no code yet.
> **Type:** Feature module (public, shareable, themed portfolios)
> **Date:** 2026-06-02
> **Sibling docs:** `finalisedprojectworkflow.md`, `orgsworkflow.md`

> ### ✅ Locked decisions (2026-06-02)
> 1. **Two-pane builder:** LEFT = input form + controls (user fills info, toggles
>    sections, picks theme); RIGHT = **live final-output preview** of the actual
>    portfolio, updating in real time.
> 2. **User-toggled 3D:** a **"3D heavy render (three.js)"** checkbox in the left
>    pane. **Off by default** (lightweight CSS/canvas effects); when the user
>    **checks it**, three.js heavy backgrounds load (dynamic import, `ssr:false`).
>    The user controls the performance/visual trade-off per portfolio.
> 3. **8 themes at launch** (full Tier-1 set).
> 4. **Instant live publish:** the portfolio is **live by default** with a live
>    view — no separate "publish later" gate. (User can still toggle it private.)

---

## 1. Vision

Give every user a **public, custom-themed portfolio site** at a clean URL like
`/portfolio/userx001` — a personal page they can share on LinkedIn, in a résumé,
or anywhere. It auto-pulls their real work on the platform (completed projects,
skills, contributions, GitHub stats, achievements) and lets them pick a
**visually rich theme** with **animated / 3D backgrounds** and a **live preview**.

```
   Profile (private, in-app)                Portfolio (public, standalone)
 ┌───────────────────────────┐            ┌─────────────────────────────────┐
 │  /profile/[id]            │            │  /portfolio/[handle]            │
 │  ┌─────────────────────┐  │  builds →  │  • themed hero w/ animated bg   │
 │  │ TAB: Portfolio      │  │            │  • about, skills, projects,     │
 │  │  - theme picker     │  │            │    contributions, achievements  │
 │  │  - section toggles  │  │            │  • shareable, SEO + OG card     │
 │  │  - live preview     │  │            │  • no app chrome (own layout)   │
 │  │  - publish + share  │  │            └─────────────────────────────────┘
 │  └─────────────────────┘  │                         ▲
 └───────────────────────────┘             LinkedIn / Twitter / résumé link
```

**Why it fits:** the platform already has the *content* (projects, skills,
contributions, gamification). The portfolio is a **presentation layer** over
data users already generate — high value, mostly assembly.

---

## 2. Routing & Layout

| Route | Group | Auth | Purpose |
|---|---|---|---|
| `/portfolio/[handle]` | **root** (NOT `(app)`) | **public** | The live portfolio page — no sidebar/topnav, own full-bleed layout |
| `/portfolio/[handle]/opengraph-image` | root | public | Dynamic OG image for LinkedIn/Twitter rich cards |
| Profile **Portfolio tab** | `(app)` | owner only | The builder (theme, sections, content, publish) |

**Key point:** `/portfolio/*` lives **outside** the `(app)` route group so it
inherits only the root layout (`<Providers>`) — no app chrome. This is what makes
it feel like a standalone personal site, viewable by anyone (logged-in or not).

**Handle:** the URL uses a **handle** (`userx001`), not the Mongo `_id`. The
`User` model has no handle today → we add one (see §4). Fallback: if a user has
no handle, the route also resolves by `_id` (`/portfolio/<objectId>`), and the
builder nudges them to claim a handle.

---

## 3. What a Portfolio Contains (sections)

Each section is **toggleable** and **reorderable** in the builder. Most are
**auto-populated** from existing platform data; a few are free-form.

| Section | Source | Notes |
|---|---|---|
| **Hero** | name, avatar, headline, location | Themed, animated background; the showpiece |
| **About** | `User.bio` (+ optional long-form) | Markdown-lite |
| **Skills** | `User.skills[]` | Animated chips; optional proficiency bars |
| **Featured Projects** | completed Projects / showcase entries the user led or contributed to | User hand-picks & orders; pulls cover, liveUrl, github, tech |
| **Contributions** | `Contribution` + `GitRepo` stats | Commits, merged PRs, stars — a "GitHub-style" panel |
| **Achievements** | gamification (XP, level, badges) *(from orgsworkflow v2)* | Degrades gracefully if gamification not yet built |
| **Experience / Timeline** | free-form entries | role, org, dates, description |
| **Tech Stack** | `User.techStackPreference` + derived from projects | Logos/icon grid |
| **Contact & Socials** | github, custom links (email, LinkedIn, X, site) | Click-to-copy / outbound |
| **Stats strip** | followers, projects shipped, reputation | Small animated counters |

---

## 4. Data Model

### 4.1 `User` — add a handle
```ts
handle: {
  type: String, unique: true, sparse: true, lowercase: true, trim: true,
  // 3–30 chars, [a-z0-9-], reserved list enforced
}
```
Backfill: generate from name + short random suffix (e.g. `arya-sharma-7f3`) for
existing users; let them customise later. `sparse: true` so nulls don't collide.

### 4.2 NEW `Portfolio` (one per user)
```ts
{
  userId:      ObjectId<User>,  // unique
  isPublished: { type: Boolean, default: true },        // instant live publish (user can flip to private)
  heavy3d:     { type: Boolean, default: false },        // user's "3D heavy render (three.js)" checkbox
  themeId:     { type: String,  default: "aurora" },   // see §5 theme registry
  accent:      { type: String,  default: "" },         // optional per-user accent override
  headline:    { type: String,  default: "" },         // e.g. "Full-stack builder · AI"
  tagline:     { type: String,  default: "" },
  aboutLong:   { type: String,  default: "" },          // markdown-lite

  // section visibility + order
  sections: [{
    key:     String,   // "hero" | "about" | "skills" | "projects" | ...
    enabled: Boolean,
    order:   Number,
  }],

  featuredProjectIds: [ObjectId<Project>],  // hand-picked, ordered
  experience: [{ role: String, org: String, start: String, end: String, summary: String }],
  links: [{ label: String, url: String, icon: String }],   // socials / custom

  seo: { title: String, description: String, ogImage: String },
  views: { type: Number, default: 0 },

  // analytics-lite (optional)
  lastPublishedAt: Date,
}
```
*Stored separately from `User` so the builder can save drafts without touching
the core account doc, and so a public fetch pulls one focused document.*

### 4.3 Reserved handles
`admin`, `api`, `portfolio`, `login`, `register`, `feed`, `orgs`, `showcase`,
`marketplace`, `settings`, `me`, `new`, `null`, `undefined`.

---

## 5. Themes, 3D & Animated Backgrounds

A **theme registry** drives the look. Each theme = palette + typography +
**background effect** + card style + layout. Users pick a theme; the builder
shows a **live preview**; a per-theme **thumbnail** appears in the picker.

### 5.1 Theme object
```ts
interface PortfolioTheme {
  id: string;                 // "aurora"
  name: string;               // "Aurora"
  background: BackgroundKind; // animated bg component key
  palette: { bg, surface, text, muted, accent, accent2 };
  font: { heading, body };
  card: "glass" | "solid" | "outline" | "tilt3d";
  layout: "centered" | "split" | "sidebar";
  intensity: "subtle" | "rich";   // animation strength (respects reduced-motion)
}
```

### 5.2 Background effects (each a lazy-loaded React component in `backgrounds/`)
| Key | Effect | Tech | Cost |
|---|---|---|---|
| `aurora` | Drifting gradient blobs / northern-lights | CSS + framer-motion | none (have framer-motion) |
| `mesh` | Animated mesh-gradient | CSS keyframes | none |
| `constellation` | Particle network reacting to cursor | `<canvas>` (hand-rolled) | none |
| `starfield` | Parallax stars / warp | `<canvas>` | none |
| `tilt3d` | 3D perspective cards + mouse parallax | CSS 3D transforms + framer-motion | none |
| `waves` | Animated SVG wave layers | SVG + CSS | none |
| `globe` *(heavy-3D)* | Rotating wireframe globe / floating 3D shapes | **three.js** via `@react-three/fiber`, **dynamic import** | loads only when user enables 3D |
| `ribbons` *(heavy-3D)* | Flowing 3D ribbons | three.js, dynamic import | loads only when user enables 3D |

**Dependency stance — user-controlled "3D heavy render" toggle:**
- **Lightweight (default):** all CSS / framer-motion / canvas effects — **zero new
  dependencies**, no build risk, SSR-safe (effects mount client-side only). Every
  theme has a lightweight background that works with `heavy3d = false`.
- **Heavy 3D (opt-in):** when the user **checks "3D heavy render (three.js)"** in
  the builder (`Portfolio.heavy3d = true`), themes that support it upgrade their
  background to a true-3D `three.js` / `@react-three/fiber` variant, loaded via
  `next/dynamic` with `ssr:false`. If `heavy3d` is off, the three.js bundle is
  **never imported** — so the default page stays light and the build is never at
  risk. (Same safe dynamic-import discipline as the Cloudinary stub.)
- **Decision still pending:** whether to add the `three.js` dependency now or stub
  the heavy variants until later — see §12 open questions. Either way the **toggle
  ships**; it simply renders the lightweight effect until the 3D variant exists.

**Accessibility & perf:** every effect honors `prefers-reduced-motion` (falls back
to a static gradient); background is `pointer-events:none` and never blocks
content; heavy-3D pauses when the tab is hidden / off-screen.

### 5.3 Starter theme set (Tier 1)
Aurora (default), Midnight Mesh, Constellation, Starfield Warp, Tilt Deck,
Ocean Waves, Minimal Light, Terminal (mono/hacker). ~8 themes at launch.

---

## 6. The Builder — Two-Pane Layout (Profile → Portfolio tab)

Lives in the **profile page** as a new **"Portfolio" tab** (owner-only). The
builder is **two panes side by side**:

```
┌───────────────────────────┬─────────────────────────────────────────┐
│  LEFT — INPUTS & CONTROLS │  RIGHT — LIVE FINAL-OUTPUT PREVIEW        │
│  (scrollable form)        │  (the real PortfolioRenderer, live)       │
│                           │                                           │
│  • Handle (avail. check)  │   ╔═══════════════════════════════════╗   │
│  • Theme picker (thumbs)  │   ║   themed hero + animated background ║   │
│  • ☐ 3D heavy render      │   ║   about · skills · projects …       ║   │
│       (three.js)          │   ║                                     ║   │
│  • Headline / tagline     │   ║   ← updates instantly as you edit   ║   │
│  • About (long)           │   ╚═══════════════════════════════════╝   │
│  • Sections toggle+reorder│                                           │
│  • Featured projects pick │   [ Desktop | Mobile ]  [ Open ↗ ]        │
│  • Experience entries     │                                           │
│  • Links (socials/custom) │                                           │
│  • Accent color           │                                           │
└───────────────────────────┴─────────────────────────────────────────┘
```

### Left pane — controls
1. **Handle** — claim/edit, live availability check, shows the final public URL.
2. **Theme picker** — grid of theme thumbnails; click → right pane updates instantly.
3. **☐ 3D heavy render (three.js)** — the user-controlled toggle (§5.2). Unchecked
   = lightweight effect; checked = load the theme's three.js background. A small
   note warns it's heavier on low-end devices.
4. **Headline / tagline / long about** — text fields.
5. **Sections** — toggle on/off + drag to reorder.
6. **Featured projects** — pick from your completed/showcase projects, reorder.
7. **Experience** — add/edit/remove timeline entries.
8. **Links** — socials / custom links (LinkedIn, X, email, website).
9. **Accent color** — optional per-user accent override.

### Right pane — live final output
- Renders the **actual `PortfolioRenderer`** (not a mockup) bound to the working
  draft state, so what the user sees **is** the published result.
- **Desktop / Mobile** width toggle; **"Open public page ↗"** opens `/portfolio/[handle]`.
- Because publish is **instant/live** (§7), saving immediately reflects on the
  public URL — the preview and the live page are the same renderer.

### Save & share
- Autosave (debounced) `PATCH /api/portfolio/me`; **"Copy link"** and
  **"Share on LinkedIn"** (prefilled intent URL). A **Private** switch flips
  `isPublished` off if the user wants to hide it.

Profile tab also shows, for **visitors** (non-owners): a read-only "View
Portfolio ↗" button when the user's portfolio is live.

---

## 7. Public Page & LinkedIn Sharing

- `/portfolio/[handle]` server-fetches the `Portfolio` + `User` + featured
  projects, renders via `PortfolioRenderer` with the chosen theme.
- **`generateMetadata`** sets `<title>`, description, and **Open Graph / Twitter**
  tags so LinkedIn/X show a **rich card** (name, headline, avatar/OG image).
- **Dynamic OG image** via `opengraph-image.tsx` (Next built-in `ImageResponse`)
  — renders a branded card with name + headline + accent (no external service).
- **View counter** increments on load (fire-and-forget, deduped lightly).
- **Instant-live model:** a portfolio is **live by default** (`isPublished: true`)
  as soon as it exists — edits in the builder reflect immediately on the public
  URL. A user may flip a **Private** switch to hide it (→ friendly "not public yet"
  + `noindex`); otherwise it's indexable.
- **Heavy-3D on the public page:** if `heavy3d` is true, the three.js background
  loads via `next/dynamic` (`ssr:false`) after first paint; otherwise the
  lightweight effect renders. Either way the page is server-rendered for SEO/OG.

---

## 8. File Organization (everything under `portfolio/` folders)

```
src/
├─ app/
│  └─ portfolio/
│     └─ [handle]/
│        ├─ page.tsx                 # public portfolio (server component)
│        ├─ opengraph-image.tsx      # dynamic OG card
│        └─ not-found.tsx
│
├─ components/
│  └─ portfolio/
│     ├─ PortfolioBuilder.tsx        # the profile-tab builder (client)
│     ├─ PortfolioRenderer.tsx       # renders a portfolio from config+theme
│     ├─ ThemePicker.tsx
│     ├─ HandleField.tsx             # claim/validate handle
│     ├─ themes/
│     │  ├─ registry.ts              # PortfolioTheme[] + lookup
│     │  └─ thumbnails/              # static preview images per theme
│     ├─ backgrounds/                # lazy bg effect components
│     │  ├─ Aurora.tsx
│     │  ├─ Mesh.tsx
│     │  ├─ Constellation.tsx
│     │  ├─ Starfield.tsx
│     │  ├─ Tilt3D.tsx
│     │  ├─ Waves.tsx
│     │  └─ Globe.tsx                # (Tier 2, dynamic three.js)
│     └─ sections/                   # Hero, About, Skills, Projects, etc.
│        ├─ HeroSection.tsx
│        ├─ AboutSection.tsx
│        ├─ SkillsSection.tsx
│        ├─ ProjectsSection.tsx
│        ├─ ContributionsSection.tsx
│        ├─ AchievementsSection.tsx
│        ├─ ExperienceSection.tsx
│        └─ ContactSection.tsx
│
└─ models/
   └─ Portfolio.ts
```
*(Plus `User.ts` gains the `handle` field. The only file outside `portfolio/`
folders is the profile page, which mounts the `<PortfolioBuilder/>` tab.)*

---

## 9. New API Routes

| Method | Route | Who | Purpose |
|---|---|---|---|
| GET | `/api/portfolio/me` | owner | Fetch my portfolio config (creates default, live, if none) |
| PATCH | `/api/portfolio/me` | owner | Autosave builder changes (theme, heavy3d, sections, content) |
| POST | `/api/portfolio/visibility` | owner | Flip live/private (`isPublished`) |
| GET | `/api/portfolio/[handle]` | public | Public fetch (live only) + increment views |
| GET | `/api/portfolio/handle-available?handle=` | auth | Live handle availability + reserved check |
| PATCH | `/api/user/handle` | owner | Claim/change handle |

A portfolio is **live by default**; the public fetch returns it unless the owner
flipped it to **private**. The owner always sees the working draft via
`/api/portfolio/me`.

---

## 10. Profile Page Integration

The profile page (`/profile/[id]`) gains a **tab bar**:
`Overview · Portfolio · (existing sections)`.

- **Owner view** of Portfolio tab → `<PortfolioBuilder/>` (two-pane, §6).
- **Visitor view** of Portfolio tab → if live, a preview embed + "Open full
  portfolio ↗"; if private, "This portfolio is private."
- A prominent **"My Portfolio"** entry can also live in the icon-rail / settings.

---

## 11. Implementation Phases

### Phase 1 — Foundations (½ sprint)
- `Portfolio` model (incl. `isPublished:true`, `heavy3d`) + `User.handle`
  (backfill migration via the existing `/api/admin/migrate` pattern).
- APIs: `/api/portfolio/me` (GET/PATCH), `handle-available`, `/api/user/handle`,
  `/api/portfolio/[handle]`, `/api/portfolio/visibility`.

### Phase 2 — Public page + first theme (1 sprint)
- `/portfolio/[handle]` route (standalone layout, instant-live) + `PortfolioRenderer`.
- Sections: Hero, About, Skills, Projects, Contact.
- **Aurora** theme + `prefers-reduced-motion` fallback.
- `generateMetadata` + dynamic OG image + view counter.

### Phase 3 — Two-pane builder (1 sprint)
- Profile "Portfolio" tab → `<PortfolioBuilder/>`: **left inputs / right live
  output** (§6), theme picker, **3D-heavy-render checkbox**, section
  toggles/reorder, featured-project picker, links, autosave, copy/share, Private switch.

### Phase 4 — Full 8-theme pack + remaining sections (1–1.5 sprints)
- All 8 Tier-1 backgrounds: Aurora, Mesh, Constellation, Starfield, Tilt3D,
  Waves, Minimal, Terminal + thumbnails.
- Each theme's **lightweight** background (default). Sections: Contributions,
  Achievements, Experience, Tech Stack, Stats strip.

### Phase 5 — Heavy-3D variants + polish (½–1 sprint)
- Wire the **3D-heavy-render** toggle to real `three.js` / `@react-three/fiber`
  backgrounds (Globe, Ribbons, 3D upgrades of supporting themes), `next/dynamic`
  + `ssr:false`, tab-hidden pause. *(If three.js dep is deferred, the toggle
  still ships and renders the lightweight effect until variants land.)*
- Custom-domain note, analytics-lite, "feature on showcase" cross-links.

**Estimate:** ~4–4.5 sprints solo (~8–9 weeks); faster given existing components
and data already in place.

---

## 12. Decisions

### ✅ Resolved (2026-06-02)
1. **Builder layout** → **two-pane**: left inputs/controls, right **live
   final-output** (the real renderer).
2. **3D** → **user-toggled "3D heavy render (three.js)"** checkbox, off by default;
   three.js loads only when checked, via `next/dynamic` (`ssr:false`).
3. **Theme count** → **8** at launch (full Tier-1 set).
4. **Visibility** → **instant live publish** (live by default); optional Private switch.
5. **OG images** → Next-native `ImageResponse` (no external service / no new dep).
6. **Project data** → reuse completed/showcase Projects; user hand-picks "featured".
7. **Handle format** → `[a-z0-9-]`, 3–30 chars, unique, reserved list; auto-suggested
   from name. *(URL: `/portfolio/arya-sharma`.)*

### ⏳ Still open (non-blocking)
- **Add `three.js` now vs defer** — the toggle ships either way; deferring means it
  renders the lightweight effect until 3D variants are built. *Recommendation:
  defer the dep to Phase 5; ship Phases 1–4 dependency-free.*
- **Custom domains** (e.g. `arya.dev`) — later, or never? *Recommendation: later.*
- **Résumé / PDF export** — Phase-4 add-on? *Recommendation: nice-to-have, defer.*
- **Achievements section** — depends on `orgsworkflow.md` gamification; build now
  with a graceful "coming soon" fallback. *Recommendation: yes, fallback.*

---

**End of plan.** No code written yet. All feature code will live under
`src/app/portfolio/` and `src/components/portfolio/` as mapped in §8. Say the word
to begin **Phase 1** (Portfolio model + handle + core APIs).
