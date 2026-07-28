import { z } from 'zod';

const unsafeContentPattern = /<\s*script\b|javascript:\s*|on[a-z]+\s*=/i;

const safeTrimmedText = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => !unsafeContentPattern.test(value), {
    message: 'Contenido potencialmente inseguro.',
  });

const safeText = z
  .string()
  .default('')
  .transform((value) => value.trim())
  .refine((value) => !unsafeContentPattern.test(value), {
    message: 'Contenido potencialmente inseguro.',
  });

const nonEmptySafeText = safeTrimmedText.refine((value) => value.length > 0, {
  message: 'No puede estar vacío.',
});

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const normalized = safeTrimmedText.parse(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
  }
  return output;
}

export const evidenceKindSchema = z.enum(['note', 'link', 'artifact', 'observation']);

export const evidenceReferenceSchema = z.object({
  id: z.string().default(() => `evidence-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`),
  kind: evidenceKindSchema,
  label: nonEmptySafeText,
  value: safeText,
}).superRefine((value, ctx) => {
  if (value.value.length === 0 && value.kind !== 'note') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'La evidencia requiere contenido explícito.',
    });
  }
  if (value.kind === 'link' && !value.value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'La evidencia de enlace requiere una referencia explícita.',
    });
  }
  if (value.label.length > 120) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['label'],
      message: 'La etiqueta debe ser corta y descriptiva.',
    });
  }
});

export const criterionResultSchema = z.object({
  criterion: nonEmptySafeText,
  passed: z.boolean().default(false),
});

export const iterationSchema = z.object({
  id: z.string().default(() => `iteration-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  intento: nonEmptySafeText,
  resultado: nonEmptySafeText,
  ajuste: safeText,
  criterioIds: z.array(safeText).transform(uniqueStrings).default([]),
  methodVersionId: z.string().nullable().default(null),
  objective: nonEmptySafeText,
  action: nonEmptySafeText,
  tool: nonEmptySafeText,
  input: nonEmptySafeText,
  result: nonEmptySafeText,
  evidence: z.array(evidenceReferenceSchema).default([]),
  learning: nonEmptySafeText,
  nextAdjustment: nonEmptySafeText,
  applicableConditions: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  success: z.boolean().default(false),
  successCriteriaResults: z.array(criterionResultSchema).default([]),
  createdAt: z.number().default(() => Date.now()),
}).superRefine((value, ctx) => {
  if (!value.methodVersionId || value.methodVersionId.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['methodVersionId'],
      message: 'Una iteración de ejecución requiere versionar el método aplicado.',
    });
  }

  if (value.evidence.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['evidence'],
      message: 'Registra al menos una evidencia por iteración.',
    });
  }

  if (value.evidence.length !== new Set(value.evidence.map((item) => item.id)).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['evidence'],
      message: 'Las evidencias deben tener identificadores únicos.',
    });
  }

  if (value.applicableConditions.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['applicableConditions'],
      message: 'Declara condiciones aplicables para medir la repetibilidad.',
    });
  }

  if (value.nextAdjustment.toLowerCase() === 'na' || value.nextAdjustment.toLowerCase() === 'n/a') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nextAdjustment'],
      message: 'La siguiente acción debe ser explícita y accionable.',
    });
  }

  if (value.successCriteriaResults.some((result) => typeof result.passed !== 'boolean')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['successCriteriaResults'],
      message: 'Cada criterio debe reportar un resultado booleano.',
    });
  }
});

export const solutionStepSchema = z.object({
  id: z.string().default(() => `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  title: nonEmptySafeText,
  objective: nonEmptySafeText,
  dependencies: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  inputs: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  output: nonEmptySafeText,
  tool: z.string().default(''),
  risk: nonEmptySafeText,
  successCriterion: nonEmptySafeText,
  sourceCriterionId: z.string().nullable().default(null),
}).superRefine((value, ctx) => {
  if (value.dependencies.includes(value.id)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['dependencies'],
      message: 'El paso no puede depender de sí mismo.',
    });
  }
});

export const methodVersionStatusSchema = z.enum(['draft', 'published', 'superseded']);
export const methodChangeKindSchema = z.enum(['initial', 'material']);

export const automationOpportunityClassificationSchema = z.enum(['manual', 'assistable', 'automatable']);

export const methodVersionSchema = z.object({
  id: z.string().default(() => `method-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  version: z.number().int().min(1).default(1),
  parentVersionId: z.string().nullable().default(null),
  status: methodVersionStatusSchema.default('draft'),
  changeKind: methodChangeKindSchema.default('initial'),
  preconditions: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  steps: z.array(solutionStepSchema).default([]),
  tools: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  inputs: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  outputs: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  controls: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  exceptions: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  exceptionsReviewed: z.boolean().default(false),
  successCriteria: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  supportingIterationIds: z.array(safeText).transform(uniqueStrings).default([]),
  createdAt: z.number().default(() => Date.now()),
}).superRefine((value, ctx) => {
  if (value.steps.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['steps'],
      message: 'La versión del método requiere al menos un paso.',
    });
  }

  const isStrict = value.status === 'published';
  if (value.preconditions.length === 0 && isStrict) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['preconditions'], message: 'Una versión publicada requiere precondiciones.' });
  }
  if (value.inputs.length === 0 && isStrict) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['inputs'], message: 'Una versión publicada requiere entradas.' });
  }
  if (value.outputs.length === 0 && isStrict) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['outputs'], message: 'Una versión publicada requiere salidas.' });
  }
  if (value.controls.length === 0 && isStrict) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['controls'], message: 'Una versión publicada requiere controles de seguridad o humanos.' });
  }
  if (value.successCriteria.length === 0 && isStrict) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['successCriteria'], message: 'Una versión publicada requiere criterios de éxito.' });
  }
  if (value.exceptionsReviewed !== true && isStrict) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['exceptionsReviewed'], message: 'Las excepciones deben ser revisadas antes de publicar.' });
  }

  if (value.changeKind === 'material' && !value.parentVersionId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['parentVersionId'], message: 'El cambio material requiere versión padre.' });
  }
});

export const automationOpportunitySchema = z.object({
  id: z.string().default(() => `candidate-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
  methodVersionId: z.string().min(1, { message: 'La oportunidad requiere una versión de método propietaria.' }),
  stepIds: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  classification: automationOpportunityClassificationSchema,
  frequency: nonEmptySafeText,
  stability: nonEmptySafeText,
  risk: nonEmptySafeText,
  humanJudgment: nonEmptySafeText,
  trigger: z.string().default(''),
  inputs: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  transformation: nonEmptySafeText,
  output: nonEmptySafeText,
  candidateTool: z.string().default(''),
  expectedFailures: z.array(nonEmptySafeText).transform(uniqueStrings).default([]),
  humanCheckpoint: nonEmptySafeText,
  occurrenceIterationIds: z.array(safeText).transform(uniqueStrings).default([]),
}).superRefine((value, ctx) => {
  if (value.stepIds.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stepIds'], message: 'Indica pasos asociados a la oportunidad.' });
  }
  if ((value.classification === 'assistable' || value.classification === 'automatable') && !value.trigger.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['trigger'], message: 'Indica el disparador para clasificación asistible/automatable.' });
  }
  if (value.expectedFailures.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expectedFailures'], message: 'Registra al menos un fallo previsible esperado.' });
  }
  if (value.inputs.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['inputs'], message: 'Necesita entradas observables.' });
  }
});

export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;
export type CriterionResult = z.infer<typeof criterionResultSchema>;
export type Iteration = z.infer<typeof iterationSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;
export type MethodVersion = z.infer<typeof methodVersionSchema>;
export type AutomationOpportunity = z.infer<typeof automationOpportunitySchema>;
export type MethodVersionStatus = z.infer<typeof methodVersionStatusSchema>;
export type MethodChangeKind = z.infer<typeof methodChangeKindSchema>;
export type AutomationOpportunityClassification = z.infer<typeof automationOpportunityClassificationSchema>;

export const methodMaturitySchema = z.enum(['hypothesis', 'proposed-path', 'documented-once', 'repeatable-method']);
export type MethodMaturity = z.infer<typeof methodMaturitySchema>;
