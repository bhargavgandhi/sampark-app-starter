---
name: scaffold-app
description: Turn this template into a new, deployable Sampark team app from one slug — fills in firebase.json, the 3 deploy workflows, vite.config.ts, and mount.tsx consistently, then prints the manual setup checklist and the manifest entry for register-app.
---

# Scaffold App

Generates all the slug-derived config for a new Sampark team app from a single input, so no file gets a typo'd or half-updated value. Run this once, right after cloning the template.

## Step 1 — Get the slug

Ask the user for their app's slug if not already given: a short, URL-safe, kebab-case identifier (e.g. `career-portal`, `time-off-tracker`). This becomes:

- Firebase Hosting site names: `<slug>` (prod), `qa-<slug>` (qa), `dev-<slug>` (dev)
- The route prefix the shell will mount the app at: `/app/<slug>`
- `metadata.name` in `src/mount.tsx`

Also ask for the **Firebase project ID** to deploy into. This is not derived from the slug — multiple apps commonly share one Firebase project with per-app hosting sites (that's how career-portal is set up: one project, three per-env sites). Suggest reusing the existing shared project if the user knows one; otherwise they'll create a new one in Step 2 below.

Do not proceed to Step 3 until both values are confirmed back to the user.

## Step 2 — Guided-manual checklist (print this, do not attempt to automate it)

These steps happen outside this repo, in the Firebase console / `gcloud`/`firebase` CLIs / GitHub settings. Print this checklist with the actual slug and project ID substituted in, before touching any files:

```
[ ] 1. Firebase project: confirm `<project-id>` exists (Firebase console), or create it.
[ ] 2. Create 3 Hosting sites in that project:
       firebase hosting:sites:create <slug>
       firebase hosting:sites:create qa-<slug>
       firebase hosting:sites:create dev-<slug>
[ ] 3. Register hosting targets (run from this repo once Step 3 below has written firebase.json):
       firebase target:apply hosting <slug> <slug>
       firebase target:apply hosting qa-<slug> qa-<slug>
       firebase target:apply hosting dev-<slug> dev-<slug>
[ ] 4. Create a GCP service account per environment with the "Firebase Hosting Admin" role,
       and export its JSON key. This step is fully manual — do it in the GCP console or via
       `gcloud iam service-accounts create`, then `gcloud iam service-accounts keys create`.
[ ] 5. Add 3 GitHub repo secrets (Settings → Environments → dev/qa/production → Secrets),
       pasting each service account's JSON key:
       - FIREBASE_SERVICE_ACCOUNT_DEV
       - FIREBASE_SERVICE_ACCOUNT_QA
       - FIREBASE_SERVICE_ACCOUNT_PROD
[ ] 6. Hand the manifest entry printed at the end of this skill to whoever runs register-app
       against the sampark-app shell repo (or run it yourself if you have that repo checked out).
```

## Step 3 — Fill in the slug-derived config

Replace every occurrence of the placeholder values below, consistently, across exactly these files. Do not touch any other file.

| Placeholder | Replace with |
|---|---|
| `your-team-app` | `<slug>` |
| `qa-your-team-app` | `qa-<slug>` |
| `dev-your-team-app` | `dev-<slug>` |
| `your-sampark-project` | `<project-id>` |

Files to edit:

1. **`firebase.json`** — the three `"site"` values.
2. **`vite.config.ts`** — the three `BASE_URLS` entries (`production`, `qa`, `development`).
3. **`.github/workflows/deploy-dev.yml`** — `firebase_project_id`, `hosting_target`, and the `bundleUrl` inside the `loadBundle.json` heredoc.
4. **`.github/workflows/deploy-qa.yml`** — same three spots, qa values.
5. **`.github/workflows/deploy-prod.yml`** — same three spots, prod values.
6. **`src/mount.tsx`** — `metadata.name` (drop the `// replace with your team slug` comment once it's filled in).

Do **not** create a `.firebaserc` file — this template intentionally passes `firebase_project_id` directly per-workflow instead (matches career-portal's actual shipped setup, not its stale planning doc).

After editing, run `grep -rn "your-team-app\|your-sampark-project" firebase.json vite.config.ts .github/workflows/ src/mount.tsx` and confirm it returns nothing — that's the check that every placeholder was actually replaced.

Do not edit anything under `src/test/` — those tests derive their expected values from `firebase.json`/`vite.config.ts` at run time rather than hardcoding the placeholder slug, specifically so they keep passing unmodified after this step. Run `yarn lint && yarn typecheck && yarn test:run && yarn build` after editing to confirm nothing broke.

## Step 4 — Print the manifest entry for register-app

Once Step 3 is done, print this JSON (filled in) for the user to pass to the `register-app` skill in the `sampark-app` shell repo:

```json
{
  "slug": "<slug>",
  "version": "0.0.1",
  "getBundleUrl": "https://<slug>.web.app/loadBundle",
  "routePrefix": "/app/<slug>",
  "requiredEntitlements": []
}
```

Note per environment: `getBundleUrl` should point at `https://dev-<slug>.web.app/loadBundle` for the dev manifest and `https://qa-<slug>.web.app/loadBundle` for the qa manifest — print all three variants, one per environment, since `register-app` needs to insert into `manifest.dev.json`, `manifest.qa.json`, and `manifest.prod.json` separately.

## What NOT to do

- Don't create a `.firebaserc` file (see Step 3).
- Don't attempt to automate Step 2 — Firebase/GCP project and service-account creation stay manual by design (no `gcloud`/`firebase` mutating commands run by this skill).
- Don't touch `README.md` or other prose docs — this skill only edits the deployable config files listed in Step 3.
- Don't guess the Firebase project ID — always confirm it with the user in Step 1.
