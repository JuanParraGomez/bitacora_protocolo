import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const scriptPath = pathToFileURL(path.join(process.cwd(), 'scripts/verify-workspace-visual-contract.mjs'));
function buildManifest(rows) {
  return [
    '# Manifiesto visual',
    '',
    '| ID | Archivo | Viewport objetivo | Resolución raster | Estado y contrato principal |',
    '|---|---|---:|---:|---|',
    ...rows,
    '',
  ].join('\n');
}

function writeManifest(name, rows) {
  const fixtureDir = mkdtempSync(path.join(tmpdir(), 'stage-agent-contract-'));
  const manifestPath = path.join(fixtureDir, name);
  writeFileSync(manifestPath, buildManifest(rows));
  return { manifestPath, cleanup: () => rmSync(fixtureDir, { recursive: true, force: true }) };
}

describe('verify-workspace-visual-contract', () => {
  it('accepts the canonical six references from the checked-in manifest', async () => {
    const { verifyWorkspaceVisualContract } = await import(scriptPath.href);
    const result = await verifyWorkspaceVisualContract();

    expect(result.ok).toBe(true);
    expect(result.references).toHaveLength(6);
    expect(result.references.map((reference) => reference.id)).toEqual([
      'IMG-UX-01',
      'IMG-UX-02',
      'IMG-UX-03',
      'IMG-UX-04',
      'IMG-UX-05',
      'IMG-UX-06',
    ]);
  });

  it('rejects missing, replaced, globbed, and duplicated references', async () => {
    const { verifyWorkspaceVisualContract } = await import(scriptPath.href);

    const missing = writeManifest('missing.md', [
      '| IMG-UX-01 | `img-ux-01-desktop-etapa.png` | 1440 × 900 | 1586 × 992 | ok |',
    ]);
    await expect(verifyWorkspaceVisualContract(missing.manifestPath)).rejects.toThrow(/six canonical references|missing/i);
    missing.cleanup();

    const replaced = writeManifest('replaced.md', [
      '| IMG-UX-01 | `img-ux-01-desktop-etapa-v2.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-02 | `img-ux-02-desktop-agente-activo-v2.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-03 | `img-ux-03-tablet-agente-activo-v2.png` | 1024 × 768 | 1448 × 1086 | ok |',
      '| IMG-UX-04 | `img-ux-04-mobile-etapa-v4.png` | 390 × 844 | 853 × 1844 | ok |',
      '| IMG-UX-05 | `img-ux-05-desktop-bloqueo.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-06 | `img-ux-06-desktop-completada-v2.png` | 1440 × 900 | 1586 × 992 | ok |',
    ]);
    await expect(verifyWorkspaceVisualContract(replaced.manifestPath)).rejects.toThrow(/canonical reference|mismatch|replacement/i);
    replaced.cleanup();

    const globbed = writeManifest('globbed.md', [
      '| IMG-UX-01 | `img-ux-*.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-02 | `img-ux-02-desktop-agente-activo-v2.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-03 | `img-ux-03-tablet-agente-activo-v2.png` | 1024 × 768 | 1448 × 1086 | ok |',
      '| IMG-UX-04 | `img-ux-04-mobile-etapa-v4.png` | 390 × 844 | 853 × 1844 | ok |',
      '| IMG-UX-05 | `img-ux-05-desktop-bloqueo.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-06 | `img-ux-06-desktop-completada-v2.png` | 1440 × 900 | 1586 × 992 | ok |',
    ]);
    await expect(verifyWorkspaceVisualContract(globbed.manifestPath)).rejects.toThrow(/glob|canonical reference/i);
    globbed.cleanup();

    const duplicated = writeManifest('duplicated.md', [
      '| IMG-UX-01 | `img-ux-01-desktop-etapa.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-01 | `img-ux-01-desktop-etapa.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-03 | `img-ux-03-tablet-agente-activo-v2.png` | 1024 × 768 | 1448 × 1086 | ok |',
      '| IMG-UX-04 | `img-ux-04-mobile-etapa-v4.png` | 390 × 844 | 853 × 1844 | ok |',
      '| IMG-UX-05 | `img-ux-05-desktop-bloqueo.png` | 1440 × 900 | 1586 × 992 | ok |',
      '| IMG-UX-06 | `img-ux-06-desktop-completada-v2.png` | 1440 × 900 | 1586 × 992 | ok |',
    ]);
    await expect(verifyWorkspaceVisualContract(duplicated.manifestPath)).rejects.toThrow(/duplicate|canonical reference/i);
    duplicated.cleanup();
  });
});
