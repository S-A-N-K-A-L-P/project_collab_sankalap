# S.A.N.K.A.L.P. — Master Admin Portal Configuration

> Every tunable knob behind the hierarchy defined in
> [`hierarchy.md`](./hierarchy.md). Values here are **runtime configuration**,
> editable from the admin portal by the `master_admin` role — changing them
> must never require a redeploy.

---

## 1. Roles & Access

Existing platform roles (from `src/models/User.ts`):

| Role | Config access |
|---|---|
| `user` | None |
| `sankalp_member` | None |
| `sankalp_associate` | **Read-only** view of config + moderation queue |
| `master_admin` | **Full read/write** on everything below |

Rules:

- Every config write is **audit-logged**: `{ who, when, key, oldValue, newValue }`.
- Destructive changes (deleting a tier, disabling payments) require a typed
  confirmation ("type the tier name to confirm").
- Config is stored in a single versioned document (`platform_config`
  collection, MongoDB) with a `version` counter — the API serves the latest,
  and any previous version can be restored in one click.

---

## 2. Config Sections

### 2.1 Plans & Pricing (`plans`)

Controls §2 of hierarchy.md.

```jsonc
{
  "plans": {
    "free": {
      "label": "Free Student",
      "priceInr": 0,
      "maxOrgMemberships": 2,
      "maxActiveProjects": 4,
      "proposalCooldownDays": 30,
      "proposalsPerCycle": 1,
      "supportCreditsPerWeek": 7,
      "maxProjectsLed": 1,
      "analytics": "basic"
    },
    "professional": {
      "label": "Professional",
      "priceInr": 200,
      "billingCycle": "monthly",
      "maxOrgMemberships": 20,
      "maxActiveProjects": 7,
      "proposalsPerMonth": 5,
      "supportCreditsPerWeek": 14,
      "maxProjectsLed": 3,
      "analytics": "advanced",
      "priorityReview": true,
      "premiumProfile": true,
      "feedVisibilityBoost": 1.5
    },
    "founder": {
      "label": "Founder Pack",
      "billingCycle": "monthly",
      "inheritsFrom": "professional",
      "canCreateOrganizations": true,
      "maxOrganizationsOwned": 3,
      "sizePricingBands": [
        { "maxMembers": 50,  "priceInr": 500  },
        { "maxMembers": 200, "priceInr": 1000 },
        { "maxMembers": 500, "priceInr": 1500 },
        { "maxMembers": null, "priceInr": 2000 }
      ]
    }
  }
}
```

Admin UI: editable table per plan; band editor for founder pricing;
"preview as user" button to see the paywall each plan produces.

### 2.2 Organization Policy (`organizations`)

```jsonc
{
  "organizations": {
    "allowedTypes": ["free", "standard", "premium", "research", "invite_only"],
    "platformCommissionPct": 10,        // cut of paid org memberships
    "maxMembershipFeeInr": 5000,        // ceiling an org may charge
    "maxConcurrentProjectsDefault": 10, // org owner can lower, not raise past this
    "maxTeamSizeDefault": 8,
    "kycRequiredForPaidOrgs": true,
    "founderVerificationRequired": true,
    "trustScore": {
      "recalcIntervalHours": 24,
      "minProjectsForScore": 3          // below this, show "New organization"
    }
  }
}
```

### 2.3 Capacity & Credits (`capacity`)

The §4 mechanics of hierarchy.md.

```jsonc
{
  "capacity": {
    "enforceActiveProjectCap": true,
    "leaveToJoinDialog": true,          // the "choose one to leave" flow
    "supportCredits": {
      "refundWindowHours": 24,
      "rolloverAllowed": false,
      "weekStartsOn": "monday"
    },
    "abandonment": {
      "confirmDialog": true,
      "graceWindowDays": 3              // leaving within N days of joining = no penalty
    }
  }
}
```

### 2.4 Reputation & Badges (`reputation`)

```jsonc
{
  "reputation": {
    "commitmentScore": {
      "startingScore": 75,
      "completedWeight": 1.0,           // W₁
      "abandonedWeight": 2.0,           // W₂ — abandoning hurts 2× more
      "floor": 20,
      "decayAfterInactiveDays": 180,    // slow drift toward neutral
      "showOnProfile": true
    },
    "badges": [
      { "id": "beginner",   "emoji": "🌱", "label": "Beginner",   "rule": "completedProjects < 3" },
      { "id": "executor",   "emoji": "🚀", "label": "Executor",   "rule": "completionRate >= 0.80" },
      { "id": "reliable",   "emoji": "🛠", "label": "Reliable",   "rule": "completedTasks >= 20" },
      { "id": "consistent", "emoji": "🎯", "label": "Consistent", "rule": "activityStreakMonths >= 6" },
      { "id": "architect",  "emoji": "🧠", "label": "Architect",  "rule": "successfulProposals >= 5" },
      { "id": "founder",    "emoji": "🏆", "label": "Founder",    "rule": "ownsSuccessfulOrg == true" }
    ],
    "badgeRecalcCron": "0 2 * * *"      // nightly at 02:00 IST
  }
}
```

Admin UI: badge threshold editor with live count of how many users would
gain/lose each badge before saving.

### 2.5 Proposals (`proposals`)

```jsonc
{
  "proposals": {
    "supportThresholdToReview": 10,     // credits needed to enter review
    "supportWindowDays": 21,            // archive if threshold not met
    "requireRejectionReason": true,
    "priorityQueueForPaidTiers": true,
    "maxOpenProposalsPerUser": 3
  }
}
```

### 2.6 Payments (`payments`)

Razorpay wiring (see `src/app/api/payments/razorpay/*`). **Key secrets stay
in environment variables — never in this config document.** This section only
holds non-secret behavior.

```jsonc
{
  "payments": {
    "provider": "razorpay",
    "currency": "INR",
    "proUpgradeAmountPaise": 100,       // ₹1 test; ₹20000 = ₹200 live
    "webhookEnabled": true,
    "gracePeriodDaysOnFailedRenewal": 5,
    "refundPolicy": "manual",           // manual | auto_7d
    "invoicePrefix": "SNKLP"
  }
}
```

| Secret | Lives in | Used by |
|---|---|---|
| `RAZORPAY_KEY_ID` | Netlify env | order + checkout |
| `RAZORPAY_KEY_SECRET` | Netlify env | order + HMAC verify |
| `RAZORPAY_WEBHOOK_SECRET` | Netlify env | webhook verify |

### 2.7 Moderation (`moderation`)

```jsonc
{
  "moderation": {
    "reportsToAutoHide": 5,             // content hidden pending review
    "reviewQueueRoles": ["sankalp_associate", "master_admin"],
    "bannedWordsListId": "default",
    "appealWindowDays": 14,
    "noNegativeLabels": true            // hard rule from hierarchy.md §1.3
  }
}
```

### 2.8 Feature Flags (`features`)

For staged rollout — flip without deploying.

```jsonc
{
  "features": {
    "portfolioBuilder": true,
    "proUpgrade": true,
    "desktopAppLanding": true,
    "marketplace": true,
    "organizations": false,             // hierarchy rollout gate
    "supportCredits": false,
    "commitmentScore": false,
    "orgTrustScore": false,
    "customDomains": false
  }
}
```

Recommended rollout order: `organizations` → `supportCredits` →
`commitmentScore` → `orgTrustScore` (each depends on data from the previous).

---

## 3. Admin Portal Pages (route map)

All under `/admin`, gated by `role === "master_admin"`
(read-only for `sankalp_associate`):

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Existing — overview, headline metrics |
| `/admin/config/plans` | §2.1 plan & pricing editor |
| `/admin/config/organizations` | §2.2 org policy |
| `/admin/config/capacity` | §2.3 capacity + credits |
| `/admin/config/reputation` | §2.4 weights + badge thresholds |
| `/admin/config/proposals` | §2.5 proposal pipeline |
| `/admin/config/payments` | §2.6 non-secret payment behavior |
| `/admin/config/moderation` | §2.7 moderation levers |
| `/admin/config/features` | §2.8 feature flags |
| `/admin/config/audit` | Audit log + version restore |

### API surface

```
GET   /api/admin/config              → full config (role-gated)
PATCH /api/admin/config/:section     → update one section (master_admin only)
GET   /api/admin/config/audit        → change history
POST  /api/admin/config/restore/:v   → restore a previous version
```

Server-side validation: each section has a zod schema; a PATCH that fails
validation is rejected wholesale (no partial writes).

---

## 4. Implementation Notes

- **Storage**: single `platform_config` document + `platform_config_history`
  collection (one doc per version). Read path is cached in-memory for 60s.
- **Client access**: public, non-sensitive values (plan prices, limits) are
  exposed via `GET /api/config/public` so paywalls and limit dialogs render
  correct numbers without shipping admin data.
- **Defaults**: the values in this file are the seed defaults; on first boot
  the app writes them to Mongo if no config document exists.
- **Never in config**: API secrets, JWT secrets, DB URIs — environment
  variables only.
