# Sampark Team App Starter

A template for building micro-frontend apps that integrate with the Sampark shell.

## What this is

Your app compiles to a single ES module (`dist/mount.js`) that the Sampark shell loads at runtime. The shell provides authentication (via cookie), permissions, navigation, and an event bus — you just build features.

## Prerequisites

- Node.js 20+
- Yarn 4 (`corepack enable`)

## First 5 minutes

1. **Use this template** — click "Use this template" on GitHub to create your repo
2. **Install:** `yarn install`
3. **Build:** `yarn build`
4. **Check output:** `ls -lh dist/mount.js` — should be under 100 KB

> `@sampark-app/ui` is a public package on npm — no token needed.
> Platform contract types are bundled locally in `src/platform.d.ts` — no separate package to install.

## Project structure

```
src/
  mount.tsx       ← entry point — exports the FeatureModule
  App.tsx         ← your root component
  platform.d.ts   ← MountProps contract types (provided by shell team, do not edit)
scripts/
  validate-bundle.mjs  ← enforces bundle budget + checks externals
```

## How to ship

Send `dist/mount.js` to your platform contact. They'll:
1. Copy it to `apps/sampark-new/public/test-bundles/<your-slug>/mount.js`
2. Add an entry to `manifest.dev.json`
3. Deploy to the dev environment and send you the URL

## The contract (`MountProps` fields)

Your `mount(props: MountProps)` receives:

| Field | Type | Description |
|-------|------|-------------|
| `container` | `HTMLElement` | The DOM element to render into |
| `basePath` | `string` | Your router's basename (e.g. `/app/your-slug`) |
| `contractVersion` | `string` | Shell contract version (e.g. `1.0`) |
| `user` | `User` | Authenticated user: `id`, `firstName`, `lastName`, `email` |
| `can` | `CanFn` | `(key: string) => boolean` — synchronous permission check |
| `navigate` | `NavigateFn` | Navigate within the shell's router |
| `events` | `EventBus` | Shell ↔ app event bus (`emit` / `on`) |
| `csrfToken` | `string` | Include as `X-CSRF-Token` on mutating requests |

Full type definitions are in `src/platform.d.ts`.

## Bundle budget

Your bundle must be **under 100 KB**. The `validate-bundle.mjs` script enforces this and checks that React and `@sampark-app/ui` are not inlined (they're provided by the shell at runtime).

## Routing

If using `react-router-dom`:
```tsx
<BrowserRouter basename={props.basePath}>
  ...
</BrowserRouter>
```

## Networking

Always use `credentials: 'include'` and pass the CSRF token on mutating requests:
```ts
fetch('/api/my-endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': props.csrfToken },
  body: JSON.stringify(data),
});
```

## Updating the contract

When the shell team updates `MountProps`, they'll send you a new `src/platform.d.ts`. Replace the existing file and fix any TypeScript errors — those are the breaking changes you need to handle.
