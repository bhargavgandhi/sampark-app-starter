// @vitest-environment node
import { describe, expect, it } from 'vitest';

import config from '../../vite.config';

function resolveBase(mode: string, command: 'build' | 'serve'): string {
  const resolved = typeof config === 'function' ? config({ mode, command }) : config;
  return (resolved as { base?: string }).base ?? '';
}

describe('vite config base URL', () => {
  it('resolves production build base to the team-app Firebase Hosting URL', () => {
    expect(resolveBase('production', 'build')).toBe('https://your-team-app.web.app/');
  });

  it('resolves qa build base to the qa-team-app Firebase Hosting URL', () => {
    expect(resolveBase('qa', 'build')).toBe('https://qa-your-team-app.web.app/');
  });

  it('resolves development-mode build base to the dev-team-app Firebase Hosting URL', () => {
    expect(resolveBase('development', 'build')).toBe('https://dev-your-team-app.web.app/');
  });

  it('resolves local serve base to a relative path regardless of mode', () => {
    expect(resolveBase('development', 'serve')).toBe('/');
    expect(resolveBase('qa', 'serve')).toBe('/');
  });
});
