# Team App — Agent Guidelines

## Architecture
- This app compiles to a single ESM bundle (`dist/mount.js`) loaded by the Sampark shell.
- The shell calls `mount(props: MountProps)` — your entry point is `src/mount.tsx`.
- Platform contract types live in `src/platform.d.ts` — never edit this file.
- React and `@sampark-app/ui` are provided by the shell at runtime; do not bundle them.

## Imports
- Types: import from `./platform` (local `src/platform.d.ts`).
- UI components: import from `@sampark-app/ui`.
- Never import React directly for JSX — the JSX transform handles it.
- Never add `@sampark-app/ui` or `react` to vite `external[]` removals.

## MountProps — what you get from the shell
- `user` — authenticated user (`id`, `firstName`, `lastName`, `email`)
- `can(key)` — `(key: string) => boolean` — synchronous permission check
- `csrfToken` — include as `X-CSRF-Token` on all mutating requests
- `navigate(path)` — navigate within the shell router
- `events` — event bus (`emit` / `on`) for shell ↔ app signalling
- `basePath` — your router's basename (e.g. `/app/your-slug`)
- `contractVersion` — guard against incompatible shell versions

## Networking

This template ships two data-layer scaffolds with two different, both-intentional auth patterns — don't unify them:

- **GraphQL** (`src/core/graphql/client.ts`, default once you've pointed `codegen.ts` and `VITE_GRAPHQL_ENDPOINT` at a real backend) — use Apollo codegen'd hooks (`yarn codegen`). Auth is `Authorization: Bearer <token>` where `token = localStorage.getItem('ApplicationToken')`. This is not a general license to use localStorage for tokens — it's specifically for the Sampark shell's Firebase-JWT handoff, which the GraphQL backend authenticates against directly.
- **REST** (`src/core/apiClient.ts`, axios) — use for endpoints with no GraphQL operation. Sends `withCredentials: true` and, once `configureApiClient(csrfToken)` runs, `X-CSRF-Token` on mutating requests automatically. Don't hand-roll `fetch()` for REST.
- Always use `AbortController` for any `fetch()`-based work inside `useEffect` and abort on cleanup (Apollo/axios handle their own request lifecycle).

## Permissions
- Use `props.can('resource:action')` for UI gating only (show/hide elements).
- The backend enforces permissions independently — never rely on frontend gating for security.

## Routing
- Pass `basename={props.basePath}` to `BrowserRouter` if using react-router-dom.
- Use `props.navigate(path)` for programmatic navigation — never `window.location`.

## Cleanup
- Return an unmount function from `mount()` that calls `root.unmount()`.
- Abort all in-flight fetch requests on unmount.

## Bundle hygiene
- Target: under 4 MB for `dist/mount.js` (enforced by `scripts/validate-bundle.mjs`) — stay well under that in practice; a bare app with no features is ~400 KB.
- Never modify the `external` list in `vite.config.ts`.
- Run `yarn build` to validate — `validate-bundle.mjs` enforces size + externals.
- No `console.log` in production code; use conditional checks on `import.meta.env.DEV`.
