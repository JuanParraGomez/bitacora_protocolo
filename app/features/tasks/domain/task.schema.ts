import { z } from 'zod';
import { assistantStateSchema, repairAssistantState, type AssistantState } from './task-assistant.schema';

export const problemDecisionSchema = z.enum(['pendiente', 'mantener', 'reformular']).default('pendiente');
export const criterionPrioritySchema = z.enum(['alta', 'media', 'baja']).default('media');
export const criterionStatusSchema = z.enum(['pendiente', 'en-progreso', 'resuelto', 'descartado']).default('pendiente');
export const criterionImpactSchema = z.enum(['alto', 'medio', 'bajo']).default('medio');

export const problemAnalysisSchema = z.object({
  problemaDetectado: z.string().default(''), evidencia: z.string().default(''), analisis: z.string().default(''),
  decision: problemDecisionSchema, justificacion: z.string().default(''), problemaVigente: z.string().default(''),
});
const problemAnalysisDefaults = { problemaDetectado: '', evidencia: '', analisis: '', decision: 'pendiente' as const, justificacion: '', problemaVigente: '' };

export const criterionSchema = z.object({
  id: z.string().default(''), texto: z.string().default(''), comentario: z.string().default(''),
  prioridad: criterionPrioritySchema, estado: criterionStatusSchema, impacto: criterionImpactSchema,
});

export const predictionSchema = z.object({
  texto: z.string().default(''),
  umbral: z.string().default(''),
  conf: z.enum(['baja', 'media', 'alta']).default('media'),
});

export const iterationSchema = z.object({
  id: z.string().default(''),
  intento: z.string().default(''),
  resultado: z.string().default(''),
  ajuste: z.string().default(''),
  criterioIds: z.array(z.string()).default([]),
});

export const criterionImprovementSchema = z.object({
  criterioId: z.string(), confirmado: z.boolean().default(false), mejora: z.string().default(''),
});

export const reviewSchema = z.object({
  pred: z.string().default(''),
  observado: z.string().default(''),
  causa: z.string().default(''),
  mia: z.boolean().default(false),
});

export const phaseOneSchema = z.object({
  linaje: z.array(z.record(z.string(), z.string())).default([{}]),
  dudas: z.string().default(''),
  checkMapeo: z.boolean().default(false),
  confirmacion: z.boolean().default(false),
  promptOrientacion: z.string().default(''),
  promptOrientacionPersonalizado: z.boolean().default(false),
  analisisProblema: problemAnalysisSchema.default(problemAnalysisDefaults),
});

export const phaseTwoSchema = z.object({
  decision: z.string().default(''), faqs: z.string().default(''),
  alcance: z.string().default(''), noObjetivos: z.string().default(''),
  pasos: z.string().default(''), descartadas: z.string().default(''),
  guia: z.string().default(''), promptGuia: z.string().default(''),
  promptGuiaPersonalizado: z.boolean().default(false), criterios: z.array(criterionSchema).default([]),
  predicciones: z.array(predictionSchema).default([
    { texto: '', umbral: '', conf: 'media' },
    { texto: '', umbral: '', conf: 'media' },
    { texto: '', umbral: '', conf: 'media' },
  ]),
});

export const phaseThreeSchema = z.object({
  iteraciones: z.array(iterationSchema).default([{ id: '', intento: '', resultado: '', ajuste: '', criterioIds: [] }]),
  checkCompila: z.boolean().default(false), checkAuditado: z.boolean().default(false),
  notas: z.string().default(''), promptEjecucion: z.string().default(''), promptEjecucionPersonalizado: z.boolean().default(false),
});

export const phaseFourSchema = z.object({
  aar: z.array(reviewSchema).default([]), cambio: z.string().default(''),
  patron: z.string().default(''), titulo: z.string().default(''),
  conexiones: z.string().default(''), promptAar: z.string().default(''), promptAarPersonalizado: z.boolean().default(false),
  mejorasCriterios: z.array(criterionImprovementSchema).default([]),
});

const phaseOneDefaults = { linaje: [{}], dudas: '', checkMapeo: false, confirmacion: false, promptOrientacion: '', promptOrientacionPersonalizado: false, analisisProblema: problemAnalysisDefaults };
const phaseTwoDefaults = { decision: '', faqs: '', alcance: '', noObjetivos: '', pasos: '', descartadas: '', guia: '', promptGuia: '', promptGuiaPersonalizado: false, criterios: [], predicciones: [
  { texto: '', umbral: '', conf: 'media' as const }, { texto: '', umbral: '', conf: 'media' as const }, { texto: '', umbral: '', conf: 'media' as const },
] };
const phaseThreeDefaults = { iteraciones: [{ id: '', intento: '', resultado: '', ajuste: '', criterioIds: [] }], checkCompila: false, checkAuditado: false, notas: '', promptEjecucion: '', promptEjecucionPersonalizado: false };
const phaseFourDefaults = { aar: [], cambio: '', patron: '', titulo: '', conexiones: '', promptAar: '', promptAarPersonalizado: false, mejorasCriterios: [] };

export const taskSchema = z.object({
  id: z.string().min(1), nombre: z.string().default(''), directiva: z.string().default(''),
  tipo: z.string().default('general'), created: z.number().default(0),
  fase: z.number().int().min(1).max(4).default(1),
  estado: z.enum(['activa', 'completada']).default('activa'), plantillaDe: z.string().nullable().default(null),
  f1: phaseOneSchema.default(phaseOneDefaults), f2: phaseTwoSchema.default(phaseTwoDefaults),
  f3: phaseThreeSchema.default(phaseThreeDefaults), f4: phaseFourSchema.default(phaseFourDefaults),
  assistant: assistantStateSchema.default(() => repairAssistantState(undefined)),
});

export const taskIndexSchema = z.object({
  tareas: z.array(z.object({ id: z.string(), nombre: z.string(), fase: z.number(), estado: z.string(), tipo: z.string() })).default([]),
  registros: z.array(z.object({ id: z.string(), titulo: z.string().default(''), tareaId: z.string().optional() })).default([]),
});

export type Prediction = z.infer<typeof predictionSchema>;
export type ProblemAnalysis = z.infer<typeof problemAnalysisSchema>;
export type Criterion = z.infer<typeof criterionSchema>;
export type Iteration = z.infer<typeof iterationSchema>;
export type CriterionImprovement = z.infer<typeof criterionImprovementSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskIndex = z.infer<typeof taskIndexSchema>;
export type { AssistantState };

export function createBlankTask(nombre: string, directiva: string, tipo = 'general', plantillaDe: string | null = null): Task {
  return repairTask({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, nombre, directiva, tipo, plantillaDe, created: Date.now() });
}

export function repairTask(input: unknown): Task {
  const candidate = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const phase = typeof candidate.fase === 'number' ? candidate.fase : 1;
  const rawPhaseOne = candidate.f1 && typeof candidate.f1 === 'object' ? candidate.f1 as Record<string, unknown> : {};
  const rawAnalysis = rawPhaseOne.analisisProblema && typeof rawPhaseOne.analisisProblema === 'object'
    ? rawPhaseOne.analisisProblema as Record<string, unknown> : {};
  const directiva = typeof candidate.directiva === 'string' ? candidate.directiva : '';
  const analysis = {
    ...rawAnalysis,
    ...(phase > 1 && !rawPhaseOne.analisisProblema ? {
      decision: 'mantener', problemaVigente: directiva,
      justificacion: 'Decisión de compatibilidad aplicada para conservar el progreso heredado.',
    } : {}),
  };
  const parsed = taskSchema.parse({ ...candidate, id: typeof candidate.id === 'string' && candidate.id ? candidate.id : `recovered-${Date.now()}`, f1: { ...rawPhaseOne, analisisProblema: analysis } });
  const criteria = parsed.f2.criterios.map((criterion, index) => ({ ...criterion, id: criterion.id || `criterion-${index + 1}` }));
  const predictions = [...parsed.f2.predicciones];
  while (predictions.length < 3) predictions.push({ texto: '', umbral: '', conf: 'media' });
  const criterionIds = new Set(criteria.map(criterion => criterion.id));
  const iterations = parsed.f3.iteraciones.map((iteration, index) => ({
    ...iteration, id: iteration.id || `iteration-${index + 1}`,
    criterioIds: iteration.criterioIds.filter(id => criterionIds.has(id)),
  }));
  const lineage = parsed.f1.linaje.length ? parsed.f1.linaje : [{}];
  const aar = parsed.fase === 4 && parsed.f4.aar.length === 0 ? [{ pred: '', observado: '', causa: '', mia: false }] : parsed.f4.aar;
  return { ...parsed, f1: { ...parsed.f1, linaje: lineage }, f2: { ...parsed.f2, criterios: criteria, predicciones: predictions }, f3: { ...parsed.f3, iteraciones: iterations }, f4: { ...parsed.f4, aar } };
}
