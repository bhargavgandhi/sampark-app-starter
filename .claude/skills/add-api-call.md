---
name: add-api-call
description: Add a correctly structured API call — GraphQL via codegen'd Apollo hooks (default) or REST via the shared apiClient (fallback). Use this whenever adding a data fetch or mutation.
---

# Add API Call

This template ships two data-layer scaffolds with two different, both-intentional auth patterns. Use GraphQL by default once it's configured; fall back to REST for anything with no GraphQL operation.

## GraphQL (default, once configured)

1. Point `codegen.ts`'s schema endpoint and `VITE_GRAPHQL_ENDPOINT` (`.env.local`) at your real backend.
2. Add the query/mutation to a `.ts`/`.tsx` file under `src/` (codegen scans `documents: ['src/**/*.ts', 'src/**/*.tsx']`).
3. Run `yarn codegen` (or `yarn codegen:watch` while iterating) to generate a typed hook from `src/core/graphql/client.ts`'s schema.
4. Use the generated hook in a component:

```tsx
import { useYourQuery } from '@/core/graphql/generated'; // path depends on your codegen output

export function YourComponent() {
  const { data, loading, error } = useYourQuery();
  // ...
}
```

Auth is handled automatically by `apolloClient` — `Authorization: Bearer <token>` from `localStorage.getItem('ApplicationToken')` (the shell's Firebase-JWT handoff). Don't set this yourself, and don't add cookie/CSRF headers to GraphQL calls.

## REST (fallback, when no GraphQL operation exists)

Use the shared `apiClient` (`src/core/apiClient.ts`, axios) — don't hand-roll `fetch()`.

```tsx
import { apiClient } from '@/core/apiClient';

// GET
useEffect(() => {
  const ac = new AbortController();

  apiClient
    .get<YourResponseType>('/api/your-endpoint', { signal: ac.signal })
    .then((res) => setData(res.data))
    .catch((err) => {
      if (err.name !== 'CanceledError') setError(String(err));
    });

  return () => ac.abort();
}, [/* deps */]);

// POST/PUT/PATCH/DELETE
const handleSubmit = async () => {
  const res = await apiClient.post<YourResponseType>('/api/your-endpoint', payload);
  return res.data;
};
```

`apiClient` is preconfigured with `withCredentials: true`; once `configureApiClient(csrfToken)` runs (wire this into your root component's mount effect, passing `props.csrfToken`), it also sets `X-CSRF-Token` as a default header — you don't need to set these per-call.

## State shape to use alongside either pattern

```tsx
const [data, setData] = useState<YourType | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

(For GraphQL, prefer the hook's own `data`/`loading`/`error` instead of duplicating this manually.)

## Checklist before finishing

- [ ] GraphQL used if an operation exists for this data; REST only as fallback
- [ ] REST calls go through `apiClient`, not raw `fetch()` or a new axios instance
- [ ] `AbortController` created and aborted on cleanup for REST calls in `useEffect`
- [ ] Cancellation errors excluded from error state (`CanceledError` for axios, `AbortError` for raw `fetch()`)
- [ ] Response type is explicit — no `any`

## What NOT to do

- Don't use raw `fetch()` for REST — use `apiClient`.
- Don't add cookie/CSRF headers to GraphQL calls, or a bearer token to REST calls — the two patterns are intentionally different, not interchangeable.
- Don't put the GraphQL bearer token or the CSRF token in component state — read them from `apolloClient`/`apiClient`'s existing configuration.
- Don't skip the abort cleanup on REST calls — it causes state updates on unmounted components.
