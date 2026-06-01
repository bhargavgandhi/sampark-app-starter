---
name: add-api-call
description: Add a correctly structured API call to a component — with credentials, CSRF token, AbortController cleanup, and typed response. Use this whenever adding a fetch() call.
---

# Add API Call

Every `fetch()` in this app must follow this exact pattern. Deviations cause auth failures, CSRF rejections, or memory leaks.

## Pattern for GET (read)

```tsx
useEffect(() => {
  const ac = new AbortController();

  fetch('/api/your-endpoint', {
    credentials: 'include',
    signal: ac.signal,
  })
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return r.json() as Promise<YourResponseType>;
    })
    .then((data) => setData(data))
    .catch((err) => {
      if (err.name !== 'AbortError') setError(String(err));
    });

  return () => ac.abort();
}, [/* deps */]);
```

## Pattern for POST/PUT/PATCH/DELETE (mutate)

```tsx
const handleSubmit = async () => {
  const r = await fetch('/api/your-endpoint', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,   // ← always required for mutating requests
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<YourResponseType>;
};
```

## State shape to use alongside

```tsx
const [data, setData] = useState<YourType | null>(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

## Checklist before finishing

- [ ] `credentials: 'include'` on every fetch
- [ ] `X-CSRF-Token: csrfToken` on every POST/PUT/PATCH/DELETE
- [ ] `AbortController` created in `useEffect`, aborted in cleanup (`return () => ac.abort()`)
- [ ] `AbortError` excluded from error state
- [ ] Response type is explicit (`as Promise<YourType>`) — no `any`
- [ ] `csrfToken` comes from `props.csrfToken` — never hardcoded or from state

## What NOT to do

- Don't use `axios` or other HTTP clients — plain `fetch` only
- Don't put the token in localStorage or component state
- Don't skip the abort cleanup — it causes state updates on unmounted components
