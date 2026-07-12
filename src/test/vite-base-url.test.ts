// @vitest-environment node
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

import config from '../../vite.config';

// Slug-agnostic: derives expected site names from firebase.json instead of a
// hardcoded value, so this stays valid after scaffold-app rewrites the slug.
const firebaseJson = JSON.parse(readFileSync(resolve(__dirname, '../../firebase.json'), 'utf-8'));
const sites: string[] = firebaseJson.hosting.map((h: { site: string }) => h.site);
const prodSite = sites.find((s) => !s.startsWith('qa-') && !s.startsWith('dev-'))!;
const qaSite = `qa-${prodSite}`;
const devSite = `dev-${prodSite}`;

function resolveBase(mode: string, command: 'build' | 'serve'): string {
  const resolved = typeof config === 'function' ? config({ mode, command }) : config;
  return (resolved as { base?: string }).base ?? '';
}

describe('vite config base URL', () => {
  it('resolves production build base to the same site as firebase.json', () => {
    expect(resolveBase('production', 'build')).toBe(`https://${prodSite}.web.app/`);
  });

  it('resolves qa build base to the same site as firebase.json', () => {
    expect(resolveBase('qa', 'build')).toBe(`https://${qaSite}.web.app/`);
  });

  it('resolves development-mode build base to the same site as firebase.json', () => {
    expect(resolveBase('development', 'build')).toBe(`https://${devSite}.web.app/`);
  });

  it('resolves local serve base to a relative path regardless of mode', () => {
    expect(resolveBase('development', 'serve')).toBe('/');
    expect(resolveBase('qa', 'serve')).toBe('/');
  });
});
