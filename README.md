# Sampark Team App Starter

A template for building micro-frontend apps that integrate with the Sampark shell.

## What this is

Your app compiles to a single ES module (`dist/mount.js`) that the Sampark shell loads at runtime. The shell provides authentication (via cookie), permissions, navigation, and an event bus — you just build features.

## First 5 minutes

1. **Install:** `yarn install`
2. **Build:** `yarn build`
3. **Check output:** `ls -lh dist/mount.js` — should be under 100 KB

> `@bg09/platform` and `@sampark-app/ui` are public packages on npm — no token needed.

## How to ship

Send `dist/mount.js` to your platform contact. They'll:
1. Copy it to `apps/sampark-new/public/test-bundles/<your-slug>/mount.js`
2. Add an entry to `manifest.dev.json`
3. Deploy to the dev environment and send you the URL

## The contract (`MountProps` fields)

Your app's `mount(props: MountProps)` receives:

| Field | Type | Description |
|-------|------|-------------|
| `container` | `HTMLElement` | The DOM element to render into |
| `basePath` | `string` | Your router's basename (e.g. `/app/your-slug`) |
| `contractVersion` | `string` | Shell version (e.g. `1.0`). Guard against breaking changes. |
| `user` | `User` | Authenticated user: `id`, `firstName`, `lastName`, `email` |
| `can` | `CanFn` | `(key: string) => boolean` — synchronous permission check |
| `navigate` | `NavigateFn` | Navigate the shell's router |
| `events` | `EventBus` | Shell ↔ app event bus |
| `csrfToken` | `string` | Include as `X-CSRF-Token` header on mutating requests |

See [@bg09/platform on npm](https://www.npmjs.com/package/@bg09/platform) for the full TypeScript definitions.

## Bundle budget

Your bundle must be **under 100 KB**. The `validate-bundle.mjs` script enforces this and also checks that React and `@sampark-app/ui` are not inlined (they're provided by the shell).

## Routing

If using `react-router-dom`:
```tsx
<BrowserRouter basename={props.basePath}>
  ...
</BrowserRouter>
```

## Networking

Always use `credentials: 'include'` and include the CSRF token on mutating requests:
```ts
fetch('/api/my-endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': props.csrfToken },
  body: JSON.stringify(data),
});
```
