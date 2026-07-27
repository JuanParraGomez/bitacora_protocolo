import { z } from 'zod';

export const taskPhaseSchema = z.number().int().min(1).max(4).default(1);
export const phaseSchema = taskPhaseSchema;
export const phaseList = [1, 2, 3, 4] as const;
export type TaskPhase = (typeof phaseList)[number];

export const assistantRoleSchema = z.enum(['user', 'assistant']);
export const assistantMessageStatusSchema = z.enum(['sending', 'sent', 'error']);
export const formUpdateStatusSchema = z.enum(['proposed', 'applied', 'rejected', 'conflict']);
export const phaseEvaluationStatusSchema = z.enum(['acceptable', 'needs-work', 'error']);
export const assistanceModeSchema = z.enum(['codex', 'deepseek']);
export const assistanceConnectionStatusSchema = z.literal('deferred');

export const assistantTextPartSchema = z.object({
  type: z.literal('text'),
  text: z.string().default(''),
});

const phaseDecisionSchema = z.enum(['pendiente', 'mantener', 'reformular']);
const criterionPrioritySchema = z.enum(['alta', 'media', 'baja']).default('media');
const criterionStatusSchema = z.enum(['pendiente', 'en-progreso', 'resuelto', 'descartado']).default('pendiente');
const criterionImpactSchema = z.enum(['alto', 'medio', 'bajo']).default('medio');
const criterionConfSchema = z.enum(['baja', 'media', 'alta']).default('media');

const criterionSchema = z.object({
  id: z.string().min(1),
  texto: z.string().default(''),
  comentario: z.string().default(''),
  prioridad: criterionPrioritySchema,
  estado: criterionStatusSchema,
  impacto: criterionImpactSchema,
}).strict();

const predictionSchema = z.object({
  texto: z.string().default(''),
  umbral: z.string().default(''),
  conf: criterionConfSchema,
}).strict();

const iterationSchema = z.object({
  id: z.string().min(1),
  intento: z.string().default(''),
  resultado: z.string().default(''),
  ajuste: z.string().default(''),
  criterioIds: z.array(z.string()).default([]),
}).strict();

const criterionImprovementSchema = z.object({
  criterioId: z.string().min(1),
  confirmado: z.boolean().default(false),
  mejora: z.string().default(''),
}).strict();

const reviewSchema = z.object({
  pred: z.string().default(''),
  observado: z.string().default(''),
  causa: z.string().default(''),
  mia: z.boolean().default(false),
}).strict();

const problemAnalysisSchema = z.object({
  problemaDetectado: z.string().default(''),
  evidencia: z.string().default(''),
  analisis: z.string().default(''),
  decision: phaseDecisionSchema.default('pendiente'),
  justificacion: z.string().default(''),
  problemaVigente: z.string().default(''),
}).strict();

export const assistanceSettingsSchema = z.object({
  mode: assistanceModeSchema.default('codex'),
  connectionStatus: assistanceConnectionStatusSchema.default('deferred'),
  schemaVersion: z.literal(1).default(1),
}).strict();

const formUpdateCommon = {
  id: z.string().min(1).default(() => `update-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
  sourceMessageId: z.string().min(1),
  baseRevision: z.string().default(''),
  status: formUpdateStatusSchema.default('proposed'),
};

const updateFieldMap = {
  'f1.dudas': z.string().default(''),
  'f1.checkMapeo': z.boolean().default(false),
  'f1.confirmacion': z.boolean().default(false),
  'f1.linaje': z.array(z.record(z.string(), z.string())).default([]),
  'f1.analisisProblema.problemaDetectado': z.string().default(''),
  'f1.analisisProblema.evidencia': z.string().default(''),
  'f1.analisisProblema.analisis': z.string().default(''),
  'f1.analisisProblema.decision': phaseDecisionSchema.default('pendiente'),
  'f1.analisisProblema.justificacion': z.string().default(''),
  'f1.analisisProblema.problemaVigente': z.string().default(''),
  'f2.decision': z.string().default(''),
  'f2.faqs': z.string().default(''),
  'f2.alcance': z.string().default(''),
  'f2.noObjetivos': z.string().default(''),
  'f2.pasos': z.string().default(''),
  'f2.descartadas': z.string().default(''),
  'f2.guia': z.string().default(''),
  'f2.criterios': z.array(criterionSchema).default([]),
  'f2.predicciones': z.array(predictionSchema).default([]),
  'f3.iteraciones': z.array(iterationSchema).default([]),
  'f3.checkCompila': z.boolean().default(false),
  'f3.checkAuditado': z.boolean().default(false),
  'f3.notas': z.string().default(''),
  'f4.aar': z.array(reviewSchema).default([]),
  'f4.cambio': z.string().default(''),
  'f4.patron': z.string().default(''),
  'f4.titulo': z.string().default(''),
  'f4.conexiones': z.string().default(''),
  'f4.mejorasCriterios': z.array(criterionImprovementSchema).default([]),
} as const;

const formUpdateUnionEntries = Object.entries(updateFieldMap).map(([field, valueSchema]) =>
  z.object({
    ...formUpdateCommon,
    field: z.literal(field as keyof typeof updateFieldMap),
    value: valueSchema,
  }),
);

type FormUpdateUnionEntry = (typeof formUpdateUnionEntries)[number];
export const formUpdateSchema = z.discriminatedUnion('field', formUpdateUnionEntries as [FormUpdateUnionEntry, ...FormUpdateUnionEntry[]]);

export const assistantMessageSchema: z.ZodType<any> = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  phase: taskPhaseSchema,
  role: assistantRoleSchema,
  parts: z.array(assistantTextPartSchema).default([]),
  status: assistantMessageStatusSchema.default('sent'),
  createdAt: z.number().int().min(0).default(() => Date.now()),
  updates: z.array(formUpdateSchema as z.ZodType<any>).default([]),
}).strict().superRefine((message, ctx) => {
  if (message.role === 'assistant' && message.status !== 'sent') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Only user messages may have pending or error status.' });
  }
});

export const phaseEvaluationSchema = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  phase: taskPhaseSchema,
  responseRevision: z.string(),
  evaluatorVersion: z.string().default('mock-v1'),
  status: phaseEvaluationStatusSchema,
  weaknesses: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  gatePassed: z.boolean().default(false),
  gateReasons: z.array(z.string()).default([]),
  createdAt: z.number().int().min(0).default(() => Date.now()),
}).strict().superRefine((evaluation, ctx) => {
  if (evaluation.status === 'acceptable' && (evaluation.weaknesses.length > 0 || evaluation.recommendations.length > 0 || evaluation.gateReasons.length > 0 || !evaluation.gatePassed)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'acceptable must have empty weaknesses/recommendations, no gate reasons and gatePassed true.' });
  }
  if (evaluation.status !== 'acceptable' && (evaluation.weaknesses.length === 0 || evaluation.recommendations.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'needs-work/error requires weaknesses and recommendations.' });
  }
});

export const assistantStateSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  messages: z.array(assistantMessageSchema).default([]),
  evaluations: z.array(phaseEvaluationSchema).default([]),
  settings: assistanceSettingsSchema.default(() => assistanceSettingsSchema.parse({})),
}).strict();

export type AssistantTextPart = z.infer<typeof assistantTextPartSchema>;
export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export type FormUpdate = z.infer<typeof formUpdateSchema>;
export type PhaseEvaluation = z.infer<typeof phaseEvaluationSchema>;
export type AssistantState = z.infer<typeof assistantStateSchema>;
export type AssistanceSettings = z.infer<typeof assistanceSettingsSchema>;

const assistantStateDefaults: AssistantState = {
  schemaVersion: 1,
  messages: [],
  evaluations: [],
  settings: {
    mode: 'codex',
    connectionStatus: 'deferred',
    schemaVersion: 1,
  },
};

function normalizeArray<T>(raw: unknown, schema: z.ZodType<T>): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? parsed.data : undefined;
  }).filter((item): item is T => item !== undefined);
}

export function repairAssistantState(input: unknown): AssistantState {
  const candidate = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const schemaVersion = candidate.schemaVersion === 1 ? 1 : assistantStateDefaults.schemaVersion;
  const messages = normalizeArray(candidate.messages, assistantMessageSchema);
  const evaluations = normalizeArray(candidate.evaluations, phaseEvaluationSchema);
  const candidateSettings = typeof candidate.settings === 'object' && candidate.settings !== null ? { ...(candidate.settings as Record<string, unknown>) } : {};
  ['apiKey', 'connection', 'token', 'secret', 'organization', 'org', 'endpoint', 'baseUrl', 'credentials'].forEach((secretKey) => {
    if (secretKey in candidateSettings) delete candidateSettings[secretKey];
  });
  const parsedSettings = assistanceSettingsSchema.safeParse(candidateSettings).success
    ? assistanceSettingsSchema.parse(candidateSettings)
    : assistantStateDefaults.settings;

  return {
    schemaVersion,
    messages,
    evaluations,
    settings: parsedSettings,
  };
}

export function repairAssistantStateForTask(
  input: unknown,
  context: { taskId: string; phase: TaskPhase },
): AssistantState {
  const repaired = repairAssistantState(input);
  const uniqueMessageIds = new Set<string>();
  const uniqueEvaluationIds = new Set<string>();

  const filteredMessages = repaired.messages
    .filter((message) => message.taskId === context.taskId && message.phase === context.phase && !uniqueMessageIds.has(message.id) && (uniqueMessageIds.add(message.id), true));
  const filteredEvaluations = repaired.evaluations
    .filter((evaluation) => evaluation.taskId === context.taskId && evaluation.phase === context.phase && !uniqueEvaluationIds.has(evaluation.id) && (uniqueEvaluationIds.add(evaluation.id), true));

  return { ...repaired, messages: filteredMessages, evaluations: filteredEvaluations };
}
