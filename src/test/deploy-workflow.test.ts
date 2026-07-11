// @vitest-environment node
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

function readWorkflow(name: string): string {
  return readFileSync(resolve(__dirname, `../../.github/workflows/${name}`), 'utf-8');
}

const firebaseJson = JSON.parse(readFileSync(resolve(__dirname, '../../firebase.json'), 'utf-8'));

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

describe.each([
  ['deploy-dev.yml', 'your-sampark-project', 'dev-your-team-app', 'dev-your-team-app', 'dev'],
  ['deploy-qa.yml', 'your-sampark-project', 'qa-your-team-app', 'qa-your-team-app', 'qa'],
  ['deploy-prod.yml', 'your-sampark-project', 'your-team-app', 'your-team-app', 'prod'],
])('%s', (fileName, projectId, hostingTarget, site, envScript) => {
  const workflow = readWorkflow(fileName);
  const hosting = firebaseJson.hosting.find((h: { site: string }) => h.site === site);

  it(`builds/deploys the ${envScript} environment with the right project/target`, () => {
    expect(workflow).toMatch(new RegExp(`firebase_project_id: ${projectId}\\b`));
    expect(workflow).toMatch(new RegExp(`hosting_target: ${hostingTarget}\\b`));
    expect(workflow).toMatch(new RegExp(`yarn build:${envScript}\\b`));
    expect(workflow).toMatch(/uses: harisumiran\/deploy-to-firebase-action@v1/);
    expect(workflow).toMatch(/keep_releases: '2'/);
  });

  it("passes headers/rewrites inputs matching this site's firebase.json entry", () => {
    expect(extractYamlBlockScalar(workflow, 'headers')).toEqual(hosting.headers);
    expect(extractYamlBlockScalar(workflow, 'rewrites')).toEqual(hosting.rewrites);
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
