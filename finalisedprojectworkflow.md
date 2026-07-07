# S.A.N.K.A.L.P. — Finalised Project Workflow & Roadmap

> **Status:** Planning document — no code written yet.
> **Scope:** Full lifecycle from idea → vote → project → completed → showcase/marketplace
> **Date:** 2026-05-27

---

## 1. Current State (What Exists Today)

### 1.1 Data Models (in place)
| Model | Purpose | Key Fields |
|---|---|---|
| `User` | Account + identity | name, role, skills, github, reputation, followers, following |
| `Proposal` | Idea before approval | title, description, type, status, stage, totalVotes, voters, contributors, techStack, endTime |
| `Project` | Approved & active work | proposalId, orgId, title, status (`planning`/`active`/`completed`/`archived`), lead, members, progress, githubRepo, gitRepo, techStack |
| `Task` | Per-project work item | projectId, title, assignedTo, status, progress, priority, deadline |
| `GitRepo` | GitHub integration | repoUrl, syncStatus, stats (commits/stars/forks/PRs), commits[] |
| `Comment`, `CommentVote` | Discussion threads | parentCommentId, content |
| `Activity` / `ActivityLog` | Audit/notification | actorId, type, metadata |
| `Vote` | User vote on proposal | proposalId, userId, value |
| `Org`, `OrgMember` | Organisation scoping | orgId, role |
| `WeeklyReport`, `ProgressUpdate` | Project journaling | projectId, content, weekStart |
| `Contribution` | Per-user contribution tally | userId, points |

### 1.2 Pages (in place)
**App (logged in):**
- `/feed` — proposals only (just fixed)
- `/ideas` — user's own proposals
- `/ideas/create`, `/ideas/[id]`
- `/tasks` — current user's assigned tasks across all projects
- `/projects/[id]` — single-project workspace (overview / tasks / team / activity)
- `/projects/[id]/progress/*` — tasks, team, activity, weekly-review sub-pages
- `/discover` — find contributors
- `/notifications`
- `/profile/[id]`
- `/settings`

**Admin:**
- `/admin/dashboard`, `/admin/users`, `/admin/proposals`, `/admin/projects` (filterable by status)

### 1.3 What's Missing or Half-Built
| Gap | Evidence |
|---|---|
| No **completed projects showcase** for the public/logged-in users | `Project.status="completed"` filter exists in admin but no user-facing list |
| No **deployment URL** field on Project | Schema has `githubRepo` only — no `liveUrl` / `demoUrl` |
| No **business / how-to-use docs** anywhere | No `docs` field, no doc-upload, no rich-text content area |
| No **"For Sale / Licensing"** flag or marketplace surface | No `marketplace` field, no buyer surface |
| No **project completion ceremony** | Marking complete just flips a status — no MVP submission, retrospective, or sign-off flow |
| No **versioning / release tracking** | No way to mark "v1.0 shipped" |
| No **media / screenshots** for completed projects | Proposal has `media[]` but Project does not |
| No **project-level metrics** beyond Git stats | No views, downloads, deployment health |
| Sidebar nav (top bar) has no entry for completed work | Only Feed, Proposals, Tasks, Discover, Notifications |
| `Proposal.stage` has `completed` value but no UI path drives it | Stale enum |

---

## 2. The Finalised Workflow (End-to-End)

```
┌─────────┐    vote    ┌──────────┐  approve  ┌────────┐  ship   ┌───────────┐  promote  ┌──────────┐
│  IDEA   │ ─────────► │ PROPOSAL │ ────────► │ ACTIVE │ ──────► │ COMPLETED │ ────────► │ SHOWCASE │
│ (draft) │            │ (voting) │           │ PROJECT│         │  PROJECT  │           │   /SALE  │
└─────────┘            └──────────┘           └────────┘         └───────────┘           └──────────┘
                                                                       │
                                                                       ▼
                                                              ┌─────────────────┐
                                                              │ Public Portfolio│
                                                              │  + Marketplace  │
                                                              └─────────────────┘
```

### Stage 1 — IDEA (draft)
- User clicks "Share a project idea" → proposal draft saved with `status="draft"`
- Editable by author only, not visible in feed
- **NEW:** allow `attachments[]` (PDF brief, mockups) so reviewers see context

### Stage 2 — PROPOSAL (open voting)
- Author submits → `status="proposal"`, `endTime` set
- Visible in `/feed`, votable by members
- Auto-converts when (a) `totalVotes ≥ threshold` (configurable per type) AND (b) `endTime` passed → status `approved`
- Admin can override (force-approve/reject) from `/admin/proposals`

### Stage 3 — ACTIVE PROJECT
- Approved proposal → `POST /api/projects` creates `Project` with `status="planning"`, `proposalId` link
- Lead invites members, sets up GitHub repo, defines tasks
- `status` walks: `planning` → `active`
- Kanban board, tasks, weekly reports, activity log all already exist
- **NEW:** add `liveUrl`, `stagingUrl`, `documentation` fields to allow surfacing the deploy as work progresses

### Stage 4 — COMPLETED PROJECT (the new ceremony)
**The "Mark Complete" wizard** — a 4-step modal triggered when lead clicks "Complete Project":

1. **Verify deliverables checklist**
   - [ ] All in-progress tasks marked done or moved to backlog (block if not)
   - [ ] GitHub repo synced
   - [ ] At least one weekly report exists
2. **Capture release artefacts** (form)
   - GitHub repo URL (pre-filled if already linked)
   - Live/deployed URL
   - Demo video URL (optional)
   - Cover image upload (1 image, for showcase card)
   - Release version (`v1.0.0`, semver enforced)
   - Release notes (markdown)
3. **Attach documentation** (multi-file or URL refs)
   - **Business doc** — pitch / use cases / target users (markdown or PDF)
   - **How-to-use doc** — user guide (markdown or PDF)
   - **Technical README** — auto-pull from GitHub if available
   - **API docs URL** (optional)
4. **Showcase & licensing**
   - [ ] List in public showcase (default: on)
   - [ ] Available for sale / licensing (default: off)
     - If on → price (₹), licence type (one-time / subscription / open-source), contact email
   - [ ] Permission for case study (default: off)
   - "Mark project complete" → confirm

Result: `Project.status="completed"`, `completedAt` set, all artefacts persisted.

### Stage 5 — SHOWCASE / MARKETPLACE
**Public surface (no login required for browsing):**
- `/showcase` — grid of completed projects with cover image, title, tech stack, team, live demo button
- `/showcase/[id]` — full detail page: hero (cover + live demo CTA), team, tech stack, business doc, how-to-use doc, GitHub link, version history
- `/marketplace` — filter of showcase where `forSale=true` — adds price tag and "Contact for licensing" CTA

**Logged-in extras:**
- New sidebar/top-nav entry: **"Showcase"** (visible to everyone)
- New sidebar entry: **"My Completed"** (visible only if user led or contributed to ≥1 completed project)
- Owners can edit their showcase entry, push new versions, toggle for-sale

---

## 3. New Data Model Changes

### 3.1 Extend `Project` schema
```ts
{
  // ... existing fields
  status: ["planning", "active", "completed", "archived"], // unchanged

  // NEW — release artefacts (set during "mark complete")
  completedAt:      Date,
  completedBy:      ObjectId<User>,         // lead who marked complete
  version:          String,                  // "v1.0.0" semver
  releaseNotes:     String,                  // markdown
  coverImage:       String,                  // URL/path to upload
  liveUrl:          String,                  // production deploy
  stagingUrl:       String,                  // optional
  demoVideoUrl:     String,                  // optional
  apiDocsUrl:       String,                  // optional

  // NEW — documentation (refs to Doc collection, see 3.2)
  docs: [{
    type: ObjectId<ProjectDoc>,
    kind: { type: String, enum: ["business","how-to-use","technical","api","other"] },
  }],

  // NEW — showcase visibility
  showcase: {
    isPublic:      { type: Boolean, default: true },   // listed in /showcase
    caseStudyOptIn:{ type: Boolean, default: false },
    featured:      { type: Boolean, default: false },  // admin can promote
  },

  // NEW — marketplace
  marketplace: {
    forSale:       { type: Boolean, default: false },
    licenseType:   { type: String, enum: ["one-time","subscription","open-source","custom"] },
    priceINR:      Number,
    contactEmail:  String,
    inquiriesCount:{ type: Number, default: 0 },
  },

  // NEW — release history (append on each new version)
  releases: [{
    version:      String,
    notes:        String,
    githubTag:    String,
    releasedAt:   Date,
    releasedBy:   ObjectId<User>,
  }],

  // NEW — analytics
  views:           { type: Number, default: 0 },
  showcaseViews:   { type: Number, default: 0 },
}
```

### 3.2 New collection: `ProjectDoc`
```ts
{
  projectId:   ObjectId<Project>,
  kind:        ["business","how-to-use","technical","api","other"],
  title:       String,
  format:      ["markdown","pdf","external-url"],
  contentMd:   String,           // if markdown
  fileUrl:     String,           // if pdf/uploaded
  externalUrl: String,           // if external link
  uploadedBy:  ObjectId<User>,
  version:     String,           // ties to release
  createdAt:   Date,
}
```

### 3.3 New collection: `MarketplaceInquiry`
```ts
{
  projectId:   ObjectId<Project>,
  buyerName:   String,
  buyerEmail:  String,
  buyerOrg:    String,
  message:     String,
  status:      ["new","responded","closed"],
  createdAt:   Date,
}
```

---

## 4. New Pages & UI Surfaces

### 4.1 Public showcase
| Route | Description |
|---|---|
| `/showcase` | Grid of completed public projects. Filters: tech stack, type, team-size, "for-sale only". Sort: newest, most-viewed, featured. |
| `/showcase/[id]` | Full project detail (read-only for non-owners). Sections: hero, team, business doc, how-to-use, tech stack, GitHub stats, releases, related projects. |
| `/marketplace` | Subset of showcase where `forSale=true`. Adds price chip + "Inquire" button. |
| `/marketplace/[id]` | Marketplace listing with full doc + "Contact for licensing" form (posts to `MarketplaceInquiry`). |

### 4.2 Owner / contributor surfaces
| Route | Description |
|---|---|
| `/projects/[id]/complete` | Multi-step "Mark Complete" wizard (described in Stage 4). |
| `/projects/[id]/showcase` | Owner-only editor for the showcase page (cover image, docs, marketplace toggle, releases). |
| `/projects/[id]/releases/new` | Push a new version (post-completion). |
| `/my-completed` | Personal list of completed projects the user led or contributed to (replaces "Tasks" entry... no — adds alongside). |

### 4.3 Admin surfaces
| Route | Description |
|---|---|
| `/admin/showcase` | All completed projects, ability to feature/unfeature, audit case-study opt-ins. |
| `/admin/marketplace/inquiries` | All buyer inquiries, status tracking. |

---

## 5. Navigation Changes

### 5.1 TopNav (already has 5 items)
Current: `Feed | Proposals | Tasks | Discover | Notifications`
**Add:** **Showcase** as the 4th item, demote Discover to 5th (or merge: "Discover" tab can house both contributors and showcase as sub-tabs).

Final TopNav (6 items, OK on lg+ screens):
```
[Feed] [Proposals] [Tasks] [Showcase] [Discover] [Notifications]
```
On md screens: collapse labels, icons only. On xs: hamburger.

### 5.2 Slim icon rail (left)
Current: avatar / settings / admin / theme / sign-out
**Add:** "My Completed" pill icon — visible only if user has ≥1 completed project. Tooltip: "My completed projects".

### 5.3 Right panel (signals)
Add a "Featured Showcase" card that shows the top 3 featured completed projects. Rotates daily.

---

## 6. API Routes to Add

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/projects/[id]/complete` | Run the completion wizard transactionally (validates checklist, creates docs, sets status) |
| `GET`  | `/api/projects/[id]/docs` | List all docs for a project |
| `POST` | `/api/projects/[id]/docs` | Upload/create a new doc |
| `PATCH`| `/api/projects/[id]/docs/[docId]` | Update doc |
| `DELETE`| `/api/projects/[id]/docs/[docId]` | Remove doc |
| `POST` | `/api/projects/[id]/releases` | Push new release/version |
| `GET`  | `/api/showcase` | Public list of completed projects (with filters) |
| `GET`  | `/api/showcase/[id]` | Single showcase entry (increments `showcaseViews`) |
| `PATCH`| `/api/projects/[id]/showcase` | Owner edits showcase settings |
| `GET`  | `/api/marketplace` | Public list of for-sale projects |
| `POST` | `/api/marketplace/[id]/inquire` | Buyer submits inquiry |
| `GET`  | `/api/marketplace/inquiries` | Owner views inquiries for own projects |
| `GET`  | `/api/admin/showcase` | Admin list with feature toggle |
| `PATCH`| `/api/admin/showcase/[id]` | Admin toggles `featured` |

All mobile equivalents under `/api/mobile/...` mirror these.

---

## 7. UI Components to Add

| Component | Used in |
|---|---|
| `<MarkCompleteWizard />` | `/projects/[id]/page.tsx` (modal) |
| `<ShowcaseCard />` | `/showcase`, `/my-completed`, right panel "Featured" |
| `<ProjectShowcaseHero />` | `/showcase/[id]` |
| `<DocViewer />` | Renders markdown / embeds PDF / external-url |
| `<ReleaseHistoryList />` | Timeline of releases on showcase detail |
| `<MarketplacePriceBadge />` | Showcase card overlay when `forSale=true` |
| `<InquiryForm />` | `/marketplace/[id]` |
| `<DocUploadDialog />` | `/projects/[id]/showcase` |
| `<TechStackChips />` | reusable across showcase & detail (pastel pills) |
| `<ContributorAvatarStack />` | extracted reusable (already inline in some pages) |

---

## 8. Permissions Matrix

| Action | Visitor | User | Member | Lead | Admin |
|---|---|---|---|---|---|
| Browse `/showcase` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse `/marketplace` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit `MarketplaceInquiry` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark project complete | ❌ | ❌ | ❌ | ✅ (own project) | ✅ |
| Edit showcase settings | ❌ | ❌ | ❌ | ✅ (own project) | ✅ |
| Push new release | ❌ | ❌ | ❌ | ✅ (own project) | ✅ |
| Toggle `featured` | ❌ | ❌ | ❌ | ❌ | ✅ |
| View inquiries | ❌ | ❌ | ❌ | ✅ (own project) | ✅ |

---

## 9. File-Upload Strategy

Decision needed: today there's no upload pipeline configured.
- **Option A** — Cloud (Cloudinary / S3): used for cover images, doc PDFs, demo videos. Best for scale.
- **Option B** — External URLs only: users paste links (Google Drive, Notion, Loom). Zero infra cost. Acceptable for v1.
- **Option C** — Hybrid: cover image via Cloudinary (small), docs as external links (cheap & simple).

**Recommendation:** start with **Option C** — Cloudinary for one cover image per project (< 500 KB JPEG/PNG), everything else as external URLs (Notion, Google Doc, GitHub README, Loom video). Defer S3/PDF hosting until volume justifies it.

---

## 10. Implementation Phases (suggested order)

### Phase 1 — Foundations (1 sprint)
- Schema migrations: add new fields to `Project`, create `ProjectDoc`, `MarketplaceInquiry` collections
- API: `POST /api/projects/[id]/complete`, `GET /api/showcase`, `GET /api/showcase/[id]`
- Build `<MarkCompleteWizard />` and wire it into `/projects/[id]/page.tsx`
- Lead can now mark project complete with cover image + 2 doc URLs

### Phase 2 — Public showcase (1 sprint)
- Build `/showcase` grid and `/showcase/[id]` detail pages
- Add "Showcase" entry to TopNav
- Build `<ShowcaseCard />`, `<ProjectShowcaseHero />`, `<DocViewer />`
- Increment `showcaseViews` on detail page load
- Featured rotation in right panel

### Phase 3 — Owner controls (½ sprint)
- `/projects/[id]/showcase` — owner edits cover, docs, toggles
- `/projects/[id]/releases/new` — push v1.1 etc., release history shows on showcase page
- "My Completed" sidebar icon-rail entry

### Phase 4 — Marketplace (1 sprint)
- `/marketplace` and `/marketplace/[id]`
- `<InquiryForm />`, `MarketplaceInquiry` collection
- Owner: `/projects/[id]/showcase` adds "Inquiries" tab
- Admin: `/admin/marketplace/inquiries`

### Phase 5 — Polish & analytics (½ sprint)
- View counters, "trending in showcase" carousel, related projects on detail page
- Featured-project promotion flow for admins
- Mobile API parity

**Total estimated effort:** ~4 sprints (8 weeks) for a single developer; ~3 weeks with 2 developers.

---

## 11. Open Questions / Decisions Needed

1. **Cover image upload** — do we wire Cloudinary now or accept URL-only for v1?
2. **Currency / payments** — marketplace listings show price but do we process payments in-platform or "Inquire only"?
   - **Recommendation:** v1 = inquiry only. Payments handled off-platform.
3. **Versioning** — should new releases create *new* project entries, or just extend the existing project's `releases[]`?
   - **Recommendation:** extend existing — keeps showcase URL stable.
4. **Archiving** — what's the difference between "completed" and "archived"? Suggest:
   - **completed** = shipped, visible in showcase
   - **archived** = abandoned / sunset, hidden from showcase (admin-only flip)
5. **Featured rotation** — admin manual pick, or algorithmic (views + recency)?
   - **Recommendation:** admin pick + algorithmic fallback.
6. **Showcase moderation** — should every completed project be auto-published, or admin-approved?
   - **Recommendation:** auto-published, admin can hide post-hoc. Add a "Report" button.

---

## 12. Quick-Reference: What Each Existing Surface Becomes

| Today | Tomorrow |
|---|---|
| `/feed` (proposals only — just fixed) | unchanged |
| `/ideas` (my proposals) | unchanged |
| `/tasks` (my tasks across projects) | unchanged |
| `/projects/[id]` (active workspace) | + "Mark Complete" button when status=`active` and lead==me |
| `/admin/projects` | + completion stats, ability to feature |
| TopNav `Discover` | unchanged or merged with `Showcase` |
| (none) | NEW `/showcase`, `/showcase/[id]` |
| (none) | NEW `/marketplace`, `/marketplace/[id]` |
| (none) | NEW `/my-completed`, `/projects/[id]/complete`, `/projects/[id]/showcase` |

---

## Appendix A — Sample Showcase Card

```
┌───────────────────────────────────────────┐
│ [Cover image — 16:9, full bleed]          │
│                                            │
│ [Live Demo]   [GitHub]              [⭐ 24]│
├───────────────────────────────────────────┤
│ Syncro Node                          v1.0  │
│ Distributed task coordination engine       │
│                                            │
│ [Next.js] [MongoDB] [TypeScript]           │
│                                            │
│ 👤👤👤  Arya Sharma + 3 contributors       │
│                                            │
│ Completed 12 May 2026         💰 ₹15,000  │
└───────────────────────────────────────────┘
```

## Appendix B — Sample Mark-Complete Wizard Flow

```
Step 1/4  ✓ Deliverables checklist
  ☑ 12/14 tasks marked done · 2 backlogged (auto-archived)
  ☑ GitHub repo synced — last commit 3h ago
  ☑ 3 weekly reports filed

Step 2/4  Release artefacts
  Version:        [ v1.0.0          ]
  GitHub URL:     [ pre-filled       ]
  Live URL:       [ https://...      ]
  Demo video:     [ optional Loom    ]
  Cover image:    [ Upload (1.2 MB)  ]
  Release notes:  ┌──────────────────┐
                  │ First public ship │
                  │ # Highlights ...  │
                  └──────────────────┘

Step 3/4  Documentation
  Business doc:    [○ Markdown ◉ External URL] [https://notion.so/...]
  How-to-use doc:  [○ Markdown ◉ External URL] [https://docs.org/...]
  Technical README: ☑ Pull from GitHub README
  API docs URL:    [ optional ]

Step 4/4  Showcase & Licensing
  ☑ List in public showcase
  ☐ Available for sale / licensing
       (when ticked, show price + license type + contact)
  ☐ Permission for case study

         [ Back ]              [ Mark Complete ]
```

---

**End of plan.** No code has been written yet. Awaiting confirmation before implementation.
