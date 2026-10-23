# Connecting Syncro / AutoSRE to GitHub (GitHub App)

Syncro & AutoSRE open pull requests as their **own robot**, `<your-app-name>[bot]`. It isn't you, and it can only touch the
repository you pick, with only the permissions below. Its access keys expire every hour and renew automatically (`RENEW_BEFORE_SECONDS = 300`).

> Without any server keys configured, Syncro still syncs public repositories directly from `https://api.github.com` and lets developers authenticate on-demand via Browser Device Login or local Git Credential Manager.

## Step 1: Create the GitHub App

github.com → your profile picture → **Settings** → (bottom left) **Developer settings** → **GitHub Apps** → **New GitHub App**.

Fill in only these fields:

| Field | Value |
|---|---|
| GitHub App name | `Syncro AutoSRE Zero-Ops` (must be unique on GitHub) |
| Homepage URL | `https://project-syncroo.netlify.app` |
| Callback URL | *leave empty* |
| Request user authorization (OAuth) during installation | **unticked** |
| Setup URL | `https://project-syncroo.netlify.app/api/github/callback` |
| Redirect on update | **ticked** |
| Webhook → Active | **unticked** (Syncro polls & syncs the PR directly) |

**Repository permissions.** Leave everything else on "No access":

| Permission | Access | Why |
|---|---|---|
| Contents | Read and write | push the fix branch |
| Pull requests | Read and write | open the PR, comment, mark ready, label, merge |
| Checks | Read-only | read CI results |
| Commit statuses | Read-only | read CI results |
| Metadata | Read-only | required by GitHub (set automatically) |

## Step 2: Get the App ID and private key

1. On the App's page, copy the **App ID** (a number near the top).
2. Scroll to **Private keys**, click **Generate a private key**, and a `.pem` file downloads.
3. Move it to `secrets/github-app.pem` inside the project (or set `GITHUB_APP_PRIVATE_KEY` in Netlify environment variables).

## Step 3: Configure `.env`

```ini
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY_PATH=secrets/github-app.pem
# Or inline PEM string on Netlify:
# GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

## Step 4: Install it (the "Connect GitHub" button)

1. Admin Control Room → **Pull Requests** → **Connect GitHub**.
2. `/api/github/connect` generates a 24-byte one-time `state` token (valid 15 minutes) and redirects to GitHub's installation page.
3. Choose **Only select repositories**, pick your repository (e.g. `shv-codes/zero-ops-autosre`), and click **Install**.
4. `/api/github/callback` verifies the `state` token in constant time, verifies the installation belongs to your App ID, checks repository access, saves `githubInstallationId` + `githubAccount`, and redirects back with `?github=connected`.

## API Contract (`/api/github/*`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/github/status?projectId=...` | Returns `GitHubStatus` (`auth_mode`, `connected`, `installation_id`, `account`, `app.bot_login`, `token_expires_in_seconds`) |
| GET | `/api/github/connect?projectId=...` | 302 redirect to `https://github.com/apps/<slug>/installations/new?state=<one-time-state>` |
| GET | `/api/github/callback` | Verifies `state` + `installation_id` + repo access, saves installation, redirects with `?github=connected` |
| POST | `/api/github/disconnect` | Clears `githubInstallationId` and `githubAccount` and logs audit event |
