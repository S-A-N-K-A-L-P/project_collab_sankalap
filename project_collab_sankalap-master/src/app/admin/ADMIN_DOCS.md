# Syncro Admin Panel — Developer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [UI Components](#ui-components)
   - [AdminShell](#adminshell)
   - [AdminGuard](#adminguard)
   - [AdminSidebar](#adminsidebar)
   - [AdminHeader](#adminheader)
   - [AdminStatCard](#adminstatcard)
   - [StatusBadge](#statusbadge)
   - [ProposerCard](#proposercard)
4. [API Reference](#api-reference)
   - [Stats](#get-apiadminstats)
   - [Users](#users-api)
   - [Proposals](#proposals-api)
   - [Projects](#projects-api)
   - [Tasks](#tasks-api)
   - [Team](#team-api)
5. [Role Reference](#role-reference)
6. [Status & Stage Reference](#status--stage-reference)

---

## Overview

The Admin Panel provides privileged management of users, proposals, and projects for the Syncro platform. Access is restricted to users with the `admin` or `pixel_head` role.

**Base path:** `/admin`  
**API base path:** `/api/admin`

---

## Authentication & Authorization

All admin routes — both UI pages and API endpoints — require an active NextAuth session whose user role is `admin` or `pixel_head`.

- **UI protection** is handled by [`AdminGuard`](#adminguard), which wraps every page via [`AdminShell`](#adminshell).
- **API protection** uses a shared `isAdmin(session)` helper defined locally in each route file.

Unauthorized or unauthenticated requests are redirected to `/admin/login` (UI) or receive `401 Unauthorized` (API).

---

## UI Components

### AdminShell

**File:** `src/app/admin/components/AdminShell.tsx`

Root layout wrapper for all protected admin pages. Composes `AdminGuard`, `AdminSidebar`, and `AdminHeader` around a `<main>` content area.

```tsx
<AdminShell>
  <YourPageContent />
</AdminShell>
```

**Layout structure:**
- Fixed 240 px sidebar on the left
- Sticky header spanning the remaining width
- Padded `<main>` area (`p-8`) for page content

---

### AdminGuard

**File:** `src/app/admin/components/AdminGuard.tsx`

Client-side route guard that checks the NextAuth session on every render.

| Session state | Outcome |
|---|---|
| Loading | Centered spinner with "Verifying Access…" |
| Unauthenticated | Redirect → `/admin/login` |
| Authenticated, wrong role | Redirect → `/unauthorized` |
| Authenticated, correct role | Render `children` |

---

### AdminSidebar

**File:** `src/app/admin/components/AdminSidebar.tsx`

Fixed left navigation rail (240 px wide). Highlights the active route using `usePathname`.

**Nav items:**

| Label | Path | Icon |
|---|---|---|
| Dashboard | `/admin/dashboard` | `LayoutDashboard` |
| Users | `/admin/users` | `Users` |
| Proposals | `/admin/proposals` | `FileText` |

The footer area displays the signed-in user's email and role, plus a **Sign Out** button (redirects to `/admin/login` via `signOut`).

---

### AdminHeader

**File:** `src/app/admin/components/AdminHeader.tsx`

Sticky top header (z-index 20) that resolves a human-readable page title from the current pathname.

**Title resolution logic:**

| Pathname (exact or prefix) | Title shown |
|---|---|
| `/admin/dashboard` | Dashboard |
| `/admin/users` | User Management |
| `/admin/proposals` | Proposal Management |
| anything else | Admin |

Includes a notification bell button (UI only, no handler wired yet).

---

### AdminStatCard

**File:** `src/app/admin/components/AdminStatCard.tsx`

Reusable metric card for dashboard KPIs.

```tsx
<AdminStatCard
  title="Total Users"
  value={142}
  icon={Users}
  description="All registered accounts"
  accent          // optional — renders with accent colour scheme
/>
```

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Label above the value |
| `value` | `number \| string` | Yes | Large displayed metric |
| `icon` | `LucideIcon` | Yes | Icon shown in the top-right |
| `description` | `string` | No | Subtitle below the value |
| `accent` | `boolean` | No | Uses accent colour variant when `true` |

---

### StatusBadge

**File:** `src/app/admin/components/StatusBadge.tsx`

Inline pill badge for displaying an entity's status or stage.

```tsx
<StatusBadge value="active" />
<StatusBadge value="pending" size="md" />
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Status string to display |
| `size` | `"sm" \| "md"` | `"sm"` | Controls text size and padding |

**Supported colour mappings:**

| Value | Colour |
|---|---|
| `proposal` | Blue |
| `active` | Emerald |
| `approved` | Green |
| `rejected` | Red |
| `closed` / `archived` | Zinc |
| `draft` / `pending` | Yellow |
| `disabled` | Zinc (muted) |
| `planning` | Purple |
| `ideation` | Indigo |
| `architecture` | Cyan |
| `setup` | Orange |
| `development` / `in-progress` | Blue |
| `completed` | Green |
| `delayed` | Red |

Unknown values fall back to a neutral zinc badge.

---

### ProposerCard

**File:** `src/app/admin/components/ProposerCard.tsx`

Rich user-profile sidebar card shown in the proposal detail view.

```tsx
<ProposerCard
  user={proposal.createdBy}
  otherProposals={otherProposals}
/>
```

**Props:**

```ts
interface ProposerCardProps {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    universityName?: string;
    enrollmentNumber?: string;
    skills?: string[];
    reputation?: number;
    bio?: string;
    github?: string;
    followers?: unknown[];
    following?: unknown[];
  };
  otherProposals?: {
    _id: string;
    title: string;
    status: string;
    totalVotes: number;
  }[];
}
```

**Sections rendered (in order):**

1. **Header** — Avatar (image or initials), full name, email, role badge, university name
2. **Stats** — Reputation score, follower count
3. **Bio** — Free-text biography (hidden when empty)
4. **Skills** — Up to 8 skill tags (hidden when empty)
5. **Other Proposals** — Linked list of up to 4 other proposals by this user (hidden when empty)
6. **Actions** — "Full Profile" link (`/admin/users/:id`) and optional GitHub link

---

## API Reference

All endpoints require the caller to be authenticated with role `admin` or `pixel_head`. Unauthenticated or unauthorized requests receive `{ "error": "Unauthorized" }` with HTTP 401.

---

### GET /api/admin/stats

Returns aggregated dashboard statistics.

**Response:**
```json
{
  "stats": {
    "totalUsers": 142,
    "totalProposals": 38,
    "activeProposals": 12,
    "adminCount": 3
  },
  "recentUsers": [ /* 5 most recent users */ ],
  "recentProposals": [ /* 5 most recent proposals, populated with createdBy */ ]
}
```

---

### Users API

#### GET /api/admin/users

Paginated, filterable list of all users.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Search name, email, or university (case-insensitive regex) |
| `role` | string | Filter by exact role |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page (default: `20`) |

**Response:**
```json
{
  "users": [ /* selected fields: name, email, avatar, role, universityName, skills, reputation, createdAt */ ],
  "total": 142,
  "page": 1,
  "pages": 8
}
```

#### PATCH /api/admin/users

Update a user's role.

**Request body:**
```json
{ "userId": "<id>", "role": "pixel_member" }
```

**Valid roles:** `normal_user`, `pixel_member`, `project_lead`, `pixel_head`, `admin`

**Response:** Updated user document (selected fields).

---

### Proposals API

#### GET /api/admin/proposals

Paginated, filterable list of all proposals.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by proposal status |
| `stage` | string | Filter by proposal stage |
| `type` | string | Filter by proposal type |
| `search` | string | Search title or description |
| `page` | number | Default: `1` |
| `limit` | number | Default: `20` |

**Response:**
```json
{
  "proposals": [ /* populated: createdBy, projectLead */ ],
  "total": 38,
  "page": 1,
  "pages": 2
}
```

#### PATCH /api/admin/proposals

Bulk-update a proposal's status, stage, or project lead.

**Request body:**
```json
{ "id": "<proposalId>", "status": "approved", "stage": "setup", "projectLead": "<userId>" }
```

All fields except `id` are optional. Pass `projectLead: null` to clear the lead.

---

#### GET /api/admin/proposals/[id]

Fetch a single proposal with full details.

**Response:**
```json
{
  "proposal": { /* fully populated: createdBy, projectLead */ },
  "voteStats": { "upvotes": 24, "downvotes": 3 },
  "otherProposals": [ /* up to 4 other proposals by the same author */ ]
}
```

#### PATCH /api/admin/proposals/[id]

Update a single proposal's `status`, `stage`, or `projectLead` (same semantics as the bulk PATCH).

---

#### POST /api/admin/proposals/[id]/convert

Convert an approved/active proposal into a Project.

**Pre-condition:** Proposal `status` must be `"approved"` or `"active"`.

**Request body:**
```json
{
  "orgId": "<orgId>",       // optional — falls back to first org, or creates "SANKALP"
  "title": "My Project",    // optional — defaults to proposal title
  "description": "...",     // optional — defaults to proposal description
  "leadId": "<userId>"      // optional — defaults to proposal.projectLead or current admin
}
```

**Side effects:**
- Creates a new `Project` document with `status: "planning"`.
- Sets the source proposal to `stage: "setup"`, `status: "active"`.

**Response:** `{ "project": { /* new project document */ } }` with HTTP 201.

---

### Projects API

#### GET /api/admin/projects

Paginated list of all projects.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by project status |
| `search` | string | Search by title (case-insensitive) |
| `page` | number | Default: `1` |
| `limit` | number | Default: `20` |

**Response:**
```json
{
  "projects": [ /* populated: lead, orgId, proposalId */ ],
  "total": 15,
  "page": 1,
  "pages": 1
}
```

#### GET /api/admin/projects/[id]

Fetch a single project with full population (lead, members, org, source proposal, verifiedBy).

#### PATCH /api/admin/projects/[id]

Update project fields.

**Request body (all optional):**
```json
{
  "status": "development",
  "lead": "<userId>",
  "progress": 42,
  "githubRepo": "https://github.com/org/repo",
  "verify": true          // sets verifiedBy to the current admin's user ID
}
```

---

### Tasks API

#### GET /api/admin/projects/[id]/tasks

Returns all tasks for a project, sorted newest-first.

**Response:** Array of Task documents.

#### POST /api/admin/projects/[id]/tasks

Create a new task.

**Request body:**
```json
{
  "title": "Implement login",           // required
  "assignedTo": "<userId>",             // required
  "deadline": "2025-08-01",             // required (ISO date string)
  "description": "Details…",           // optional
  "assignedToName": "Jane Doe",         // optional
  "priority": "high"                    // optional — default: "medium"
}
```

Initial `status` is always `"pending"`, `progress` is always `0`.

**Response:** Created Task document with HTTP 201.

#### PATCH /api/admin/projects/[id]/tasks/[taskId]

Update any combination of task fields.

**Updatable fields:** `title`, `description`, `assignedTo`, `assignedToName`, `status`, `priority`, `deadline`, `progress`

`progress` is automatically clamped to `[0, 100]`.

#### DELETE /api/admin/projects/[id]/tasks/[taskId]

Permanently delete a task. Returns `{ "message": "Task deleted" }`.

---

### Team API

#### PATCH /api/admin/projects/[id]/team

Add or remove members from a project in one request.

**Request body:**
```json
{
  "add": ["<userId1>", "<userId2>"],      // optional
  "remove": ["<userId3>"]                 // optional
}
```

At least one of `add` or `remove` must be non-empty. Uses `$addToSet` / `$pull` so duplicate additions are safe.

**Response:** Updated project with `members` populated (`name`, `email`, `avatar`, `role`, `universityName`, `skills`).

---

## Role Reference

| Role | Description |
|---|---|
| `normal_user` | Default registered user |
| `pixel_member` | Club member with expanded access |
| `project_lead` | Leads one or more projects |
| `pixel_head` | Club leadership — full admin access |
| `admin` | Platform administrator — full admin access |

> Roles `pixel_head` and `admin` are the only roles that can access the Admin Panel.

---

## Status & Stage Reference

### Proposal Statuses
`draft` · `proposal` · `active` · `approved` · `rejected` · `closed`

### Proposal Stages
`ideation` · `architecture` · `setup` · `development` · `completed`

### Project Statuses
`planning` · `active` · `development` · `completed` · `archived`

### Task Statuses
`pending` · `in-progress` · `completed` · `delayed`

### Task Priorities
`low` · `medium` · `high`
