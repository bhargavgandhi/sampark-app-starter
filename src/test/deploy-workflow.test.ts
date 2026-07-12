// @vitest-environment node
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

function readWorkflow(name: string): string {
  return readFileSync(resolve(__dirname, `../../.github/workflows/${name}`), 'utf-8');
}

const firebaseJson = JSON.parse(readFileSync(resolve(__dirname, '../../firebase.json'), 'utf-8'));
const sites: string[] = firebaseJson.hosting.map((h: { site: string }) => h.site);

function extractYamlBlockScalar(workflow: string, key: string): unknown {
  const lines = workflow.split('\n');
  const startIndex = lines.findIndex((line) => line.trim() === `${key}: |`);
  if (startIndex === -1) {
    throw new Error(`Block scalar "${key}: |" not found`);
  }
  const keyIndent = lines[startIndex].match(/^(\s*)/)![1].length;

  const blockLines: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      blockLines.push('');
      continue;
    }
    const indent = line.match(/^(\s*)/)![1].length;
    if (indent <= keyIndent) break;
    blockLines.push(line);
  }
  return JSON.parse(blockLines.join('\n'));
}

function extractInput(workflow: string, key: string): string {
  const match = workflow.match(new RegExp(`${key}:\\s*(\\S+)`));
  if (!match) throw new Error(`Input "${key}" not found`);
  return match[1];
}

// Slug-agnostic: reads hosting_target/firebase_project_id/site names out of
// the workflow files and firebase.json rather than hardcoding a slug, so
// this stays valid after scaffold-app rewrites the placeholder.
describe.each([
  ['deploy-dev.yml', 'dev'],
  ['deploy-qa.yml', 'qa'],
  ['deploy-prod.yml', 'prod'],
])('%s', (fileName, envScript) => {
  const workflow = readWorkflow(fileName);
  const hostingTarget = extractInput(workflow, 'hosting_target');
  const hosting = firebaseJson.hosting.find((h: { site: string }) => h.site === hostingTarget);

  it(`deploys to a hosting_target that exists in firebase.json`, () => {
    expect(sites).toContain(hostingTarget);
  });

  it(`builds via yarn build:${envScript} and the standard deploy action`, () => {
    expect(workflow).toMatch(new RegExp(`yarn build:${envScript}\\b`));
    expect(workflow).toMatch(/uses: harisumiran\/deploy-to-firebase-action@v1/);
    expect(workflow).toMatch(/keep_releases: '2'/);
  });

  it("passes headers/rewrites inputs matching this site's firebase.json entry", () => {
    expect(extractYamlBlockScalar(workflow, 'headers')).toEqual(hosting.headers);
    expect(extractYamlBlockScalar(workflow, 'rewrites')).toEqual(hosting.rewrites);
  });
});

describe('deploy workflow site convention', () => {
  it('maps deploy-prod.yml to the unprefixed site, and dev/qa workflows to their prefixed variants of it', () => {
    const prodTarget = extractInput(readWorkflow('deploy-prod.yml'), 'hosting_target');
    const qaTarget = extractInput(readWorkflow('deploy-qa.yml'), 'hosting_target');
    const devTarget = extractInput(readWorkflow('deploy-dev.yml'), 'hosting_target');

    expect(qaTarget).toBe(`qa-${prodTarget}`);
    expect(devTarget).toBe(`dev-${prodTarget}`);
  });

  it('all three workflows deploy to the same firebase_project_id', () => {
    const projectIds = ['deploy-dev.yml', 'deploy-qa.yml', 'deploy-prod.yml'].map((f) =>
      extractInput(readWorkflow(f), 'firebase_project_id')
    );
    expect(new Set(projectIds).size).toBe(1);
  });
});

describe.each(['deploy-dev.yml', 'deploy-qa.yml'])('%s branch trigger', (fileName) => {
  it('deploys on push to main', () => {
    expect(readWorkflow(fileName)).toMatch(/branches: \[main\]/);
  });
});

describe('deploy-prod.yml branch trigger', () => {
  it('deploys on push to release', () => {
    expect(readWorkflow('deploy-prod.yml')).toMatch(/branches: \[release\]/);
  });
});
