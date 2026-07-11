import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';
import type { MountProps } from './platform';

// @sampark-app/ui is provided by the shell at runtime; its published dist has
// a Node ESM resolution quirk (directory imports) that only surfaces under
// Vitest's native-Node module resolution, not Vite's dev/build resolution.
// Mocked here so this smoke test exercises our own code, not the package's.
vi.mock('@sampark-app/ui', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const mountProps: MountProps = {
  container: document.createElement('div'),
  basePath: '/app/starter',
  contractVersion: '1.0',
  user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' },
  can: () => false,
  navigate: () => {},
  events: { emit: () => {}, on: () => () => {} },
  csrfToken: 'test-csrf-token',
};

describe('App', () => {
  it('renders a greeting for the mounted user', () => {
    render(<App {...mountProps} />);
    expect(screen.getByText('Hello, Test')).toBeInTheDocument();
  });
});
