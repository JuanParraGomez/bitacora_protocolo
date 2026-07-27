import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function root(relativePath: string) {
  return path.resolve(process.cwd(), relativePath);
}

async function readText(relativePath: string) {
  return readFile(root(relativePath), 'utf8');
}

async function packageJson() {
  const raw = await readText('package.json');
  return JSON.parse(raw) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
}

function hasArrayValue(configText: string, arrayKey: string, expectedValue: string) {
  const regex = new RegExp(`\\b${arrayKey}\\s*:\\s*\\[[\\s\\S]*?\\]`, 'm');
  const match = regex.exec(configText);
  if (!match) return false;
  return new RegExp(`['"]${escapeRegExp(expectedValue)}['"]`).test(match[0]);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Nuxt UI setup contract', () => {
  it('declares @nuxt/ui in Nuxt modules', async () => {
    const configText = await readText('nuxt.config.ts');
    expect(hasArrayValue(configText, 'modules', '@nuxt/ui')).toBe(true);
  });

  it('wraps the app shell with a real UApp root', async () => {
    const appText = await readText('app.vue');
    expect(appText).toMatch(/<UApp\b[^>]*>/);
    expect(appText).toContain('</UApp>');
  });

  it('registers the committed global stylesheet', async () => {
    const configText = await readText('nuxt.config.ts');
    expect(hasArrayValue(configText, 'css', 'app/assets/css/main.css')).toBe(true);
    const stylesheetPath = root('app/assets/css/main.css');
    const stylesheet = await readFile(stylesheetPath, 'utf8');
    expect(stylesheet.trim().length).toBeGreaterThan(0);
  });

  it('does not depend on AI SDK or Vueform for MVP', async () => {
    const pkg = await packageJson();
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    const forbidden = Object.keys(allDeps).filter((name) => name === 'vueform' || name.startsWith('@ai-sdk/'));
    expect(forbidden).toEqual([]);
  });
});
