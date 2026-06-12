# S.A.N.K.A.L.P. Platform — Project Scope & Workflow

## 1. What Is This Platform?

**S.A.N.K.A.L.P.** (also referred to internally as *Syncro*) is a full-stack community platform built for a university tech club called **Pixel Collective**. It is the club's internal operating system — members propose ideas, the community votes on them, admins greenlight the best ones, and those ideas get turned into real tracked projects with assigned teams, tasks, weekly reports, and GitHub integration.

**Tech stack:** Next.js 15 (App Router) · TypeScript · MongoDB (Mongoose) · NextAuth.js · Tailwind CSS · Framer Motion · Lucide Icons

---

## 2. User Roles

The platform has a five-tier role hierarchy. Higher roles have access to everything below them.

```
normal_user
    └── pixel_member
            └── project_lead
                    └── pixel_head  ──┐
                                      ├── Admin Panel access
                    └── admin     ────┘
```

| Role | Who They Are |
|---|---|
| `normal_user` | Default role after registration |
| `pixel_member` | Active club members |
| `project_lead` | Leads an approved project |
| `pixel_head` | Club leadership — same admin access as `admin` |
| `admin` | Platform superuser |

Role changes are performed by admins via the Admin Panel.

---

## 3. Core Entities (Data Models)

```
User
  ├── has many → Proposals (createdBy)
  ├── has many → Votes
  ├── has many → Activities
  ├── has many → Contributions
  ├── has many → GitRepo (PERSONAL)
  ├── follows/followed by → Users (social graph)
  └── belongs to → Org (via OrgMember)

Org
  ├── has many → Proposals
  └── has many → Projects

Proposal
  ├── belongs to → User (createdBy)
  ├── belongs to → User (projectLead, optional)
  ├── has many → Votes
  └── has many → Comments (with threading)

Project
  ├── derived from → Proposal (proposalId)
  ├── belongs to → Org
  ├── belongs to → User (lead)
  ├── has many → Users (members)
  ├── has many → Tasks
  ├── has many → WeeklyReports
  ├── has many → Contributions
  ├── has one  → GitRepo (PROJECT)
  └── verifiedBy → User (admin who verified)

Task
  ├── belongs to → Project
  └── has many → ProgressUpdates

Vote         — one per user per proposal (unique compound index)
Comment      — threaded (parentCommentId self-reference)
CommentVote  — vote on comments
Activity     — feed events (VOTE, JOIN, CREATE_PROPOSAL, FOLLOW, COMMENT)
ActivityLog  — admin/system audit trail
```

---

## 4. Application Zones

The platform has three distinct zones with separate routing and auth boundaries.

### Zone A — Public Landing (`/`)
- Shown to unauthenticated visitors only; logged-in users are immediately redirected to `/feed`
- Presents the club's identity: hero, impact counters, philosophy, project showcase, member spotlight, manifesto, roadmap
- Live stats pulled from the DB (user count, proposal count, activity count)

### Zone B — Member App (`/(app)/...`)
- Requires NextAuth session (any role)
- Contains all day-to-day member features

### Zone C — Admin Panel (`/admin/...`)
- Requires session with `admin` or `pixel_head` role
- Separate login at `/admin/login`
- Provides management capabilities over all platform data

---

## 5. Core Workflows

### 5.1 Proposal → Project Lifecycle

This is the primary workflow of the entire platform.

```
[Member]                    [Community]              [Admin]
   │                             │                      │
   ▼                             │                      │
Create Proposal                  │                      │
  status: "proposal"             │                      │
  stage:  "proposal"             │                      │
   │                             │                      │
   ▼                             │                      │
Proposal appears                 │                      │
on Feed & Ideas page             │                      │
   │                             │                      │
   │                      Upvote / Downvote             │
   │                      Comment / Discuss             │
   │                             │                      │
   │                             │               Review in Admin
   │                             │               Panel → PATCH status
   │                             │                      │
   │                             │               ┌──────┴──────┐
   │                             │               │             │
   │                             │          "rejected"    "approved"
   │                             │          (closed)           │
   │                             │                             │
   │                             │                    POST /convert
   │                             │                             │
   │                             │                    ┌────────────────┐
   │                             │                    │  Project born  │
   │                             │                    │  status: planning
   │                             │                    │  stage: setup  │
   │                             │                    └────────────────┘
   │                             │                             │
   │                             │                    Assign team members
   │                             │                    Create tasks
   │                             │                    Link GitHub repo
   │                             │                             │
   │                             │                    Project progresses:
   │                             │                    planning → active
   │                             │                    active → development
   │                             │                    development → completed
```

**Proposal stages** (in order): `proposal → planning → ideation → architecture → setup → development → completed`

**Proposal statuses**: `draft → proposal → active → approved / rejected → closed`

**Project statuses**: `planning → active → completed → archived`

---

### 5.2 User Registration & Onboarding

```
/register
  └── Collects: name, email, university, enrollment number, tech preference, password
  └── Creates User with role: "normal_user"

/login (NextAuth)
  └── Credential auth → JWT session
  └── Session includes: id, name, email, role, avatar

/admin/register  (separate flow)
  └── Admin-only registration for creating pixel_head / admin accounts
```

After registration, the user lands on `/feed`.

---

### 5.3 Social Feed

The `/feed` page is the home screen for logged-in members. It interleaves:
- **Proposals** — new ideas posted by anyone in the network
- **Activity events** — follows, votes, new proposals from people you follow

Members can:
- Create a new proposal directly from the feed via the `FeedActions` bar
- Upvote/downvote proposals inline
- Click through to full proposal detail

---

### 5.4 Proposal Interaction

On the proposal detail page (`/ideas/[id]`):
- Full description, tech stack, type, stage, status
- **Vote** — up (+1) or down (-1); one entry per user (enforced by DB unique index)
- **Comment** — threaded discussions; comments can receive votes; admin can attach feedback directly on a comment
- Proposer's profile card (avatar, bio, skills, other proposals)

---

### 5.5 Project Execution Tracking

Once a proposal is converted to a project, the project tracker (`/projects/[id]`) provides a multi-tab workspace:

| Tab | Contents |
|---|---|
| **Overview** | Progress bar, social stats, meta info, timeline, complexity score |
| **Tasks** | Kanban board with workflow stages, task history, automation rules |
| **Activity** | Activity pulse feed for the project |

**Right sidebar:** Org badge, project lead card, health indicator

**Nested progress area** (`/projects/[id]/progress/...`):

| Sub-page | Purpose |
|---|---|
| `/progress` | Summary dashboard — task counts by status, avg progress, team overview |
| `/progress/tasks` | Detailed task list for the project |
| `/progress/team` | Team member management |
| `/progress/weekly-review` | Submit & view weekly reports (completed tasks, blockers, next week plan) |
| `/progress/activity` | Activity log for the project |

---

### 5.6 Admin Proposal Management

```
Admin Panel → Proposals list
  ├── Filter by status / stage / type / search text
  ├── Click proposal → Detail view
  │     ├── Full proposer profile (ProposerCard)
  │     ├── Vote breakdown (upvotes / downvotes via aggregation)
  │     ├── Other proposals by same author
  │     └── PATCH status / stage / assign project lead
  └── Convert to Project (POST /api/admin/proposals/[id]/convert)
```

---

### 5.7 Admin Project Management

```
Admin Panel → (accessible via Projects API, no dedicated page yet)
  ├── View all projects with filters
  ├── Edit status, lead, progress, GitHub repo URL
  ├── Verify project (sets verifiedBy = current admin)
  ├── Manage team: add/remove members
  └── Manage tasks: create, update, delete
```

---

### 5.8 Admin User Management

```
Admin Panel → Users
  ├── Search by name / email / university
  ├── Filter by role
  └── PATCH role (promote/demote any user)
```

---

### 5.9 Member Profile & Discovery

**Profile page** (`/profile/[id]`):
- Header with avatar, bio, location, university, followers/following counts
- Stats bar (reputation, followers, following, proposal count)
- Feed of the user's proposals ("Telemetry Broadcasts")
- Recent activity log ("System Activity")
- About section with identity/location
- GitHub profile metrics widget (live from GitRepo)

**Discover page** (`/discover`):
- Grid of all non-admin users (up to 12)
- Shows name, role, university, location, top 3 skills
- One-click follow/connect button

---

### 5.10 Settings & Git Integration

**Settings page** (`/settings`):
- Update bio, location, skills (comma-separated), GitHub profile link, protocol role (self-service up to `project_lead`)
- **Git Settings** section — connect a personal GitHub repo; stored as `GitRepo` with type `PERSONAL`; platform syncs stats (commits, stars, forks, PRs, issues) and commit history

---

## 6. Feature Map

```
Platform
│
├── Public
│   └── Landing page (portfolio / marketing)
│
├── Auth
│   ├── /login  (NextAuth credentials)
│   ├── /register
│   └── /admin/login  /admin/register
│
├── Member App  /(app)/
│   ├── Feed                  /feed
│   ├── Ideas (proposals)     /ideas  /ideas/[id]  /ideas/create
│   ├── Projects              /projects/[id]
│   │     └── Progress        /projects/[id]/progress/**
│   ├── Discover              /discover
│   ├── Profile               /profile/[id]
│   ├── Notifications         /notifications
│   ├── Settings              /settings
│   └── Project Tracker       /project_tracker/[id]  (legacy / alt view)
│
├── Member Dashboard  /dashboard/member/
│   └── Proposals (simpler voting UI)  /dashboard/member/proposals/**
│
└── Admin Panel  /admin/
    ├── Login / Register
    ├── Dashboard             /admin/dashboard
    ├── Users                 /admin/users
    └── Proposals             /admin/proposals/[id]
```

---

## 7. API Surface

### Public / Member APIs
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/proposals` | List proposals (feed) |
| POST | `/api/proposals` | Create proposal |
| GET/PATCH | `/api/proposals/[id]` | Read / update single proposal |
| POST | `/api/proposals/[id]/vote` | Cast vote |
| GET/POST | `/api/proposals/[id]/comments` | List / create comments |
| GET | `/api/projects` | List / get project |
| GET | `/api/user/profile` | Own profile |
| PATCH | `/api/user/profile/update` | Update own profile |
| GET/POST | `/api/project-progress/tasks/project/[id]` | Progress tasks |
| GET/POST | `/api/project-progress/weekly-reports` | Weekly reports |
| GET/POST | `/api/git/repos` | Git repo management |

### Admin APIs (`/api/admin/...`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard KPIs |
| GET/PATCH | `/api/admin/users` | List users / change role |
| GET/PATCH | `/api/admin/proposals` | List / bulk update proposals |
| GET/PATCH | `/api/admin/proposals/[id]` | Single proposal detail / update |
| POST | `/api/admin/proposals/[id]/convert` | Convert proposal → project |
| GET | `/api/admin/projects` | List projects |
| GET/PATCH | `/api/admin/projects/[id]` | Single project detail / update |
| PATCH | `/api/admin/projects/[id]/team` | Add/remove team members |
| GET/POST | `/api/admin/projects/[id]/tasks` | List / create tasks |
| PATCH/DELETE | `/api/admin/projects/[id]/tasks/[taskId]` | Update / delete task |

---

## 8. Key Data Flow Diagram

```
                        ┌──────────────┐
                        │   MongoDB    │
                        │  (Mongoose)  │
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼─────┐  ┌───────▼──────┐  ┌─────▼──────────┐
     │  Next.js API  │  │  Next.js API │  │  Next.js API    │
     │  /api/...     │  │ /api/admin/  │  │ /api/project-   │
     │  (members)    │  │   (admins)   │  │  progress/...   │
     └────────┬─────┘  └───────┬──────┘  └─────┬──────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Next.js App       │
                    │   (React / RSC)     │
                    │                     │
                    │  /(app)/...         │  ← Member UI
                    │  /admin/...         │  ← Admin UI
                    │  / (landing)        │  ← Public
                    └─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   NextAuth.js       │
                    │   JWT Sessions      │
                    └─────────────────────┘
```

---

## 9. Terminology Glossary

The platform uses a sci-fi / network metaphor throughout the UI copy. Here's the mapping:

| UI Label | Actual Meaning |
|---|---|
| Node | A user/member |
| Protocol | Platform rules / role system |
| Telemetry Broadcast | User's public proposals |
| Network Signal | Activity event |
| Local Signal | A user's own proposal |
| Deployment Node | A project |
| Collective | The club / organization |
| Sync / Syncro | The platform itself |
| Initialize Sync | Log in / Register |
| Control Center | Settings page |
| Commit Changes | Save settings |
| Verified | Admin-confirmed project |
