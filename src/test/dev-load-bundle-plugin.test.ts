// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import config, { devLoadBundlePlugin } from '../../vite.config';

function resolvePluginNames(mode: string, command: 'build' | 'serve'): string[] {
  const resolved = typeof config === 'function' ? config({ mode, command }) : config;
  return ((resolved as { plugins?: Array<{ name: string }> }).plugins ?? []).map((p) => p.name);
}

function createMockServer() {
  const middlewares: Array<[string, (req: unknown, res: unknown) => void]> = [];
  return {
    middlewares: {
      use: vi.fn((path: string, handler: (req: unknown, res: unknown) => void) => {
        middlewares.push([path, handler]);
      }),
    },
    getHandler(path: string) {
      const entry = middlewares.find(([p]) => p === path);
      return entry?.[1];
    },
  };
}

describe('devLoadBundlePlugin', () => {
  it('registers /loadBundle middleware and returns bundle JSON with CORS header', () => {
    const plugin = devLoadBundlePlugin();
    const server = createMockServer();

    // @ts-expect-error - minimal ViteDevServer mock for this test
    plugin.configureServer(server);

    const handler = server.getHandler('/loadBundle');
    expect(handler).toBeDefined();

    const res = {
      setHeader: vi.fn(),
      end: vi.fn(),
    };

    handler!({}, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');

    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.bundleUrl).toBe('http://localhost:4000/src/mount.tsx');
  });

  it('is only attached to the local serve command, not to any build (including a development-mode build)', () => {
    expect(resolvePluginNames('development', 'serve')).toContain('dev-load-bundle');
    expect(resolvePluginNames('development', 'build')).not.toContain('dev-load-bundle');
    expect(resolvePluginNames('production', 'build')).not.toContain('dev-load-bundle');
  });
});
