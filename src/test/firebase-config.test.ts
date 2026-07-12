// @vitest-environment node
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

const firebaseJson = JSON.parse(readFileSync(resolve(__dirname, '../../firebase.json'), 'utf-8'));
const sites: string[] = firebaseJson.hosting.map((h: { site: string }) => h.site);

function findHeaderRule(
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>,
  source: string
) {
  return headers.find((rule) => rule.source === source);
}

describe('firebase.json site naming convention', () => {
  // These assertions are deliberately slug-agnostic: this template's scaffold-app
  // skill rewrites the actual site names from a placeholder to a real slug, and
  // these tests must keep passing unmodified after that happens.
  it('has exactly 3 hosting sites (prod, qa, dev)', () => {
    expect(sites).toHaveLength(3);
  });

  it('has one unprefixed (prod) site, and qa-/dev- prefixed variants of the same base name', () => {
    const prodSite = sites.find((s) => !s.startsWith('qa-') && !s.startsWith('dev-'));
    expect(prodSite).toBeDefined();
    expect(sites).toContain(`qa-${prodSite}`);
    expect(sites).toContain(`dev-${prodSite}`);
  });
});

describe.each(firebaseJson.hosting.map((h: { site: string }) => h.site) as string[])(
  'firebase.json hosting site %s',
  (site) => {
    const hosting = firebaseJson.hosting.find((h: { site: string }) => h.site === site);

    it('exists and serves from dist', () => {
      expect(hosting).toBeDefined();
      expect(hosting.public).toBe('dist');
    });

    it('rewrites /loadBundle to /loadBundle.json', () => {
      const rewrite = hosting.rewrites.find((r: { source: string }) => r.source === '/loadBundle');
      expect(rewrite.destination).toBe('/loadBundle.json');
    });

    it('sets a headers rule on the bare /loadBundle path, not just /loadBundle.json', () => {
      // Firebase Hosting matches headers against the original request path, not
      // the rewrite destination — a rule on /loadBundle.json alone silently
      // never applies to the /loadBundle path the shell actually fetches.
      const rule = findHeaderRule(hosting.headers, '/loadBundle');
      expect(rule).toBeDefined();
      const cors = rule?.headers.find((h) => h.key === 'Access-Control-Allow-Origin');
      expect(cors?.value).toBe('*');
    });

    it('sets immutable cache headers on mount.js and assets', () => {
      for (const source of ['/mount.js', '/assets/**']) {
        const rule = findHeaderRule(hosting.headers, source);
        const cacheControl = rule?.headers.find((h) => h.key === 'Cache-Control');
        const cors = rule?.headers.find((h) => h.key === 'Access-Control-Allow-Origin');
        expect(cacheControl?.value).toBe('public, max-age=31536000, immutable');
        expect(cors?.value).toBe('*');
      }
    });

    it('sets no-store on loadBundle.json', () => {
      const rule = findHeaderRule(hosting.headers, '/loadBundle.json');
      const cacheControl = rule?.headers.find((h) => h.key === 'Cache-Control');
      expect(cacheControl?.value).toBe('no-store');
    });
  }
);

describe('.firebaserc', () => {
  it('is not needed and does not exist (firebase.json is self-contained via "site")', () => {
    expect(existsSync(resolve(__dirname, '../../.firebaserc'))).toBe(false);
  });
});
