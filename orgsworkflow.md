# S.A.N.K.A.L.P. — Multi-Org Platform & Gamified Open-Source Workflow

> **Status:** Design document — planning only, no code written yet.
> **Type:** Major upgrade (v2 architecture)
> **Date:** 2026-06-02
> **Builds on:** `finalisedprojectworkflow.md` (completion/showcase/marketplace)

> ### ✅ Locked decisions (2026-06-02)
> 1. **XP scope:** both **global** (`totalXP`) **and per-org** (`xpInOrg`) — one `XpEvent` log carries `orgId` so both derive from it.
> 2. **`platform_moderator` tier:** built **from the start** (Phase 1), so org-request review can be delegated immediately.
> 3. **Org URL scheme:** **`/orgs/[slug]`** (e.g. `/orgs/acme-ai`). The directory lives at `/orgs` and the wizard at `/orgs/launch` — so `launch`, `status`, `admin` and a small reserved list are **disallowed org slugs** (see §6.1).

---

## 1. Vision

Turn S.A.N.K.A.L.P. from a **single-tenant** project platform into a **multi-org,
gamified, open-source collaboration network** — think *"GitHub meets a guild
system"*.

Three pillars:

1. **Multi-org** — anyone can propose to launch an organisation; the platform
   admin approves it. Each org runs its own proposals → projects → showcase
   pipeline (the existing workflow, scoped per-org).
2. **Two-tier governance** — a **platform tier** (runs the whole network) and an
   **org tier** (runs one organisation). S.A.N.K.A.L.P. itself is the **host org**
   — the first, permanent, system-owned organisation.
3. **Gamified & open-source** — contributions to open-source projects earn XP,
   levels, badges, and leaderboard rank. Git activity (commits, PRs, merged
   contributions) feeds the gamification engine.

```
                          ┌──────────────────────────────────┐
                          │      PLATFORM (the network)        │
                          │   owned/run by Platform Admins     │
                          └──────────────────────────────────┘
                                         │ approves
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
     ┌─────────────────┐       ┌─────────────────┐        ┌─────────────────┐
     │  S.A.N.K.A.L.P   │       │   Org: Acme AI  │        │  Org: GreenTech │
     │  (HOST ORG)      │       │  (community)    │        │  (community)    │
     │  system-owned    │       │  org admin: Ria │        │  org admin: Sam │
     └─────────────────┘       └─────────────────┘        └─────────────────┘
        │ proposals                  │ proposals                 │ proposals
        ▼                            ▼                           ▼
     projects → showcase          projects → showcase         projects → showcase
        │                            │                           │
        └──────────────── Gamification engine (XP / levels / badges) ───────────┘
```

---

## 2. Current State (what exists today)

### 2.1 Models
| Model | Relevant fields | Notes |
|---|---|---|
| `User` | `role` (user/sankalp_member/sankalp_associate/master_admin), `reputation`, `followers`, `following`, `github`, `skills` | **single global role** — no per-org role |
| `Org` | `name`, `slug`, `createdBy`, `admins[]`, `members[]`, `rules{}`, `visibility`, `avatar`, `banner` | no status/approval field |
| `OrgMember` | `userId`, `orgId`, `role` (member/lead/admin), unique(userId,orgId) | per-org role exists but unused by UI |
| `Project` | scoped by `orgId`, completion/showcase/marketplace (from v1.5) | already org-scoped |
| `Proposal` | `orgId` (optional), voting | org scoping optional |
| `Contribution` | `projectId`, `userId`, `type`, `status`, `verifiedBy` | basis for gamification |
| `GitRepo` | commits, stars, PRs, contributorsCount | basis for git gamification |

### 2.2 Key gaps
| Gap | Impact |
|---|---|
| **Orgs are created instantly** (`POST /api/orgs` → live immediately) | No platform-admin approval; anyone spins up an org |
| **No org lifecycle status** | Can't model proposed → approved → suspended → archived |
| **Single-dimension roles** | A user is globally `master_admin` OR nothing; can't be "admin of Org A, member of Org B" cleanly via `User.role` |
| **No host-org concept** | S.A.N.K.A.L.P. isn't a distinguished system org |
| **No gamification layer** | `reputation` is a lone number; no XP/levels/badges/quests |
| **No open-source semantics** | No license field, "good first issue", contribution bounties, fork/star tracking surfaced |
| **No org-scoped admin panel** | `/admin/*` is platform-wide only; org admins have no console |
| **Git activity not rewarded** | `GitRepo` stats exist but don't feed points |

---

## 3. Extended Role Model

Roles become **two-dimensional**: a **platform role** (network-wide) + **org roles**
(per organisation, already in `OrgMember`).

### 3.1 Platform roles (`User.role`)
| Role | Power |
|---|---|
| `user` | Browse, vote, comment, join orgs, contribute |
| `sankalp_member` | Member of the host org; create proposals in host org |
| `sankalp_associate` | Host-org manager (existing admin-panel access, host org only) |
| **`platform_moderator`** *(new)* | Review org launch requests, moderate content/reports across all orgs — but cannot change platform config |
| `master_admin` | **Platform Admin** — full control: approve/suspend orgs, manage all users, platform config, gamification tuning |

### 3.2 Org roles (`OrgMember.role`) — extend existing enum
| Role | Power within that org |
|---|---|
| `member` | Participate: vote, comment, join projects, contribute |
| `contributor` *(new)* | Verified contributor — can self-assign "good first issues", submit PRs |
| `lead` | Lead projects, assign tasks, verify contributions, mark complete |
| `admin` | **Org Admin** — manage org settings, members, approve project conversions, org-level showcase |
| `owner` *(new)* | The founding org admin (the person who proposed it). Can transfer ownership, delete org (with platform-admin sign-off) |

### 3.3 Effective-permission resolution
```
canManageOrg(user, org) =
     user.role === "master_admin"               // platform admin overrides
  || orgMember(user, org).role in [owner, admin]

canApproveOrgLaunch(user) =
     user.role in [master_admin, platform_moderator]

canTunePlatform(user) =
     user.role === "master_admin"
```

---

## 4. Org Lifecycle Workflow

```
   propose            review            approve            run             govern
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐    ┌───────────┐
│ REQUESTED │ ──► │ IN_REVIEW │ ──► │ APPROVED  │ ──► │  ACTIVE   │ ─► │ SUSPENDED │
│ (draft)   │     │(platform) │     │           │     │           │    │ / ARCHIVED│
└───────────┘     └───────────┘     └───────────┘     └───────────┘    └───────────┘
      │                 │                                   │
      │                 └──► REJECTED (with reason)         └──► founder onboards
      └──► applicant edits & resubmits                            members, creates
                                                                  first proposals
```

### Stage 1 — REQUESTED (org launch proposal)
A logged-in user submits an **Org Launch Request**:
- Org name, slug (availability-checked), mission/description
- Category (community / academic / company / open-source collective)
- Why it should exist + initial roadmap
- Expected first projects / focus areas
- Open-source charter (default: projects open-source unless flagged)
- Optional: logo, banner (external URL until uploads enabled)

Result: `Org` document with `status: "requested"`, founder recorded.

### Stage 2 — IN_REVIEW (platform admin queue)
- Lands in **Platform Admin → Org Requests** queue.
- Platform admin / moderator reviews: legitimacy, name conflicts, charter fit.
- Actions: **Approve**, **Reject (reason)**, **Request changes**.

### Stage 3 — APPROVED → ACTIVE
- On approve: `status: "active"`, founder becomes `OrgMember.role = "owner"`,
  org gets its slug namespace `/o/[slug]`.
- Welcome/onboarding checklist for the founder.

### Stage 4 — ACTIVE (running)
- Org runs the full existing pipeline **scoped to `orgId`**:
  proposals → vote → projects → tasks → completion → org showcase.
- Org admin console manages members, roles, settings, branding.

### Stage 5 — GOVERNANCE (suspend / archive / transfer)
- Platform admin can **suspend** (policy violation) or **archive** (inactive).
- Owner can **transfer ownership** or request deletion (platform sign-off).

### The HOST ORG (S.A.N.K.A.L.P.)
- Seeded once as `isHost: true`, `status: "active"`, system-owned.
- Cannot be suspended/deleted. Platform admins are its owners by default.
- New users auto-join the host org as `member` on registration (configurable).

---

## 5. Gamification & Open-Source Engine

### 5.1 Core loop
```
do work  →  earn XP  →  level up  →  unlock badges/roles  →  climb leaderboards
(contributions, commits, merged PRs, completed tasks, approved proposals)
```

### 5.2 XP sources (configurable weights — platform-admin tunable)
| Action | XP | Notes |
|---|---|---|
| Proposal approved | +50 | |
| Project completed (as lead) | +200 | |
| Task completed | +20 | scaled by priority |
| Contribution approved (`Contribution.status=approved`) | +30 | by type: code > design > docs |
| Merged PR (from `GitRepo` sync) | +40 | open-source signal |
| Commit (capped/day) | +2 | anti-farming cap |
| "Good first issue" resolved | +25 | onboarding incentive |
| Received upvote on proposal | +2 | |
| Peer endorsement of skill | +5 | |

### 5.3 Levels
- `level = floor(sqrt(totalXP / 100))` (smooth curve) → titles:
  Novice → Builder → Contributor → Maintainer → Architect → Luminary.

### 5.4 Badges (examples)
| Badge | Trigger |
|---|---|
| First Blood | first approved contribution |
| Ship It | first project completed |
| Open Sourcerer | 10 merged PRs on open-source projects |
| Mentor | verified 25 contributions by others |
| Polyglot | contributions in 5+ tech stacks |
| Founder | launched an approved org |
| Streak (7/30/100) | consecutive active days |

### 5.5 Open-source semantics
- `Project.license` (MIT/Apache-2.0/GPL/…); open-source projects earn **bonus XP**.
- **"Good first issue"** flag on tasks → surfaced to newcomers, extra XP.
- **Bounties** (optional): org admin attaches XP/credit to a task.
- **Fork & star** counts (from `GitRepo`) shown on showcase; stars → small XP to maintainers.

### 5.6 Leaderboards
- **Global**, **per-org**, **per-skill**, **weekly/all-time**.
- Already have `/api/builders/rankings` — extend to read `gamification.totalXP`.

---

## 6. New / Extended Data Models

### 6.1 `Org` — extend
```ts
{
  // ...existing
  status:    { type: String, enum: ["requested","in_review","approved","active","suspended","archived","rejected"], default: "requested" },
  isHost:    { type: Boolean, default: false },     // S.A.N.K.A.L.P only
  category:  { type: String, enum: ["community","academic","company","open_source"], default: "community" },
  charter:   { type: String, default: "" },          // mission / why
  roadmap:   { type: String, default: "" },
  defaultOpenSource: { type: Boolean, default: true },
  review: {
    reviewedBy:  ObjectId<User>,
    reviewedAt:  Date,
    decision:    { type: String, enum: ["approved","rejected","changes_requested"] },
    reason:      String,
  },
  ownerId:   ObjectId<User>,                          // founding org admin
  stats: { memberCount: Number, projectCount: Number, totalXP: Number },
}
```

**Reserved slugs** (cannot be used as an org slug, because they collide with
static routes under `/orgs/*`):
`launch`, `status`, `admin`, `new`, `settings`, `api`, `o`.
Enforced by `GET /api/orgs/slug-available` and at request submission.
Next.js resolves static segments (`/orgs/launch`) before the dynamic
`/orgs/[slug]`, but the slug must still be reserved so no org can claim it.

### 6.2 `OrgMember` — extend enum
```ts
role: { enum: ["member","contributor","lead","admin","owner"], default: "member" }
xpInOrg: { type: Number, default: 0 }   // org-scoped XP
```

### 6.3 `User` — extend
```ts
role: { enum: ["user","sankalp_member","sankalp_associate","platform_moderator","master_admin"] },
gamification: {
  totalXP:    { type: Number, default: 0 },
  level:      { type: Number, default: 0 },
  badges:     [{ key: String, earnedAt: Date }],
  streak:     { current: Number, longest: Number, lastActiveAt: Date },
}
```

### 6.4 NEW `XpEvent` (audit/event-sourced points)
```ts
{
  userId:   ObjectId<User>,
  orgId:    ObjectId<Org>,        // nullable for platform-level
  source:   String,               // "proposal_approved" | "pr_merged" | ...
  refId:    ObjectId,             // project/task/contribution/proposal id
  amount:   Number,
  createdAt: Date,
}
```
*Event-sourced so totals are recomputable and farming is auditable.*

### 6.5 NEW `Badge` (catalogue) + earned via `User.gamification.badges`
```ts
{ key, name, description, icon, criteria, tier }
```

### 6.6 `Project` / `Task` — extend
```ts
Project.license:     { type: String, default: "" }
Project.isOpenSource:{ type: Boolean, default: true }
Task.goodFirstIssue: { type: Boolean, default: false }
Task.bountyXP:       { type: Number, default: 0 }
```

### 6.7 NEW `Report` (moderation)
```ts
{ reporterId, targetType: "org"|"project"|"proposal"|"user"|"comment", targetId, reason, status, handledBy }
```

---

## 7. New API Routes

### Org lifecycle
| Method | Route | Purpose | Who |
|---|---|---|---|
| POST | `/api/orgs/request` | Submit org launch request (status=requested) | any user |
| GET | `/api/orgs/slug-available?slug=` | Slug availability check | any user |
| GET | `/api/admin/org-requests` | Queue of requested/in_review orgs | platform mod/admin |
| PATCH | `/api/admin/org-requests/[id]` | approve / reject / request changes | platform mod/admin |
| PATCH | `/api/admin/orgs/[id]/status` | suspend / archive / reactivate | platform admin |
| GET | `/api/orgs/[slug]` | Public org profile | any |
| PATCH | `/api/orgs/[id]` | Edit org settings | org admin/owner |
| POST | `/api/orgs/[id]/transfer` | Transfer ownership | owner (+platform sign-off) |

### Org membership & roles
| Method | Route | Purpose | Who |
|---|---|---|---|
| POST | `/api/orgs/[id]/join` | Join (or request to join private) | user |
| GET | `/api/orgs/[id]/members` | List members + roles | org member |
| PATCH | `/api/orgs/[id]/members/[userId]` | Change member's org role | org admin/owner |
| DELETE | `/api/orgs/[id]/members/[userId]` | Remove member | org admin/owner |

### Gamification
| Method | Route | Purpose | Who |
|---|---|---|---|
| GET | `/api/gamification/me` | My XP, level, badges, streak | self |
| GET | `/api/gamification/leaderboard?scope=global|org|skill` | Rankings | any |
| GET | `/api/gamification/badges` | Badge catalogue + my progress | any |
| POST | `/api/internal/xp/award` | Award XP (server-internal, called by other routes) | system |
| PATCH | `/api/admin/gamification/weights` | Tune XP weights | platform admin |

### Open-source / git
| Method | Route | Purpose | Who |
|---|---|---|---|
| PATCH | `/api/projects/[id]/license` | Set license / open-source flag | lead/org admin |
| PATCH | `/api/project-progress/tasks/[id]/good-first-issue` | Flag good-first-issue + bounty | lead |
| POST | `/api/git/award-on-sync` | On GitRepo sync, award PR/commit XP | system (called by git sync) |

### Moderation
| Method | Route | Purpose | Who |
|---|---|---|---|
| POST | `/api/reports` | File a report | any user |
| GET | `/api/admin/reports` | Moderation queue | platform mod/admin |
| PATCH | `/api/admin/reports/[id]` | Resolve report | platform mod/admin |

---

## 8. New Pages / UI Surfaces

### Public / user
| Route | Description |
|---|---|
| `/orgs` | Directory of active orgs (cards: logo, members, projects, XP) |
| `/orgs/launch` | Org launch request wizard (multi-step) |
| `/orgs/launch/status` | Track my org request(s) |
| `/orgs/[slug]` | Org home — about, projects, members, leaderboard, join button |
| `/leaderboard` | Global + filters (org/skill/weekly) |
| `/profile/[id]` | + gamification: level ring, XP bar, badges, streak |
| `/me/badges` | Badge gallery + progress |

### Org admin console (scoped)
| Route | Description |
|---|---|
| `/orgs/[slug]/admin` | Org dashboard (members, projects, pending joins) |
| `/orgs/[slug]/admin/members` | Manage members + org roles |
| `/orgs/[slug]/admin/settings` | Branding, rules, visibility, charter |
| `/orgs/[slug]/admin/bounties` | Manage good-first-issues / bounties |

### Platform admin (extend existing `/admin`)
| Route | Description |
|---|---|
| `/admin/org-requests` | Approve/reject org launches |
| `/admin/orgs` | All orgs + status controls (suspend/archive) |
| `/admin/reports` | Moderation queue |
| `/admin/gamification` | Tune XP weights, manage badge catalogue |

### Navigation
- **TopNav** adds **Orgs** (and **Leaderboard** if room, else under a "More" menu).
- **Icon rail** adds **Launch Org** when user has none pending.
- **Org context switcher** (like GitHub's org switcher) in TopNav for multi-org members.

---

## 9. Permissions Matrix

| Action | Visitor | User | Org Member | Org Lead | Org Admin/Owner | Platform Mod | Platform Admin |
|---|---|---|---|---|---|---|---|
| Browse orgs/showcase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit org launch request | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve/reject org launch | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Suspend / archive org | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Join an org | ❌ | ✅ | — | — | — | ✅ | ✅ |
| Manage org members/roles | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Edit org settings/branding | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Create proposal (in org) | ❌ | ❌ | ✅ | ✅ | ✅ | — | ✅ |
| Verify contributions | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Flag good-first-issue / bounty | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Earn XP / badges | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tune gamification weights | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Handle reports | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Transfer org ownership | ❌ | ❌ | ❌ | ❌ | owner only | ❌ | ✅ |

---

## 10. Implementation Phases

### Phase 0 — Migrations & host org (½ sprint)
- Extend `Org`, `OrgMember`, `User` schemas (status, roles, gamification).
- Seed/upgrade S.A.N.K.A.L.P. as `isHost:true, status:"active"`.
- Backfill: existing orgs → `status:"active"`, founders → `owner`.
- DB migration endpoint (reuse `/api/admin/migrate` pattern).

### Phase 1 — Org launch + approval + moderator tier (1 sprint)
- Add `platform_moderator` to `User.role` enum + `isPlatformReviewer()` helper
  (so review can be delegated from day one).
- `POST /api/orgs/request`, slug check (reserved-slug enforced), launch wizard `/orgs/launch`.
- Platform queue `/admin/org-requests` + approve/reject API (mod or admin).
- Replace instant `POST /api/orgs` with request flow (keep admin-create shortcut).
- `/orgs` directory + `/orgs/[slug]` org home.

### Phase 2 — Org admin console + roles (1 sprint)
- `/o/[slug]/admin/*` (members, settings, branding).
- Org role management (owner/admin/lead/contributor/member).
- Org context switcher in TopNav; scope existing proposal/project pipeline by org.

### Phase 3 — Gamification core (1.5 sprints)
- `XpEvent`, award engine, `/api/internal/xp/award`.
- Hook XP into existing actions (proposal approve, project complete, task done,
  contribution approve).
- Levels + `/api/gamification/me`; profile level ring + XP bar.
- Leaderboards (extend `/api/builders/rankings`).

### Phase 4 — Badges + open-source + git rewards (1 sprint)
- Badge catalogue + earning rules; `/me/badges`.
- `Project.license`, `Task.goodFirstIssue` + bounties.
- Award XP on `GitRepo` sync (merged PRs, commits with daily cap).

### Phase 5 — Moderation queue + governance (½ sprint)
- `Report` model, `/api/reports`, `/admin/reports` (handled by the
  `platform_moderator` tier already created in Phase 1).
- Org suspend/archive, ownership transfer, platform gamification tuning UI.

**Estimate:** ~5.5 sprints solo (~11 weeks); ~6–7 weeks with two devs.

---

## 11. Decisions

### ✅ Resolved
1. **Org URL scheme** → **`/orgs/[slug]`** with reserved slugs (see §6.1).
2. **XP scoping** → **both** global (`totalXP`) + per-org (`xpInOrg`); `XpEvent`
   carries `orgId` so both derive from a single event log.
3. **Moderator tier** → **`platform_moderator` from the start** (Phase 1).

### ⏳ Still open (recommendations pending your sign-off)
4. **Auto-join host org on signup?** *Recommendation: yes, as `member`.*
5. **Can one user own multiple orgs?** *Recommendation: yes, but cap **pending**
   requests to 1 per user to prevent spam.*
6. **Anti-farming** — daily commit-XP cap + dedupe `XpEvent` by `(userId, source, refId)`.
   *Recommendation: cap commits at +20 XP/day; PRs uncapped but deduped.*
7. **Private orgs** — join-by-request vs invite-only? *Recommendation: support both.*
8. **Open-source enforcement** — incentivise (bonus XP) vs hard-require per
   category? *Recommendation: incentivise, don't force.*
9. **Payments/bounties** — XP-only first; real-money bounties out of scope (matches
   marketplace's inquiry-only stance).

---

## 12. Mapping: today → after upgrade

| Today | After upgrade |
|---|---|
| `POST /api/orgs` creates org instantly | `POST /api/orgs/request` → platform approval → active |
| `Org` has no status | `Org.status` lifecycle (requested→…→archived) |
| `User.role` only governs host-org admin | Platform tier; per-org roles via extended `OrgMember` |
| S.A.N.K.A.L.P. = the whole app | S.A.N.K.A.L.P. = the **host org** among many |
| `reputation` (lone number) | `gamification{ totalXP, level, badges, streak }` + `XpEvent` log |
| `/admin/*` platform-wide only | + org-scoped `/o/[slug]/admin/*` consoles |
| Projects org-scoped but no OSS semantics | `license`, `isOpenSource`, good-first-issues, git-reward XP |
| `/admin/proposals`, `/admin/projects` | + `/admin/org-requests`, `/admin/orgs`, `/admin/reports`, `/admin/gamification` |

---

**End of design.** No code written yet. The three architecture-shaping decisions
(URL scheme, XP scoping, moderator timing) are now **locked** (see top + §11).
Remaining open items (§11.4–9) are non-blocking — they can be settled during
Phase 0/1. Say the word to begin **Phase 0** (schema migrations + seeding
S.A.N.K.A.L.P. as the host org).
