import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_VISUAL_MANIFEST_PATH = path.join(
  process.cwd(),
  'docs/ux-ui/mockups/rediseño-agente/manifest.md',
);

export const CANONICAL_VISUAL_REFERENCES = [
  {
    id: 'IMG-UX-01',
    file: 'img-ux-01-desktop-etapa.png',
    viewport: '1440 × 900',
    raster: '1586 × 992',
    contract: 'Etapa activa, agente contraído, formulario protagonista y una sola acción primaria',
  },
  {
    id: 'IMG-UX-02',
    file: 'img-ux-02-desktop-agente-activo-v2.png',
    viewport: '1440 × 900',
    raster: '1586 × 992',
    contract: 'Agente expandido como columna estructural, chat y compositor neutro sin cubrir el lienzo',
  },
  {
    id: 'IMG-UX-03',
    file: 'img-ux-03-tablet-agente-activo-v2.png',
    viewport: '1024 × 768',
    raster: '1448 × 1086',
    contract: 'Navegación en drawer cerrado, lienzo y agente con scroll independiente y una sola acción primaria',
  },
  {
    id: 'IMG-UX-04',
    file: 'img-ux-04-mobile-etapa-v4.png',
    viewport: '390 × 844',
    raster: '853 × 1844',
    contract: 'Un solo plano móvil, selector Etapa/Agente y los cinco campos completos y consistentes dentro del flujo',
  },
  {
    id: 'IMG-UX-05',
    file: 'img-ux-05-desktop-bloqueo.png',
    viewport: '1440 × 900',
    raster: '1586 × 992',
    contract: 'Bloqueo recuperable, errores próximos a su causa y única acción primaria Reevaluar etapa',
  },
  {
    id: 'IMG-UX-06',
    file: 'img-ux-06-desktop-completada-v2.png',
    viewport: '1440 × 900',
    raster: '1586 × 992',
    contract: 'Progreso 4/4, resumen de resultados y única acción principal Volver a tareas',
  },
];

function normalizeCell(value) {
  return value
    .trim()
    .replace(/^`|`$/g, '')
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '');
}

function parseVisualContractRows(manifestText) {
  const rows = [];
  const lines = manifestText.split(/\r?\n/);
  let inTable = false;

  for (const line of lines) {
    if (!inTable) {
      if (line.includes('| ID | Archivo | Viewport objetivo | Resolución raster | Estado y contrato principal |')) {
        inTable = true;
      }
      continue;
    }

    if (/^\|\s*-{3,}/.test(line)) {
      continue;
    }

    if (!line.startsWith('|')) {
      if (rows.length > 0) break;
      continue;
    }

    const cells = line
      .split('|')
      .slice(1, -1)
      .map(normalizeCell);

    if (cells.length < 5 || !/^IMG-UX-\d{2}$/.test(cells[0])) {
      continue;
    }

    rows.push({
      id: cells[0],
      file: cells[1],
      viewport: cells[2],
      raster: cells[3],
      contract: cells[4],
    });
  }

  return rows;
}

function assertCanonicalReference(reference, expected) {
  if (reference.file !== expected.file) {
    throw new Error(`Canonical reference ${expected.id} mismatch: expected file ${expected.file}, found ${reference.file}.`);
  }

  if (reference.viewport !== expected.viewport) {
    throw new Error(`Canonical reference ${expected.id} mismatch: expected viewport ${expected.viewport}, found ${reference.viewport}.`);
  }

  if (reference.raster !== expected.raster) {
    throw new Error(`Canonical reference ${expected.id} mismatch: expected raster ${expected.raster}, found ${reference.raster}.`);
  }

  if (reference.contract !== expected.contract) {
    throw new Error(`Canonical reference ${expected.id} mismatch: expected contract "${expected.contract}", found "${reference.contract}".`);
  }
}

export async function verifyWorkspaceVisualContract(manifestPath = DEFAULT_VISUAL_MANIFEST_PATH) {
  const manifestText = await readFile(manifestPath, 'utf8');
  const references = parseVisualContractRows(manifestText);

  if (references.length !== CANONICAL_VISUAL_REFERENCES.length) {
    throw new Error(`Expected six canonical references, found ${references.length}.`);
  }

  const byId = new Map();
  for (const reference of references) {
    if (byId.has(reference.id)) {
      throw new Error(`Duplicate canonical reference ${reference.id}.`);
    }
    byId.set(reference.id, reference);
  }

  for (const expected of CANONICAL_VISUAL_REFERENCES) {
    const reference = byId.get(expected.id);
    if (!reference) {
      throw new Error(`Missing canonical reference ${expected.id}.`);
    }
    assertCanonicalReference(reference, expected);
  }

  const unexpected = references.filter((reference) => !CANONICAL_VISUAL_REFERENCES.some((expected) => expected.id === reference.id));
  if (unexpected.length > 0) {
    throw new Error(`Unexpected visual references: ${unexpected.map((reference) => reference.id).join(', ')}.`);
  }

  return {
    ok: true,
    manifestPath,
    references,
  };
}

async function main() {
  try {
    const result = await verifyWorkspaceVisualContract();
    console.log(`Visual contract verified: ${result.references.length} canonical references.`);
    for (const reference of result.references) {
      console.log(`${reference.id} -> ${reference.file}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

const directScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (directScriptPath && fileURLToPath(import.meta.url) === directScriptPath) {
  await main();
}
