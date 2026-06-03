#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

// React + all dependencies are bundled in (blob-URL ESM cannot resolve bare
// specifiers). 4 MB accommodates React (~140 KB) + UI lib + your app code.
// Revisit once the shell provides an import-map for shared deps.
const BUDGET_BYTES = 4_000_000;
const BUNDLE = resolve('dist/mount.js');

const size = statSync(BUNDLE).size;
if (size > BUDGET_BYTES) {
  console.error(`✗ Bundle too large: ${size} bytes > budget ${BUDGET_BYTES}`);
  process.exit(1);
}

console.log(`✓ Bundle OK — ${size} bytes`);
