import { useEffect, useState } from 'react';
import type { MountProps } from '@harisumiran/platform';
import { Card } from '@harisumiran/ui';

interface HelloResponse {
  message: string;
}

export function App({ user, can, csrfToken }: MountProps) {
  const [hello, setHello] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/hello', {
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrfToken },
      signal: ac.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<HelloResponse>) : Promise.reject(r.status)))
      .then((data) => setHello(data.message))
      .catch((e) => {
        if (e !== 'AbortError') setError(String(e));
      });
    return () => ac.abort();
  }, [csrfToken]);

  return (
    <Card>
      <h2>Hello, {user.firstName}</h2>
      {hello && <p>Server says: {hello}</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {can('your-team:admin') && <p>You have admin access.</p>}
    </Card>
  );
}
