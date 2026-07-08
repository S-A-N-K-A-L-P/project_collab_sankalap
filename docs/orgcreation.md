# S.A.N.K.A.L.P. — Org Creation System

> Canonical documentation for the organization creation feature.
> Companion to [`hierarchy.md`](./hierarchy.md) and [`config.md`](./config.md).
> **Date:** 2026-07-08

---

## 1. Overview

The org creation system transforms S.A.N.K.A.L.P. from instant org creation to a **governed lifecycle**: users submit org launch requests, platform admins review them, and approved orgs get dynamic public pages with optional portfolio websites powered by the existing portfolio builder.

### Key Principles
1. **Request-based creation** — orgs are not created instantly; they go through platform review
2. **Portfolio reuse** — org pages reuse the same PortfolioRenderer/Builder components as user portfolios
3. **Cloudinary-powered branding** — all org images (logo, banner, gallery) upload via Cloudinary API
4. **Hierarchy-driven limits** — membership caps, org types, and pricing follow `hierarchy.md` rules

---

## 2. Org Lifecycle

```
User submits request        Platform admin reviews        Founder onboards
      │                              │                          │
      ▼                              ▼                          ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   ┌──────────────┐
│ REQUESTED│───►│IN_REVIEW │───►│ APPROVED │───►│  ACTIVE  │──►│  SUSPENDED / │
│          │    │          │    │          │    │          │   │  ARCHIVED    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘   └──────────────┘
     │               │                                │
     │               └──► REJECTED (with reason)      └──► Portfolio website live
     └──► Edit & resubmit
```

### Status Enum
```
"requested" | "in_review" | "approved" | "active" | "suspended" | "archived" | "rejected"
```

### Reserved Slugs
These slugs cannot be used for org URLs (they collide with static routes under `/orgs/*`):
```
launch, status, admin, new, settings, api, o
```

---

## 3. File Structure

### 3.1 Complete New & Modified File Map

```
pixel-platform/
├── .env.local.example                                    [MODIFY] + Cloudinary env vars
├── next.config.ts                                        [MODIFY] + Cloudinary image domains
├── docs/
│   └── orgcreation.md                                    [NEW]  ← this file
│
├── src/
│   ├── middleware.ts                                     [MODIFY] + org route protection
│   │
│   ├── models/
│   │   ├── Org.ts                                       [MODIFY] +15 new fields
│   │   ├── OrgMember.ts                                 [MODIFY] + extended roles
│   │   ├── OrgPortfolio.ts                              [NEW]   — org portfolio doc
│   │   └── User.ts                                      [MODIFY] + platform_moderator
│   │
│   ├── types/
│   │   └── org.ts                                       [NEW]   — TS interfaces
│   │
│   ├── lib/
│   │   ├── cloudinary.ts                                [MODIFY] → real Cloudinary impl
│   │   ├── roles.ts                                     [MODIFY] + platform_moderator
│   │   └── org-permissions.ts                           [NEW]   — org-level permissions
│   │
│   ├── hooks/
│   │   ├── useCloudinaryUpload.ts                       [NEW]   — upload hook
│   │   └── useOrgMembership.ts                          [NEW]   — membership hook
│   │
│   ├── context/
│   │   └── OrgContext.tsx                               [NEW]   — org data provider
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── ImageUploader.tsx                        [NEW]   — drag-drop uploader
│   │   │
│   │   ├── org/
│   │   │   ├── OrgCard.tsx                              [NEW]   — directory card
│   │   │   ├── OrgHero.tsx                              [NEW]   — full-width hero
│   │   │   ├── TrustScoreCard.tsx                       [NEW]   — trust metrics
│   │   │   ├── MemberGrid.tsx                           [NEW]   — member avatars
│   │   │   ├── JoinButton.tsx                           [NEW]   — smart join CTA
│   │   │   └── OrgLaunchWizard.tsx                      [NEW]   — multi-step wizard
│   │   │
│   │   └── portfolio/
│   │       ├── OrgPortfolioRenderer.tsx                 [NEW]   — org portfolio wrapper
│   │       ├── OrgPortfolioBuilder.tsx                  [NEW]   — org portfolio builder
│   │       ├── PortfolioRenderer.tsx                    [MODIFY] + org mode support
│   │       ├── SectionsEditor.tsx                       [MODIFY] + org section editors
│   │       └── sections.ts                              [MODIFY] + org section types
│   │
│   └── app/
│       ├── api/
│       │   ├── upload/
│       │   │   ├── route.ts                             [NEW]   — POST file upload
│       │   │   └── signature/
│       │   │       └── route.ts                         [NEW]   — GET upload signature
│       │   │
│       │   ├── orgs/
│       │   │   ├── route.ts                             [MODIFY] — request-based POST
│       │   │   ├── slug-available/
│       │   │   │   └── route.ts                         [NEW]   — GET slug check
│       │   │   └── [slug]/
│       │   │       ├── route.ts                         [NEW]   — GET/PATCH org profile
│       │   │       ├── members/
│       │   │       │   ├── route.ts                     [NEW]   — GET/POST members
│       │   │       │   └── [userId]/
│       │   │       │       └── route.ts                 [NEW]   — PATCH/DELETE member
│       │   │       ├── projects/
│       │   │       │   └── route.ts                     [NEW]   — GET org projects
│       │   │       ├── portfolio/
│       │   │       │   └── route.ts                     [NEW]   — GET/PUT org portfolio
│       │   │       └── stats/
│       │   │           └── route.ts                     [NEW]   — GET stats/trust
│       │   │
│       │   └── admin/
│       │       ├── org-requests/
│       │       │   ├── route.ts                         [NEW]   — GET request queue
│       │       │   └── [id]/
│       │       │       └── route.ts                     [NEW]   — PATCH approve/reject
│       │       └── migrate/
│       │           └── orgs/
│       │               └── route.ts                     [NEW]   — POST migration
│       │
│       ├── orgs/
│       │   ├── page.tsx                                 [NEW]   — org directory
│       │   ├── launch/
│       │   │   ├── page.tsx                             [NEW]   — launch wizard
│       │   │   └── status/
│       │   │       └── page.tsx                         [NEW]   — request tracker
│       │   └── [slug]/
│       │       ├── layout.tsx                           [NEW]   — org layout + context
│       │       ├── page.tsx                             [NEW]   — dynamic org page
│       │       └── admin/
│       │           ├── page.tsx                         [NEW]   — org admin dashboard
│       │           ├── members/
│       │           │   └── page.tsx                     [NEW]   — member management
│       │           ├── settings/
│       │           │   └── page.tsx                     [NEW]   — org settings
│       │           └── portfolio/
│       │               └── page.tsx                     [NEW]   — portfolio builder
│       │
│       └── admin/
│           └── org-requests/
│               └── page.tsx                             [NEW]   — platform review queue
```

**Summary: ~35 new files, ~10 modified files**

---

## 4. Extended Data Models

### 4.1 Org Model — Extended Fields

Source: `src/models/Org.ts`

**Existing fields preserved:** `name`, `slug`, `description`, `createdBy`, `admins[]`, `members[]`, `rules{}`, `visibility`, `avatar`, `banner`

**New fields:**

| Field | Type | Default | Purpose |
|---|---|---|---|
| `status` | enum | `"requested"` | Lifecycle state |
| `isHost` | boolean | `false` | S.A.N.K.A.L.P. host org flag |
| `orgType` | enum | `"free"` | free/standard/premium/research/invite_only |
| `category` | enum | `"community"` | community/academic/company/open_source |
| `charter` | string | `""` | Mission statement / why this org exists |
| `roadmap` | string | `""` | Initial roadmap (markdown) |
| `tagline` | string | `""` | Short tagline for cards/hero |
| `website` | string | `""` | External website URL |
| `email` | string | `""` | Contact email |
| `socialLinks` | object | `{}` | github, twitter, linkedin, discord |
| `logo` | string | `""` | Cloudinary URL |
| `bannerImage` | string | `""` | Cloudinary hero banner URL |
| `themeColor` | string | `"#6366f1"` | Brand accent color |
| `gallery` | array | `[]` | `[{ url, caption, publicId }]` |
| `portfolioEnabled` | boolean | `false` | Use portfolio mode for public page |
| `membershipFee` | number | `0` | ₹0 = free; hierarchy §3 |
| `maxConcurrentProjects` | number | `10` | config §2.2 default |
| `maxTeamSize` | number | `8` | config §2.2 default |
| `votingRightsRule` | enum | `"all_members"` | Who can vote |
| `ownerId` | ObjectId→User | — | Founding org admin |
| `review` | object | — | `{ reviewedBy, reviewedAt, decision, reason }` |
| `stats` | object | — | `{ memberCount, projectCount, completedProjectCount, totalXP }` |
| `trustScore` | object | — | `{ completionRate, avgResponseDays, founderVerified, kycVerified }` |

### 4.2 OrgMember Model — Extended Roles

| Field | Change |
|---|---|
| `role` | enum: `["observer", "member", "contributor", "lead", "admin", "owner"]` |
| `xpInOrg` | **NEW** — `Number, default: 0` |
| `status` | **NEW** — `enum: ["active", "pending", "suspended"], default: "active"` |

### 4.3 User Model — New Role

| Field | Change |
|---|---|
| `role` | enum: `+ "platform_moderator"` |

### 4.4 OrgPortfolio Model (NEW)

Mirrors the `Portfolio` model, scoped to orgs:

| Field | Type | Purpose |
|---|---|---|
| `orgId` | ObjectId→Org (unique) | Links to org |
| `isPublished` | Boolean | Portfolio visibility |
| `themeId` | String | Portfolio theme |
| `accent`, `accent2` | String | Brand colors |
| `bgOverride`, `threeOverride` | String | Background/3D overrides |
| `sections` | Mixed[] | Org-specific sections |
| `seo` | Object | SEO metadata |
| `published` | Mixed | Published snapshot |
| `views` | Number | View counter |

---

## 5. Org-Specific Portfolio Sections

8 new section types for org portfolios:

| Type | Label | Content Shape |
|---|---|---|
| `mission` | Mission | `{ body, foundedDate, founderName }` |
| `team` | Team | `{ members: [{ userId, spotlight, quote }], limit }` |
| `projects_showcase` | Projects | `{ projectIds, showCompleted, showActive }` |
| `org_stats` | Statistics | `{ showTrustScore, showMembers, showProjects, custom }` |
| `roadmap` | Roadmap | `{ items: [{ date, title, description, status }] }` |
| `sponsors` | Sponsors | `{ items: [{ name, logo, url }] }` |
| `events` | Events | `{ items: [{ date, title, description, url }] }` |
| `join_cta` | Join Us | `{ buttonText, benefits, showMemberCount }` |

### Org Starter Templates
- **Organization**: hero → mission → team → projects_showcase → org_stats → roadmap → join_cta → contact
- **Org Minimal**: hero → mission → team → join_cta
- **Org Showcase**: hero → mission → projects_showcase → gallery → team → org_stats → testimonials → contact

---

## 6. Cloudinary Integration

### Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Folder Structure in Cloudinary
```
sankalp/
├── orgs/avatars/          — org logos (max 2MB)
├── orgs/banners/          — org hero banners (max 5MB)
├── orgs/gallery/          — org gallery images (max 10MB)
├── users/avatars/         — user profile pictures
└── uploads/general/       — general uploads
```

### Upload API
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/upload` | Server-proxied file upload (multipart/form-data) |
| `GET` | `/api/upload/signature` | Signature for client-side direct-to-Cloudinary uploads |

---

## 7. API Routes Summary

### Org Lifecycle
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/orgs` | Submit org launch request |
| `GET` | `/api/orgs` | List active orgs |
| `GET` | `/api/orgs/slug-available?slug=` | Check slug availability |
| `GET` | `/api/orgs/[slug]` | Public org profile |
| `PATCH` | `/api/orgs/[slug]` | Edit org settings |

### Membership
| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/orgs/[slug]/members` | List members |
| `POST` | `/api/orgs/[slug]/members` | Join / request to join |
| `PATCH` | `/api/orgs/[slug]/members/[userId]` | Change role |
| `DELETE` | `/api/orgs/[slug]/members/[userId]` | Remove / leave |

### Org Portfolio
| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/orgs/[slug]/portfolio` | Public org portfolio |
| `PUT` | `/api/orgs/[slug]/portfolio` | Save org portfolio |

### Platform Admin
| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/admin/org-requests` | Review queue |
| `PATCH` | `/api/admin/org-requests/[id]` | Approve / reject |
| `POST` | `/api/admin/migrate/orgs` | DB migration |

---

## 8. Portfolio Reuse Architecture

```
┌─────────────────────────────────────┐
│         PortfolioRenderer           │  ← shared rendering engine
│  (accepts PortfolioData interface)  │
│                                     │
│  if data.orgMode:                   │
│    - Hero shows org logo/banner     │
│    - Token resolution → org data    │
│    - Renders org section types      │
│  else:                              │
│    - Standard user portfolio        │
└─────────┬────────────┬──────────────┘
          │            │
    ┌─────▼─────┐  ┌──▼────────────────────┐
    │  User     │  │  OrgPortfolioRenderer  │
    │  Portfolio│  │  (wraps PortfolioData  │
    │  Page     │  │   with orgMode: true)  │
    └───────────┘  └────────────────────────┘
```

---

## 9. Org Internal Roles

| Role | Powers |
|---|---|
| **Owner** | Everything; billing; delete org; transfer ownership |
| **Admin** | Manage members, approve proposals, configure org settings |
| **Lead** | Manage one project: tasks, team, scope |
| **Contributor** | Verified contributor — self-assign good-first-issues |
| **Member** | Join projects, submit proposals, vote (if enabled) |
| **Observer** | Read-only (useful for Research orgs) |

---

## 10. Dependencies

```bash
npm install cloudinary
```

Only new dependency. All other packages already exist in the project.
