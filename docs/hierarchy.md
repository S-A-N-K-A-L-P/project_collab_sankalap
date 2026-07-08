# S.A.N.K.A.L.P. — Platform Hierarchy & Organization Workflow

> The canonical reference for user tiers, organization tiers, capacity rules,
> reputation, and trust metrics. Product + engineering source of truth.
> Admin-tunable values live in [`config.md`](./config.md).

---

## 1. Design Philosophy

Three principles drive every limit in this document:

1. **Limit execution capacity, not enthusiasm.** We don't cap votes to stop
   spam — we cap *active commitments* so nobody appears active in 25 projects.
   Credibility comes from finishing, not joining.
2. **Support carries weight.** Backing a proposal means *"I am willing to
   contribute"* — so support is a scarce credit, not an infinite like button.
3. **Let the data speak.** No insulting labels ("fraudster", "show-off").
   Objective metrics + earned badges replace subjective judgment.

---

## 2. User Tiers

### 2.1 Free Student — ₹0

Designed for a typical university student. A student rarely contributes
meaningfully to more than 3–5 projects simultaneously — limits reflect that.

| Capability | Limit |
|---|---|
| Organization memberships | **2** |
| Active projects | **4** |
| Proposal creation | **1 per 30 days** |
| Proposal support credits | **5–7 per week** |
| Projects led | **1** |
| Analytics | Basic |
| Profile | Standard |

### 2.2 Professional — ₹200/month

For students who are genuinely active. Deliberately **not unlimited** —
unlimited encourages spam.

| Capability | Limit |
|---|---|
| Organization memberships | **10–20** |
| Active projects | **7** |
| Proposal creation | **3–5 per month** |
| Proposal support credits | Higher weekly allowance |
| Visibility | Boosted in feed & discovery |
| Analytics | Advanced |
| Proposal review | **Priority queue** |
| Profile | **Premium** (badge, customization) |

### 2.3 Founder Pack — ₹500–₹2,000/month

The revenue plan. Unlocks organization ownership.

| Capability | Included |
|---|---|
| Create organization | ✅ |
| Brand organization (logo, theme, custom pages) | ✅ |
| Recruit members | ✅ |
| Charge paid memberships | ✅ |
| Organization analytics | ✅ |
| Marketplace access (sell scripts/templates) | ✅ |
| Organization dashboard | ✅ |
| API integrations | ✅ |
| Custom domain | Planned |

**Pricing scales with organization size** (billed on the highest member-count
band reached during the cycle):

| Members | Price / month |
|---|---|
| 0–50 | ₹500 |
| 51–200 | ₹1,000 |
| 201–500 | ₹1,500 |
| 500+ | ₹2,000+ |

### 2.4 Tier comparison at a glance

| | Free Student | Professional | Founder Pack |
|---|---|---|---|
| Price | ₹0 | ₹200/mo | ₹500–₹2,000/mo |
| Org memberships | 2 | 10–20 | 10–20 |
| Active projects | 4 | 7 | 7 |
| Proposals | 1 / 30 days | 3–5 / month | 3–5 / month |
| Lead projects | 1 | Multiple | Multiple |
| Own organizations | — | — | ✅ |
| Analytics | Basic | Advanced | Org-level |
| Priority review | — | ✅ | ✅ |

---

## 3. Organization Tiers

Organization **owners decide** how their org operates — very similar to how
companies define internal policy. The platform provides the levers; the org
sets the values.

| Org type | Who can join | Fee |
|---|---|---|
| **Free** | Anyone | ₹0 |
| **Standard** | Anyone, owner-approved | Owner-defined |
| **Premium** | Application + fee | Owner-defined |
| **Research** | Curated, credential-based | Owner-defined |
| **Invite Only** | Invitation only | Owner-defined |

Each organization configures its own:

- **Membership fee** (₹0 or paid; platform takes a commission — see config)
- **Project limits** (max concurrent org projects)
- **Voting rights** (who may support internal proposals)
- **Internal permissions** (roles: owner → admin → lead → member → observer)
- **Team capacity** (max members per project team)

### Organization internal role ladder

| Role | Powers |
|---|---|
| **Owner** | Everything; billing; delete org; transfer ownership |
| **Admin** | Manage members, approve proposals, configure org settings |
| **Project Lead** | Manage one project: tasks, team, scope |
| **Member** | Join projects, submit proposals, vote (if enabled) |
| **Observer** | Read-only (useful for Research orgs) |

---

## 4. Capacity Model (the core mechanic)

### 4.1 Active Project Capacity

**Don't limit votes. Limit execution capacity.**

Every user has `maxActiveProjects` (by tier). Joining a project consumes a
slot; completing or leaving frees it.

```
User at capacity (e.g. 4/4) tries to join project #5
        │
        ▼
┌─────────────────────────────────────┐
│  "You're at capacity. To join,      │
│   leave one active project:"        │
│   ○ Leave Project A                 │
│   ○ Leave Project B                 │
│   ○ Leave Project C                 │
│   ○ Leave Project D                 │
│   ○ Cancel                          │
└─────────────────────────────────────┘
```

Leaving a project **before completion** is recorded and feeds the
**Commitment Score** (§5.4). Joining is cheap; abandoning is not.

### 4.2 Proposal Support Credits

Replaces "20 upvotes/day" with **Support Credits — 7 per week** (tier-scaled).

- Supporting a proposal costs **1 credit**.
- Credits refresh weekly (rolling window, no hoarding beyond 1 week's worth).
- Withdrawing support within 24h refunds the credit; after that it's spent.
- A support is a public, weighted signal: *"I am willing to contribute."*

---

## 5. Reputation System

### 5.1 Objective metrics (no labels, just math)

| Metric | Formula |
|---|---|
| **Execution Rate** | Completed Projects ÷ Supported Projects |
| **Proposal Success Rate** | Approved ÷ Submitted |
| **Completion %** | Finished Tasks ÷ Assigned Tasks |

Displayed on every profile as plain numbers:

```
Proposals Submitted: 47
Approved:            22
Converted to Projects: 18
Completed:           16
Execution Rate:      89%
```

### 5.2 Public badges (earned, never negative)

| Badge | Condition |
|---|---|
| 🌱 **Beginner** | < 3 completed projects |
| 🚀 **Executor** | ≥ 80% completion rate |
| 🛠 **Reliable** | 20+ completed tasks |
| 🎯 **Consistent** | 6-month activity streak |
| 🧠 **Architect** | 5 successful proposals |
| 🏆 **Founder** | Successful organization owner |

Badges are computed nightly from metrics — never manually assigned, never
revoked as punishment (they simply stop being true).

### 5.3 Organization Trust Score

Every organization exposes a public trust card so users can decide whether
it's worth joining:

```
Members:                134
Projects Started:        52
Projects Completed:      43
Completion Rate:        82%
Avg. Response Time:   2.1 days
Verified Founder:        ✅
KYC Verified:            ✅
```

### 5.4 Commitment Score (0–100)

The platform is about **following through**. The Commitment Score captures it:

```
                    Projects Completed × W₁  −  Projects Abandoned × W₂
Commitment Score =  ─────────────────────────────────────────────────── × 100
                              Projects Joined × W₁
```

- Someone who repeatedly joins and abandons projects trends down.
- Someone who consistently finishes builds a strong professional reputation.
- New users start at a neutral **75** (not 100 — headroom to earn, cushion to learn).
- Weights (W₁, W₂), floor/decay behavior are admin-tunable (see `config.md`).

Shown as: `Commitment Score: 92/100` on profiles, and used as a soft signal
in team-formation and proposal-review ranking.

---

## 6. Lifecycle Flows

### 6.1 Proposal → Project

```
Draft ──▶ Submitted ──▶ Support window (credits accumulate)
                              │
              threshold met   │   threshold not met in N days
                              ▼                    ▼
                        Org/Admin review        Archived
                              │
                  approved    │    rejected (with reason)
                              ▼
                    Project created ──▶ Team formation (capacity-checked)
                                              │
                                              ▼
                                   Active ──▶ Completed / Abandoned
                                   (feeds all reputation metrics)
```

### 6.2 Organization creation (Founder Pack)

```
User buys Founder Pack (Razorpay)
   ▶ Creates org (name, brand, type: Free/Standard/Premium/Research/Invite)
   ▶ Configures: fees, project limits, voting rights, roles, capacity
   ▶ Recruits members (subject to each member's org-membership limit)
   ▶ Org Trust Score starts accruing from first project
```

---

## 7. Enforcement Summary

| Rule | Enforced at | Mechanism |
|---|---|---|
| Org membership cap | Join request | Hard block + upgrade prompt |
| Active project cap | Project join | "Leave one to join" dialog |
| Proposal frequency | Proposal create | Cooldown timer shown |
| Support credits | Support click | Weekly credit balance |
| Lead limit | Lead assignment | Hard block (Free tier) |
| Org size pricing | Billing cycle | Auto band upgrade |
| Abandonment | Project leave | Commitment Score hit + confirm dialog |

All numeric values above are **defaults** — the master admin can tune every
one of them from the admin portal without a deploy. See
[`config.md`](./config.md).
