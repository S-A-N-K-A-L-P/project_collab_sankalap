# Syncro (SANKALP) — Full Platform Workflow

> This document describes the complete lifecycle of the platform: every actor, every state transition, every sync point between the user-facing app and the admin control panel. It is the authoritative reference for building new features.

---

## 1. Actors & Roles

| Role | Who | Permissions |
|---|---|---|
| `normal_user` | Anyone who registers | Browse feed, vote on proposals |
| `pixel_member` | Invited member | + Submit proposals, comment |
| `project_lead` | Assigned by admin | + Manage their project's tasks and team |
| `pixel_head` | Senior org member | + All admin powers except user role promotion |
| `admin` | Platform operator | Full control over all entities |

Role hierarchy (lowest → highest): `normal_user` → `pixel_member` → `project_lead` → `pixel_head` → `admin`

---

## 2. Full Proposal → Project Lifecycle

```
IDEA SUBMITTED
     │
     ▼
[Proposal: status=proposal, stage=proposal]
     │
     │  Community votes via /feed or /dashboard/member/proposals
     │  Each vote POST /api/proposals/vote
     │
     ▼ (totalVotes ≥ 10, auto-triggered)
[Proposal: status=active]
     │
     │  Admin reviews at /admin/proposals
     │  Admin views proposer profile, comments, vote count
     │
     ├── REJECT ──► [Proposal: status=rejected]  (user notified, proposal locked)
     │
     ├── NEEDS WORK ► Admin leaves comment feedback, keeps status=active
     │
     └── APPROVE ──► [Proposal: status=approved, stage=planning]
                          │
                          │  Admin assigns projectLead
                          │  Admin clicks "Convert to Project"
                          │  POST /api/projects
                          │
                          ▼
               [Project created: status=planning]
               [Proposal: stage=setup]
                          │
                          │  Admin forms team at /admin/projects/[id]/team
                          │  Admin adds members from user list
                          │  PATCH /api/admin/projects/[id]/team
                          │
                          ▼
               [Project: status=active, members populated]
                          │
                          │  Admin (or project_lead) creates tasks
                          │  at /admin/projects/[id]/tasks
                          │  POST /api/project-progress/tasks
                          │
                          ▼
               [Tasks created: status=pending, assigned to members]
                          │
                          │  Members work, update task progress
                          │  PATCH /api/project-progress/tasks/[taskId]
                          │
                          │  Project lead submits weekly reports
                          │  POST /api/project-progress/weekly-reports
                          │
                          ▼
               [Project: progress → 100%, status=completed]
                          │
                          │  Admin verifies completion
                          │  PATCH /api/admin/projects/[id] { verifiedBy }
                          │
                          ▼
               [Project: archived, Proposal: stage=completed]
```

---

## 3. Admin Control Panel — Page Map

All routes under `/admin`. All require `role: admin | pixel_head`.

```
/admin                         → redirect to /admin/dashboard
/admin/login                   → admin login (open)
/admin/register                → create admin account (open)

/admin/dashboard               → platform overview stats

/admin/proposals               → all proposals with filters
/admin/proposals/[id]          → proposal detail: proposer profile, votes,
                                  comments, approve/reject/stage controls,
                                  convert-to-project button

/admin/projects                → all ongoing + completed projects
/admin/projects/[id]           → project overview: progress, lead, repo
/admin/projects/[id]/team      → team formation: add/remove members
/admin/projects/[id]/tasks     → task assignment: create, assign, track

/admin/users                   → all users with search and role assignment
/admin/users/[id]              → user profile: proposals, projects, activity
```

---

## 4. User-Facing App — Page Map

All routes under `/(app)`. All require any authenticated session.

```
/feed                          → unified proposal + activity feed
/discover                      → browse all public proposals

/ideas                         → my proposals (created by me)
/ideas/create                  → submit a new proposal
/ideas/[id]                    → proposal detail with comments + voting

/dashboard/member/proposals    → community proposals with vote controls
/dashboard/member/proposals/create → create proposal (old form, voting schema)
/dashboard/member/proposals/[id]   → proposal detail + comments

/projects/[id]                 → my project dashboard
/projects/[id]/tasks           → my assigned tasks
/projects/[id]/team            → project team (read-only for members)
/projects/[id]/activity        → project activity log
/projects/[id]/progress        → full progress tracker

/profile/[id]                  → public user profile
/settings                      → my account settings
/notifications                 → activity notifications
```

---

## 5. Sync Points: Admin Action → User Sees

Every admin action on a proposal or project must be immediately visible in the user-facing app. The following table defines what changes and where.

| Admin Action | DB Change | User Sees |
|---|---|---|
| Approve proposal | `Proposal.status = approved` | `/ideas/[id]` shows "Approved" badge |
| Reject proposal | `Proposal.status = rejected` | `/ideas/[id]` shows "Rejected" + admin comment |
| Assign stage | `Proposal.stage = planning/architecture/…` | `/ideas/[id]` stage tracker updates |
| Assign project lead | `Proposal.projectLead = userId` | User receives notification, sees lead badge on profile |
| Convert to project | New `Project` created | `/projects/[id]` becomes accessible to members |
| Add member to team | `Project.members[] += userId` | User's `/projects/[id]` nav item appears |
| Assign task | New `Task` { assignedTo: userId } | User sees task in `/projects/[id]/tasks` |
| Update task status | `Task.status = in-progress/completed` | Kanban board updates on `/projects/[id]` |
| Verify project | `Project.verifiedBy = adminId` | Project shows "Verified by Admin" badge |
| Change user role | `User.role = newRole` | User's session role updates on next login |

---

## 6. Admin Proposals Page — Detail Spec

**Route:** `/admin/proposals`

**List view columns:**
- Title
- Type (idea/implementation/…)
- Status badge (proposal / active / approved / rejected)
- Stage badge (proposal → completed pipeline)
- Proposer name + avatar (link to `/admin/users/[id]`)
- Vote count
- Created date

**Filters:**
- Status: all / proposal / active / approved / rejected / closed
- Stage: any stage value
- Type: any type value
- Search: title or description

**Per-proposal actions:**
- View full detail (click row)
- Quick approve / reject (dropdown)

---

## 7. Admin Proposal Detail Page — Spec

**Route:** `/admin/proposals/[id]`

**Left column — Proposal content:**
- Title, description (full text)
- Type, tech stack tags
- Attachments (downloadable)
- Vote count, up/downvote split
- Stage timeline (visual pipeline)
- Comments thread (read-only with admin feedback ability)

**Right column — Proposer profile:**
- Avatar, name, role badge
- University, enrollment number
- Skills list
- Reputation score
- Other proposals by this user
- Link to full profile `/admin/users/[id]`

**Admin controls panel:**
- Status selector: proposal → active → approved / rejected
- Stage selector: proposal → planning → ideation → architecture → setup → development → completed
- Project Lead assignment: search users, assign
- "Convert to Project" button (only when status=approved, assigns to org)
- Leave admin feedback comment
- Disable proposal (status=disabled, hides from public feed)

---

## 8. Admin Projects Page — Detail Spec

**Route:** `/admin/projects`

**List view columns:**
- Title
- Status (planning / active / completed / archived)
- Progress bar (0-100%)
- Lead name + avatar
- Member count
- Created date
- GitHub repo (if linked)

---

## 9. Admin Project Team Page — Spec

**Route:** `/admin/projects/[id]/team`

**Purpose:** Admin forms the team for a project.

**Left panel — Current team:**
- List of members (avatar, name, role, skills)
- Remove member button per row
- Assign role: member / lead per row

**Right panel — Add members:**
- Search all users (name, skills, university)
- Filter by: role, skills, availability
- Add to team button per user
- Shows user's current project load

**API:** `PATCH /api/admin/projects/[id]/team { add: [userId], remove: [userId] }`

---

## 10. Admin Task Assignment Page — Spec

**Route:** `/admin/projects/[id]/tasks`

**Layout:** Kanban board with columns: Pending → In Progress → Completed → Delayed

**Create task form (right panel):**
- Title (required)
- Description
- Assign to: dropdown of project members only
- Priority: low / medium / high
- Deadline: date picker

**Per-task actions (admin):**
- Reassign to different member
- Change priority
- Move status manually
- Delete task

**Per-task actions (project_lead and assignee):**
- Update progress (0-100 slider)
- Move status
- Add notes

**Sync:** When admin creates/reassigns a task, the assignee immediately sees it in `/projects/[id]/tasks`.

---

## 11. API Routes To Build

The following API routes do not yet exist and must be created under `/api/admin/`:

### Proposals (admin-specific)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/proposals/[id]` | Full proposal + proposer profile |
| PATCH | `/api/admin/proposals/[id]` | Update status, stage, projectLead |
| POST | `/api/admin/proposals/[id]/convert` | Convert approved proposal → project |
| POST | `/api/admin/proposals/[id]/feedback` | Admin leaves comment on proposal |

### Projects (admin-specific)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/projects` | List all projects |
| GET | `/api/admin/projects/[id]` | Project detail |
| PATCH | `/api/admin/projects/[id]` | Update status, lead, verify |
| PATCH | `/api/admin/projects/[id]/team` | Add/remove members |
| GET | `/api/admin/projects/[id]/tasks` | List tasks for a project |
| POST | `/api/admin/projects/[id]/tasks` | Create and assign a task |
| PATCH | `/api/admin/projects/[id]/tasks/[taskId]` | Update task status/assignee |
| DELETE | `/api/admin/projects/[id]/tasks/[taskId]` | Delete task |

### Users (admin-specific)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/users/[id]` | Full user profile + their proposals/projects |

---

## 12. Admin Components To Build

All in `src/app/admin/components/`:

| Component | Purpose |
|---|---|
| `ProposalTable.tsx` | Filterable, sortable proposals list |
| `ProposalStatusBadge.tsx` | Color-coded status + stage chips |
| `ProposalAdminControls.tsx` | Approve/reject/stage/lead controls |
| `ProposerCard.tsx` | Right-side proposer profile card |
| `ProjectTable.tsx` | Projects list with progress bars |
| `TeamBuilder.tsx` | Add/remove members with user search |
| `TaskBoard.tsx` | Kanban board for task assignment |
| `TaskCreateForm.tsx` | Create task + assign to member |
| `UserSearchInput.tsx` | Debounced user search for assignments |
| `AdminFeedbackModal.tsx` | Leave admin feedback on proposals |
| `ConvertToProjectModal.tsx` | Convert approved proposal to project |

---

## 13. Normal User Pages To Build / Extend

These user-facing pages need to be created or updated to reflect admin actions:

| Page | What to add |
|---|---|
| `/ideas/[id]` | Show status/stage badges visibly, show admin feedback if rejected, show "Your proposal is approved" if approved |
| `/projects/[id]` | Already exists but should show team members clearly, task progress |
| `/projects/[id]/tasks` | User sees their assigned tasks, can update progress/status |
| `/notifications` | Notify when proposal approved/rejected, when added to team, when assigned a task |

---

## 14. Data Flow Summary

```
User submits proposal
        │
        ▼
   MongoDB: Proposal { status: "proposal" }
        │
        │  Community votes
        ▼
   MongoDB: Proposal { status: "active", totalVotes: 10+ }
        │
        │  Admin: /admin/proposals → click row → approve
        ▼
   MongoDB: Proposal { status: "approved", stage: "planning" }
        │
        │  Admin: assign projectLead, click Convert
        ▼
   MongoDB: Project { status: "planning", lead: userId }
            Proposal { stage: "setup" }
        │
        │  Admin: /admin/projects/[id]/team → add members
        ▼
   MongoDB: Project { members: [userId1, userId2, ...] }
        │
        │  Admin: /admin/projects/[id]/tasks → create tasks
        ▼
   MongoDB: Task { projectId, assignedTo: userId, status: "pending" }
        │
        │  User: /projects/[id]/tasks → sees task, updates progress
        ▼
   MongoDB: Task { status: "in-progress", progress: 60 }
        │
        │  All tasks complete
        ▼
   MongoDB: Project { progress: 100, status: "completed" }
        │
        │  Admin verifies
        ▼
   MongoDB: Project { verifiedBy: adminId, status: "archived" }
            Proposal { stage: "completed" }
```

---

## 15. Build Order

Implement in this sequence to avoid dependencies blocking work:

**Phase 1 — Admin Proposals Control (this sprint)**
1. `GET /api/admin/proposals/[id]` — full detail + proposer
2. `PATCH /api/admin/proposals/[id]` — approve/reject/stage (already partially exists)
3. `POST /api/admin/proposals/[id]/convert` — create project from proposal
4. `/admin/proposals` page — proposals table with filters
5. `/admin/proposals/[id]` page — full detail with ProposerCard + controls

**Phase 2 — Project & Team Management**
6. `GET/PATCH /api/admin/projects` — list + detail
7. `PATCH /api/admin/projects/[id]/team` — add/remove members
8. `/admin/projects` page — projects table
9. `/admin/projects/[id]/team` page — TeamBuilder component

**Phase 3 — Task Assignment**
10. `POST/PATCH /api/admin/projects/[id]/tasks` — task CRUD
11. `/admin/projects/[id]/tasks` page — Kanban board (TaskBoard component)

**Phase 4 — User Sync**
12. Update `/ideas/[id]` — show admin status/stage/feedback
13. Update `/projects/[id]/tasks` — assigned tasks view for members
14. Notifications — on proposal approval, team add, task assignment
