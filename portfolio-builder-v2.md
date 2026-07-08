# Portfolio Builder v2 — Redesign Plan

> **Status:** Plan only (no code yet, per request). Builds on the existing
> portfolio feature.
> **Date:** 2026-06-02

> ### ✅ Locked decisions (2026-06-02)
> 1. **Tabbed Pane 1** — Theme · Background · Sections · Data · Publish (theming + background separated from sections).
> 2. **Manual projects** — Projects section supports free-form project cards (not just DB projects).
> 3. **JSON — both ways**: client-side import/export **and** a dedicated `POST /api/portfolio/import` endpoint; plus "Auto-fill from profile".
> 4. **Section types to add**: Certifications, Links, Affiliated Orgs, Timeline, Testimonials (on top of hero/about/skills/projects/experience/education/custom/gallery/stats/quote/contact).
> 5. **Skills** — optional **proficiency bars** (level per skill) in addition to logo chips.
> 6. **Starter templates** — one-click section packs (Developer / Student / Designer / Minimal).

---

## 1. Analysis — what's actually wrong today

| Symptom (your words) | Root cause |
|---|---|
| "no section data is being added / nothing is addable" | Persistence risk: sections save via `findOneAndUpdate({$set:{sections}})` where each section's `content` is `Schema.Types.Mixed`. Mongoose can drop/不-cast Mixed inside an array of typed subdocs on `$set`. **Fix:** load-modify-save with `markModified('sections')`, or store sections as a single Mixed array. |
| "can't add project section" | The Projects section only shows DB projects, and you have **no completed projects yet** → it renders empty, so it *looks* like adding failed. There's also no way to add a project **manually** (title/desc/link) without it existing in the DB. |
| "there aren't sections in detail" | A section only renders on the public page when it has content **or** matching profile data. Empty new sections silently render nothing → looks like they vanished. Needs an editor-only "empty section" placeholder + clearer feedback. |
| "can't add all at once" | Sections are added one-by-one from a menu. No bulk-add, no starter templates. |
| "theming not separated from sections" | Pane 1 is one long scroll mixing Theme, Background, 3D, Customize, Animation, Cards, Tokens, Sections. Overwhelming + no separation. |
| "design is pathetic" | Flat list of cards, no grouping/tabs, weak hierarchy. |
| "a JSON to easy auto pick and add info" | No import/export. Want a JSON shape you can paste/upload to auto-fill the whole portfolio. |

---

## 2. New Pane-1 structure — tabs (separates theming from sections)

Pane 1 becomes a **tabbed panel** (top-level tabs), pane 2 stays the live preview:

```
┌── PANE 1 (tabbed) ─────────────┐   ┌── PANE 2 ───────────────┐
│ [ Theme ][ Background ][ Sections ][ Data ][ Publish ]        │
│                                │   │                          │
│  …tab content…                 │   │   live preview (real)    │
└────────────────────────────────┘   └──────────────────────────┘
```

### Tab 1 — **Theme**
- Theme preset grid (categorized, 42 themes)
- Card style, accent + accent-2 colors, fonts
- Section + project-card **animation** pickers

### Tab 2 — **Background**  *(separated as requested)*
- 2D background effect (22 options) with mini live thumbnails
- 3D scene (10 options) + **3D heavy-render** toggle
- Background intensity / opacity

### Tab 3 — **Sections**  *(the core fix)*
- The section manager (add / edit / reorder / hide / delete)
- **Add-all / templates** (see §4)
- Each section expands into its own editor (see §3)

### Tab 4 — **Data (JSON)**  *(new)*
- **Import JSON** (paste or upload) → auto-fills everything
- **Export JSON** (download current portfolio)
- **Auto-fill from profile** button (pulls name/skills/projects/github)

### Tab 5 — **Publish**
- Handle, visibility, public link, copy / share / view-live, stats

---

## 3. Make sections truly addable + editable (depth)

### 3.1 Persistence fix (the real bug)
- Switch the sections write to **load → modify → `markModified('sections')` → save**, or change `Portfolio.sections` to a single `Schema.Types.Mixed` array. Guarantees Mixed `content` round-trips.
- Builder keeps **optimistic update** (UI updates instantly) + autosave; add a tiny "saved ✓ / saving…" per-section indicator.

### 3.2 Every section editable, with depth
Full catalog (✚ = new in v2). Each has its own inline editor; content shapes:

| Type | Content shape |
|---|---|
| **hero** | `{ headline, tagline, avatarOverride?, ctas?: [{label,url}] }` |
| **about** | `{ body }` (markdown-lite + tokens) |
| **skills** | `{ items: (string \| { name, level? })[] }` — logo chips + optional **proficiency bars** ✚ |
| **projects** | `{ ids: string[], manual: [{ title, description, image, live, repo, tags[] }] }` ✚ manual |
| **experience** | `{ items: [{ role, org, start, end, summary }] }` |
| **education** | `{ items: [{ school, degree, start, end }] }` |
| **certifications** ✚ | `{ items: [{ name, issuer, date, url, image }] }` |
| **links** ✚ | `{ items: [{ label, url, icon }] }` (standalone, distinct from Contact) |
| **affiliated_orgs** ✚ | `{ items: [{ name, role, period, url, logo }] }` |
| **timeline** ✚ | `{ items: [{ date, title, description }] }` |
| **testimonials** ✚ | `{ items: [{ quote, person, role, avatar }] }` |
| **gallery** | `{ items: [{ url, caption }], layout?: "grid"\|"masonry" }` |
| **stats** | `{ items: [{ label, value }] }` (value supports tokens) |
| **quote** | `{ text, author }` |
| **custom** | `{ body, image? }` |
| **contact** | `{ links: [{ label, url, icon }] }` |

That's **16 section types**. Editors: chips for skills (with level slider toggle),
repeating-row editors for the list types, logo/url fields for orgs & certs.

### 3.3 Empty-state clarity
- In the editor, an enabled-but-empty section shows a dashed "Add content" placeholder (so it's obviously addable, never silently blank).
- Preview shows a subtle "empty section — add content" hint **only in builder preview** (never on the public page).

---

## 4. "Add all at once" + starter templates

- **Multi-add:** the Add menu becomes a checklist — tick several types, "Add selected".
- **Starter packs** (one click adds a curated set, pre-ordered):
  - *Developer* → hero, about, skills, projects, experience, contact
  - *Student* → hero, about, education, skills, projects, contact
  - *Designer* → hero, about, gallery, projects, testimonials, contact
  - *Minimal* → hero, about, contact
- **"Reset to template"** keeps your data where possible.

---

## 5. JSON schema (auto-pick & add info)

A single portable shape. **Import** fills the builder; **Export** downloads it.

```jsonc
{
  "version": 1,
  "theme":  { "id": "aurora", "accent": "#7c5cff", "accent2": "#22d3ee",
              "card": "glass", "sectionAnim": "rise",
              "projectCardStyle": "tilt3d", "projectCardAnim": "rise" },
  "background": { "effect": "constellation", "scene": "particles", "heavy3d": false },
  "meta": { "handle": "arya", "isPublished": true,
            "seo": { "title": "", "description": "" } },
  "sections": [
    { "type": "hero",   "title": "Hero",
      "content": { "headline": "I build {{skills}}", "tagline": "Full-stack" } },
    { "type": "about",  "title": "About",
      "content": { "body": "..." } },
    { "type": "skills", "title": "Skills",
      "content": { "items": ["React", "TypeScript", "Kubernetes"] } },
    { "type": "projects", "title": "Featured",
      "content": { "ids": [], "manual": [
        { "title": "Syncro", "description": "...", "image": "https://...",
          "live": "https://...", "repo": "https://...", "tags": ["Next.js"] }
      ] } },
    { "type": "experience", "title": "Experience",
      "content": { "items": [ { "role": "...", "org": "...",
        "start": "2024", "end": "Present", "summary": "..." } ] } },
    { "type": "certifications", "title": "Certifications",
      "content": { "items": [ { "name": "AWS SA", "issuer": "Amazon",
        "date": "2025", "url": "https://...", "image": "https://..." } ] } },
    { "type": "affiliated_orgs", "title": "Organizations",
      "content": { "items": [ { "name": "S.A.N.K.A.L.P", "role": "Member",
        "period": "2024–", "url": "https://...", "logo": "https://..." } ] } },
    { "type": "links", "title": "Links",
      "content": { "items": [ { "icon": "globe", "label": "Website", "url": "..." } ] } },
    { "type": "timeline", "title": "Journey",
      "content": { "items": [ { "date": "2025", "title": "Shipped X", "description": "..." } ] } },
    { "type": "testimonials", "title": "Testimonials",
      "content": { "items": [ { "quote": "...", "person": "...", "role": "...", "avatar": "https://..." } ] } },
    { "type": "contact", "title": "Contact",
      "content": { "links": [ { "icon": "github", "label": "GitHub", "url": "..." } ] } }
  ]
}
```

### JSON handling — **both ways** (locked)
- **Client-side import/export** in the Data tab: paste/upload → maps to builder
  state → autosaves; "Export" downloads `portfolio-<handle>.json`.
- **Server endpoint** `POST /api/portfolio/import` — validates `version` + shape,
  sanitizes, regenerates section ids, writes to the Portfolio doc (so imports can
  also be done programmatically / from the API).
- **Auto-fill from profile:** builds this JSON from the user's DB (name, skills,
  github, completed projects, affiliated orgs) and merges it — a new user gets a
  fully populated portfolio in one click.

---

## 6. Design polish (the "depth")

- Tabbed pane-1 (above) + within Sections, **collapsible accordion** rows with drag handle, type icon, enable toggle, and inline edit.
- Sticky tab bar; section count badges; "unsaved/saved" chip.
- Consistent spacing, larger touch targets, clear section dividers.
- Mobile: tabs collapse to a select; preview moves below.

---

## 7. New / changed APIs & model

| Change | Detail |
|---|---|
| `Portfolio.sections` | keep shape but **persist Mixed reliably** (markModified or Mixed array) |
| `projects` section content | add `manual: [{title,description,image,live,repo,tags}]` |
| New section types | `certifications`, `links`, `affiliated_orgs`, `timeline`, `testimonials` |
| `skills` content | items may be `string` or `{ name, level }` (proficiency bars) |
| `POST /api/portfolio/import` | validate + sanitize + apply JSON server-side |
| client import/export | Data tab: upload/paste + download |
| `GET /api/portfolio/me` | already returns everything; add `?autofill=1` to seed from profile |

No breaking changes to the public page or the three.js code-split.

---

## 8. Build phases

1. **Fix persistence** (Mixed save) + **projects manual entries** + empty-state clarity. *(unblocks "nothing saves / can't add projects")*
2. **Tabbed pane-1** (Theme / Background / Sections / Data / Publish) — separates theming from sections.
3. **Bulk-add + starter templates**.
4. **JSON import/export + auto-fill from profile**.
5. **Polish** (accordions, drag handle, badges, mobile).

Each phase ends with `tsc` + production build + three.js-isolation check, then commit/push.

---

## 9. Decisions — ✅ resolved

1. JSON — **both** client-side + `POST /api/portfolio/import` + auto-fill.
2. Manual projects — **yes**.
3. Extra sections — **certifications, links, affiliated_orgs, timeline, testimonials**.
4. Skills — **proficiency bars** (optional level per skill) + logo chips.
5. Starter templates — **yes**.

### Still open (minor, non-blocking)
- Gallery masonry vs grid default? *(Recommend: grid.)*
- Proficiency bar style — numeric % vs dots? *(Recommend: thin bar.)*

---

**End of plan.** All major decisions locked. On your "build" I'll execute in order:
**Phase 1** fix saving (Mixed persistence) + manual projects + empty-state clarity →
**Phase 2** tabbed Pane 1 (Theme / Background / Sections / Data / Publish) →
**Phase 3** new section types + proficiency bars →
**Phase 4** JSON import/export (both ways) + auto-fill + starter templates →
**Phase 5** polish (accordions, drag, mobile). Each phase: tsc + build + push.
