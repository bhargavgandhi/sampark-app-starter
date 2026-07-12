---
name: generate-feature
description: Scaffold a new feature component for this team app. Creates a typed component that receives MountProps fields, uses @sampark-app/ui, and follows bundle/cleanup rules.
---

# Generate Feature Component

Create a new feature component in `src/features/<name>/` following these exact patterns.

## Steps

1. **Create the directory**: `src/features/<name>/`

2. **Create the component** `src/features/<name>/<Name>.tsx`:

```tsx
import { useEffect, useState } from 'react';
import type { MountProps } from '../../platform';
// import { Card, Button } from '@sampark-app/ui';

interface <Name>Props {
  user: MountProps['user'];
  can: MountProps['can'];
  csrfToken: MountProps['csrfToken'];
}

export function <Name>({ user, can, csrfToken }: <Name>Props) {
  // Add state and effects here

  return (
    <div>
      {/* Your feature UI */}
    </div>
  );
}
```

3. **Create the barrel** `src/features/<name>/index.ts`:
```ts
export { <Name> } from './<Name>';
```

4. **Wire it into `App.tsx`** — import from the barrel and render within the existing component tree. Pass only the MountProps fields the feature needs — don't pass the whole props object.

## Rules to enforce

- Props must be explicit destructured fields from MountProps — not `props: MountProps` spread
- For data needs, follow the `add-api-call` skill: GraphQL (`src/core/graphql/client.ts`) by default once configured, REST via `src/core/apiClient.ts` as fallback — don't hand-roll `fetch()`
- Use `can('resource:action')` only for UI gating (show/hide), never for security
- No `console.log` — use `import.meta.env.DEV` guard if needed for debug logging
- Import UI components from `@sampark-app/ui`, not local copies

## What NOT to do

- Don't import from `react` for JSX (transform handles it)
- Don't use `window.location` for navigation — use `props.navigate(path)`
- Don't store user or auth data in state beyond the component lifecycle
