# Team App — Agent Guidelines

## Imports
- Don't import React directly for JSX; the JSX transform handles it.
- Import from `@bg09/platform` for types only (no runtime code available from it).
- Import from `@bg09/ui` for UI components.

## Networking
- Always pass `credentials: 'include'` to every `fetch()` call.
- Always include `csrfToken` as `X-CSRF-Token` header on non-GET requests.
- Never store tokens or credentials in state, localStorage, or cookies.

## Permissions
- Use `props.can('resource:action')` for UI gating only.
- The backend enforces permissions independently; never rely solely on frontend gating.

## Cleanup
- Return an unmount function from `mount()` that calls `root.unmount()` and aborts pending fetch requests.
- Use `AbortController` for all fetches inside `useEffect`.

## Bundle budget
- Target: under 100 KB for `dist/mount.js`.
- Never remove or modify the `external` list in `vite.config.ts`.
- The `validate-bundle.mjs` script will fail the build if React or `@bg09/ui` is inlined.

## Routing
- If using `react-router-dom`, pass `basename={props.basePath}` to `BrowserRouter`.
- Never use `window.location` for navigation; use `props.navigate(path)`.
