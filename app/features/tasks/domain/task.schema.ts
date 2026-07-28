import { z } from 'zod';
import { assistantStateSchema, type AssistantState, repairAssistantState } from './task-assistant.schema';

export const SECRET_PATH_KEYS = [
  'password',
  'passwd',
  'secret',
  'token',
  'apikey',
  'accesskey',
  'privatekey',
  'clientsecret',
  'authorization',
  'cookie',
  'session',
  'credential',
] as const;

export const problemDecisionSchema = z.enum(['pendiente', 'mantener', 'reformular']).default('pendiente');
export const criterionPrioritySchema = z.enum(['alta', 'media', 'baja']).default('media');
export const criterionStatusSchema = z.enum(['pendiente', 'en-progreso', 'resuelto', 'descartado']).default('pendiente');
export const criterionImpactSchema = z.enum(['alto', 'medio', 'bajo']).default('medio');

function hashForValue(value: unknown): string {
  const text = JSON.stringify(value);
  let acc = 0;
  for (const char of text) {
    acc = (acc * 31 + char.codePointAt(0)!) >>> 0;
  }
  return acc.toString(16);
}

function normalizeSegment(segment: string): string {
  return segment.normalize('NFKC').toLowerCase().replace(/[_\-.\s]/g, '');
}

function isSensitivePath(path: string): boolean {
  const normalized = normalizeSegment(path);
  return SECRET_PATH_KEYS.some((token) => normalized.includes(token));
}

export const evidenceReferenceSchema = z.object({
  id: z.string().default(() => `evidence-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`),
  kind: z.enum(['note', 'link', 'artifact', 'observation']),
  label: z.string().default(''),
  value: z.string().default(''),
});

const criterionResultSchema = z.object({
  criterion: z.string().default(''),
  passed: z.boolean().default(false),
});

export const iterationSchema = z.object({
  id: z.string().default(() => `iteration-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  intento: z.string().default(''),
  resultado: z.string().default(''),
  ajuste: z.string().default(''),
  criterioIds: z.array(z.string()).default([]),
  methodVersionId: z.string().nullable().default(null),
  objective: z.string().default(''),
  action: z.string().default(''),
  tool: z.string().default(''),
  input: z.string().default(''),
  result: z.string().default(''),
  evidence: z.array(evidenceReferenceSchema).default([]),
  learning: z.string().default(''),
  nextAdjustment: z.string().default(''),
  applicableConditions: z.array(z.string()).default([]),
  success: z.boolean().default(false),
  successCriteriaResults: z.array(criterionResultSchema).default([]),
  createdAt: z.number().default(() => Date.now()),
});

export const solutionStepSchema = z.object({
  id: z.string().default(() => `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  title: z.string().default(''),
  objective: z.string().default(''),
  dependencies: z.array(z.string()).default([]),
  inputs: z.array(z.string()).default([]),
  output: z.string().default(''),
  tool: z.string().default(''),
  risk: z.string().default(''),
  successCriterion: z.string().default(''),
  sourceCriterionId: z.string().nullable().default(null),
});

const automationOpportunitySchema = z.object({
  id: z.string().default(() => `candidate-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  methodVersionId: z.string().default(''),
  stepIds: z.array(z.string()).default([]),
  classification: z.enum(['manual', 'assistable', 'automatable']),
  frequency: z.string().default(''),
  stability: z.string().default(''),
  risk: z.string().default(''),
  humanJudgment: z.string().default(''),
  trigger: z.string().default(''),
  inputs: z.array(z.string()).default([]),
  transformation: z.string().default(''),
  output: z.string().default(''),
  candidateTool: z.string().default(''),
  expectedFailures: z.array(z.string()).default([]),
  humanCheckpoint: z.string().default(''),
  occurrenceIterationIds: z.array(z.string()).default([]),
});

export const methodVersionSchema = z.object({
  id: z.string().default(() => `version-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  version: z.number().default(1),
  parentVersionId: z.string().nullable().default(null),
  status: z.enum(['draft', 'published', 'superseded']).default('draft'),
  changeKind: z.enum(['initial', 'material']).default('initial'),
  preconditions: z.array(z.string()).default([]),
  steps: z.array(solutionStepSchema).default([]),
  tools: z.array(z.string()).default([]),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  controls: z.array(z.string()).default([]),
  exceptions: z.array(z.string()).default([]),
  exceptionsReviewed: z.boolean().default(false),
  successCriteria: z.array(z.string()).default([]),
  supportingIterationIds: z.array(z.string()).default([]),
  createdAt: z.number().default(() => Date.now()),
});

export const criterionSchema = z.object({
  id: z.string().default(''),
  texto: z.string().default(''),
  comentario: z.string().default(''),
  prioridad: criterionPrioritySchema,
  estado: criterionStatusSchema,
  impacto: criterionImpactSchema,
});

export const predictionSchema = z.object({
  texto: z.string().default(''),
  umbral: z.string().default(''),
  conf: z.enum(['baja', 'media', 'alta']).default('media'),
});

export const reviewSchema = z.object({
  pred: z.string().default(''),
  observado: z.string().default(''),
  causa: z.string().default(''),
  mia: z.boolean().default(false),
});

const criterionImprovementSchema = z.object({
  criterioId: z.string().default(''),
  confirmado: z.boolean().default(false),
  mejora: z.string().default(''),
});

const problemAnalysisSchema = z.object({
  problemaDetectado: z.string().default(''),
  evidencia: z.string().default(''),
  analisis: z.string().default(''),
  decision: problemDecisionSchema,
  justificacion: z.string().default(''),
  problemaVigente: z.string().default(''),
});

const phaseOneSchema = z.object({
  linaje: z.array(z.record(z.string(), z.string())).default([{}]),
  dudas: z.string().default(''),
  checkMapeo: z.boolean().default(false),
  confirmacion: z.boolean().default(false),
  promptOrientacion: z.string().default(''),
  promptOrientacionPersonalizado: z.boolean().default(false),
  analisisProblema: problemAnalysisSchema.default({
    problemaDetectado: '',
    evidencia: '',
    analisis: '',
    decision: 'pendiente',
    justificacion: '',
    problemaVigente: '',
  }),
  resultadoDeseado: z.string().default(''),
  alcance: z.string().default(''),
  restricciones: z.string().default(''),
  actores: z.array(z.string()).default([]),
  criterioExito: z.string().default(''),
});

const phaseTwoSchema = z.object({
  decision: z.string().default(''),
  faqs: z.string().default(''),
  alcance: z.string().default(''),
  noObjetivos: z.string().default(''),
  pasos: z.string().default(''),
  descartadas: z.string().default(''),
  guia: z.string().default(''),
  promptGuia: z.string().default(''),
  promptGuiaPersonalizado: z.boolean().default(false),
  criterios: z.array(criterionSchema).default([]),
  predicciones: z.array(predictionSchema).default([
    { texto: '', umbral: '', conf: 'media' },
    { texto: '', umbral: '', conf: 'media' },
    { texto: '', umbral: '', conf: 'media' },
  ]),
  subproblemas: z.array(z.string()).default([]),
  preguntasAbiertas: z.array(z.string()).default([]),
  riesgos: z.array(z.string()).default([]),
});

const phaseThreeSchema = z.object({
  iteraciones: z.array(iterationSchema).default(() => [{
    id: '',
    intento: '',
    resultado: '',
    ajuste: '',
    criterioIds: [],
    methodVersionId: null,
    objective: '',
    action: '',
    tool: '',
    input: '',
    result: '',
    evidence: [],
    learning: '',
    nextAdjustment: '',
    applicableConditions: [],
    success: false,
    successCriteriaResults: [],
    createdAt: Date.now(),
  }]),
  checkCompila: z.boolean().default(false),
  checkAuditado: z.boolean().default(false),
  notas: z.string().default(''),
  promptEjecucion: z.string().default(''),
  promptEjecucionPersonalizado: z.boolean().default(false),
});

const phaseFourSchema = z.object({
  aar: z.array(reviewSchema).default([]),
  cambio: z.string().default(''),
  patron: z.string().default(''),
  titulo: z.string().default(''),
  conexiones: z.string().default(''),
  promptAar: z.string().default(''),
  promptAarPersonalizado: z.boolean().default(false),
  mejorasCriterios: z.array(criterionImprovementSchema).default([]),
  methodVersionId: z.string().default(''),
});

export const taskSchema = z.object({
  schemaVersion: z.number().default(2),
  id: z.string().default(() => `recovered-${hashForValue(Date.now())}`),
  nombre: z.string().default(''),
  directiva: z.string().default(''),
  tipo: z.string().default('general'),
  created: z.number().default(() => Date.now()),
  fase: z.number().int().min(1).max(4).default(1),
  estado: z.enum(['activa', 'pausada', 'completada']).default('activa'),
  plantillaDe: z.string().nullable().default(null),
  projectId: z.string().default('legacy'),
  migrationEnvelope: z.object({
    sourceSchemaVersion: z.number().nullable().default(null),
    unknownFields: z.record(z.string(), z.unknown()).default(() => ({})),
    invalidFields: z.record(z.string(), z.unknown()).default(() => ({})),
    redactedFields: z.array(z.string()).default([]),
  }).default(() => ({
    sourceSchemaVersion: null,
    unknownFields: {},
    invalidFields: {},
    redactedFields: [],
  })),
  f1: phaseOneSchema,
  f2: phaseTwoSchema,
  f3: phaseThreeSchema,
  f4: phaseFourSchema,
  methodVersions: z.array(methodVersionSchema).default([]),
  automationOpportunities: z.array(automationOpportunitySchema).default([]),
  assistant: assistantStateSchema.default(() => repairAssistantState(undefined)),
}).passthrough();

const taskIndexRecordSchema = z.object({
  id: z.string(),
  titulo: z.string().default(''),
  tareaId: z.string().default(''),
  taskId: z.string().default(''),
  projectId: z.string().default('legacy'),
}).transform((record) => {
  const canonicalTaskId = record.taskId || record.tareaId;
  return {
    ...record,
    tareaId: canonicalTaskId,
    taskId: canonicalTaskId,
  };
});

export const taskIndexSchema = z.object({
  tareas: z.array(z.object({
    id: z.string(),
    nombre: z.string().default(''),
    fase: z.number().int().min(1).max(4).default(1),
    estado: z.enum(['activa', 'pausada', 'completada']).default('activa'),
    tipo: z.string().default('general'),
    projectId: z.string().default('legacy'),
  })).default([]),
  registros: z.array(taskIndexRecordSchema).default([]),
});

export type Prediction = z.infer<typeof predictionSchema>;
export type ProblemAnalysis = z.infer<typeof problemAnalysisSchema>;
export type Criterion = z.infer<typeof criterionSchema>;
export type Iteration = z.infer<typeof iterationSchema>;
export type CriterionImprovement = z.infer<typeof criterionImprovementSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;
export type MethodVersion = z.infer<typeof methodVersionSchema>;
export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskIndex = z.infer<typeof taskIndexSchema>;
export type MigrationEnvelope = z.infer<typeof taskSchema.shape.migrationEnvelope>;

function sanitizeUnknownValue(raw: unknown, diagnostics: MigrationEnvelope, path: string[]): unknown {
  if (raw === null || typeof raw !== 'object') {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map((value, index) => sanitizeUnknownValue(value, diagnostics, [...path, String(index)]));
  }

  const source = raw as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    const nextPath = [...path, key];
    const nextPathString = nextPath.join('.');
    if (isSensitivePath(nextPathString)) {
      diagnostics.redactedFields.push(nextPathString);
      continue;
    }
    sanitized[key] = sanitizeUnknownValue(value, diagnostics, nextPath);
  }
  return sanitized;
}

function sanitizeUnknowns(raw: unknown, schema: z.ZodTypeAny, diagnostics: MigrationEnvelope, path: string[] = []): unknown {
  if (path.length === 0 && typeof raw === 'object' && raw !== null && typeof (raw as { migrationEnvelope?: unknown }).migrationEnvelope === 'object') {
    const existing = (raw as { migrationEnvelope?: unknown }).migrationEnvelope as { sourceSchemaVersion?: unknown } | undefined;
    if (existing?.sourceSchemaVersion !== undefined) diagnostics.sourceSchemaVersion = typeof existing.sourceSchemaVersion === 'number'
      ? existing.sourceSchemaVersion
      : diagnostics.sourceSchemaVersion;
  }

  if (schema === assistantStateSchema) {
    return repairAssistantState(raw);
  }

  if (schema === criterionSchema) {
    return schema.parse(raw);
  }

  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;

  if (schema instanceof z.ZodObject) {
    const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const output: Record<string, unknown> = {};
    const keys = Object.keys(shape);
    const unknownKeys = Object.keys(source).filter((key) => !keys.includes(key));
    for (const unknown of unknownKeys) {
      const unknownPath = [...path, unknown];
      const unknownValue = source[unknown];
      if (isSensitivePath(unknownPath.join('.'))) {
        diagnostics.redactedFields.push(unknownPath.join('.'));
        continue;
      }
      if (unknownValue !== null && typeof unknownValue === 'object') {
        const nestedValue = sanitizeUnknownValue(unknownValue, diagnostics, unknownPath);
        diagnostics.unknownFields[unknownPath.join('.')] = nestedValue;
        output[unknown] = nestedValue;
        continue;
      }
      diagnostics.unknownFields[unknownPath.join('.')] = unknownValue;
    }
    for (const key of keys) {
      const childPath = [...path, key];
      const candidate = source[key];
      try {
        output[key] = sanitizeUnknowns(candidate, shape[key] as z.ZodTypeAny, diagnostics, childPath);
      } catch {
        diagnostics.invalidFields[childPath.join('.')] = candidate;
        output[key] = sanitizeUnknowns(undefined, shape[key] as z.ZodTypeAny, diagnostics, childPath);
      }
    }
    return output;
  }

  if (schema instanceof z.ZodArray) {
    if (!Array.isArray(raw)) {
      diagnostics.invalidFields[path.join('.')] = raw;
      return sanitizeUnknowns([], schema, diagnostics, path);
    }

    const arraySchema = schema as z.ZodArray<z.ZodTypeAny>;
    const itemSchema = (arraySchema as { element: z.ZodTypeAny }).element;
    return raw.map((item, index) => sanitizeUnknowns(item, itemSchema, diagnostics, [...path, String(index)]));
  }

  if (schema instanceof z.ZodDefault) {
    if (raw === undefined) {
      return schema.parse(raw);
    }

    const innerSchema = schema._def.innerType;
    if (innerSchema === assistantStateSchema) {
      return repairAssistantState(raw);
    }

    try {
      return schema.parse(raw);
    } catch {
      diagnostics.invalidFields[path.join('.')] = raw;
      return schema.parse(undefined);
    }
  }

  if (schema.safeParse(raw).success) return schema.parse(raw);

  diagnostics.invalidFields[path.join('.')] = raw;
  return schema.parse(undefined);
}

export function createBlankTask(nombre: string, directiva: string, tipo = 'general', plantillaDe: string | null = null): Task {
  return repairTask({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, nombre, directiva, tipo, plantillaDe, created: Date.now() });
}

export function repairTask(input: unknown): Task {
  const rawInput = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const sourceSchemaVersion = typeof rawInput.schemaVersion === 'number' ? rawInput.schemaVersion : null;

  const diagnostics: MigrationEnvelope = {
    sourceSchemaVersion,
    unknownFields: {},
    invalidFields: {},
    redactedFields: [],
  };

  const sanitized = sanitizeUnknowns(rawInput, taskSchema, diagnostics, []) as Partial<Task>;
  const parsed = taskSchema.parse(sanitized);
  const phase = parsed.fase;
  const directiva = parsed.directiva ?? '';
  const analysis = parsed.f1.analisisProblema;
  const effectiveSourceSchemaVersion = parsed.schemaVersion !== diagnostics.sourceSchemaVersion || diagnostics.sourceSchemaVersion === null
    ? diagnostics.sourceSchemaVersion
    : null;

  const withCompatibilityFixes = {
    ...parsed,
    id: parsed.id || `recovered-${hashForValue(rawInput)}`,
    f1: {
      ...parsed.f1,
      analisisProblema: {
        ...analysis,
        ...(phase > 1 && !rawInput.f1
          ? {
              decision: 'mantener' as z.infer<typeof problemDecisionSchema>,
              problemaVigente: directiva,
              justificacion: analysis.justificacion || 'Decisión de compatibilidad aplicada para conservar el progreso heredado.',
            }
          : {}),
      },
      linaje: parsed.f1.linaje.length ? parsed.f1.linaje : [{}],
    },
    f2: {
      ...parsed.f2,
      predicciones: parsed.f2.predicciones.length >= 3
        ? parsed.f2.predicciones
        : [
            ...parsed.f2.predicciones,
            ...Array.from({ length: Math.max(0, 3 - parsed.f2.predicciones.length) }, () => ({ texto: '', umbral: '', conf: 'media' as const })),
          ],
    },
    f3: {
      ...parsed.f3,
      iteraciones: parsed.f3.iteraciones.map((iteration, index) => ({
        ...iteration,
        id: iteration.id || `iteration-${index + 1}`,
        criterioIds: iteration.criterioIds.filter((criterionId) => criterionId),
      })),
    },
    f4: {
      ...parsed.f4,
      aar: parsed.f4.aar.length ? parsed.f4.aar : (phase === 4 ? [{ pred: '', observado: '', causa: '', mia: false }] : []),
    },
    migrationEnvelope: {
      sourceSchemaVersion: effectiveSourceSchemaVersion,
      unknownFields: diagnostics.unknownFields,
      invalidFields: diagnostics.invalidFields,
      redactedFields: diagnostics.redactedFields,
    },
    assistant: repairAssistantState(parsed.assistant),
  };

  const criteria = withCompatibilityFixes.f2.criterios.map((criterion, index) => ({
    ...criterion,
    id: criterion.id || `criterion-${index + 1}`,
  }));
  const criterionIds = new Set(criteria.map((criterion) => criterion.id));

  const lineage = withCompatibilityFixes.f1.linaje.length ? withCompatibilityFixes.f1.linaje : [{}];
  const iterationDefaults = withCompatibilityFixes.f3.iteraciones.map((iteration, index) => ({
    ...iteration,
    id: iteration.id || `iteration-${index + 1}`,
    criterioIds: iteration.criterioIds.filter((criterionId) => criterionIds.has(criterionId)),
  }));

  return {
    ...withCompatibilityFixes,
    f1: { ...withCompatibilityFixes.f1, linaje: lineage },
    f2: { ...withCompatibilityFixes.f2, criterios: criteria },
    f3: { ...withCompatibilityFixes.f3, iteraciones: iterationDefaults },
    f4: { ...withCompatibilityFixes.f4 },
  };
}
