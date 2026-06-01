#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const BUDGET_BYTES = 100_000;
const BUNDLE = resolve('dist/mount.js');

const FORBIDDEN = [
  { needle: 'react.production.min', why: 'React appears inlined into the bundle' },
  { needle: '__SECRET_INTERNALS_DO_NOT_USE', why: 'React internals appear inlined' },
  { needle: '@sampark-app/ui/dist', why: '@sampark-app/ui appears inlined' },
];

const size = statSync(BUNDLE).size;
if (size > BUDGET_BYTES) {
  console.error(`✗ Bundle too large: ${size} bytes > budget ${BUDGET_BYTES}`);
  process.exit(1);
}

const contents = readFileSync(BUNDLE, 'utf8');
for (const { needle, why } of FORBIDDEN) {
  if (contents.includes(needle)) {
    console.error(`✗ ${why} (found "${needle}" in ${BUNDLE})`);
    console.error('   Did you accidentally remove externals from vite.config.ts?');
    process.exit(1);
  }
}

console.log(`✓ Bundle OK — ${size} bytes`);
