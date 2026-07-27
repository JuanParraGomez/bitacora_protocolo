import { createHash } from 'node:crypto';

import { repairTask } from './task.schema';
import { formUpdateSchema, type FormUpdate, phaseList, type TaskPhase, type PhaseEvaluation } from './task-assistant.schema';
import type { Task } from './task.schema';

type PhaseSnapshot = { phase: TaskPhase; fields: Record<string, unknown> };

type ResponseLike = {
  taskId: string;
  phase: TaskPhase;
  responseRevision: string;
  requestId?: string;
};


const hashSnapshot = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

function extractPhaseData(task: Task, phase: TaskPhase): Record<string, unknown> {
  if (phase === 1) {
    const { linaje, dudas, checkMapeo, confirmacion, analisisProblema } = task.f1;
    const { justificacion: _justificacion, ...remainingAnalysis } = analisisProblema as Record<string, unknown>;
    return { linaje, dudas, checkMapeo, confirmacion, analisisProblema: remainingAnalysis };
  }
  if (phase === 2) {
    const { decision, faqs, alcance, noObjetivos, pasos, descartadas, guia, criterios, predicciones } = task.f2;
    return { decision, faqs, alcance, noObjetivos, pasos, descartadas, guia, criterios, predicciones };
  }
  if (phase === 3) {
    const { iteraciones, checkCompila, checkAuditado, notas } = task.f3;
    return { iteraciones, checkCompila, checkAuditado, notas };
  }
  const { aar, cambio, patron, titulo, conexiones, mejorasCriterios } = task.f4;
  return { aar, cambio, patron, titulo, conexiones, mejorasCriterios };
}

function normalizePhase(task: Task, phase?: Task['fase']): TaskPhase {
  const value = typeof phase === 'number' ? phase : task.fase;
  return phaseList.includes(value as TaskPhase) ? value as TaskPhase : task.fase;
}

export function buildPhaseSnapshot(taskInput: Task, phase?: Task['fase']): PhaseSnapshot {
  const task = repairTask(taskInput);
  const normalizedPhase = normalizePhase(task, phase);
  return { phase: normalizedPhase, fields: extractPhaseData(task, normalizedPhase) };
}

export function buildPhaseRevision(taskInput: Task, phase?: Task['fase']): string {
  const snapshot = buildPhaseSnapshot(taskInput, phase);
  return hashSnapshot(snapshot);
}

export function getLatestCurrentEvaluation(taskInput: Task): PhaseEvaluation | null {
  const task = repairTask(taskInput);
  const assistant = task.assistant;
  if (!assistant?.evaluations?.length) return null;
  const latest = [...assistant.evaluations]
    .filter((evaluation) => evaluation.taskId === task.id && evaluation.phase === task.fase)
    .sort((left, right) => right.createdAt - left.createdAt)[0];
  return latest ?? null;
}

export function isEvaluationCurrent(taskInput: Task, evaluation: PhaseEvaluation | null | undefined): boolean {
  if (!evaluation) return false;
  const task = repairTask(taskInput);
  const expectedRevision = buildPhaseRevision(task, task.fase);
  return evaluation.taskId === task.id && evaluation.phase === task.fase && evaluation.responseRevision === expectedRevision;
}

export function classifyResponseConflict({ task, response }: { task: Task; response: ResponseLike }): boolean {
  if (response.taskId !== task.id) return true;
  if (response.phase !== task.fase) return true;
  const revision = buildPhaseRevision(task, task.fase);
  return response.responseRevision !== revision;
}

export function canContinueByAssistant(taskInput: Task): boolean {
  const task = repairTask(taskInput);
  const latest = getLatestCurrentEvaluation(task);
  const hasOpenGate = isGateOpen(task);
  return hasOpenGate && !!latest && latest.status === 'acceptable' && isEvaluationCurrent(task, latest);
}

function isGateOpen(task: Task): boolean {
  const filled = (value: unknown): boolean => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

  if (task.fase === 1) {
    const hasLineage = task.f1.linaje.some(row => Object.values(row).filter(filled).length >= 2);
    return [
      ...(hasLineage ? [] : ['Completa al menos una relación de linaje con dos campos.']),
      ...(task.f1.checkMapeo || task.f1.confirmacion ? [] : ['Confirma el mapeo completo antes de avanzar.']),
      ...(task.f1.analisisProblema.decision === 'mantener' || task.f1.analisisProblema.decision === 'reformular' ? [] : ['Decide si mantienes o reformulas el problema.']),
      ...(task.f1.analisisProblema.problemaDetectado.trim() && task.f1.analisisProblema.evidencia.trim() && task.f1.analisisProblema.analisis.trim() ? [] : ['Completa el problema, la evidencia y el análisis.']),
      ...(task.f1.analisisProblema.justificacion.trim() && task.f1.analisisProblema.problemaVigente.trim() ? [] : ['Justifica la decisión y escribe la formulación vigente.']),
    ].length === 0;
  }
  if (task.fase === 2) {
    const completePredictions = task.f2.predicciones.filter((prediction) => filled(prediction.texto) && filled(prediction.umbral)).length;
    return [
      ...(filled(task.f2.decision) ? [] : ['Escribe la decisión o resultado que habilita la tarea.']),
      ...(filled(task.f2.alcance) && filled(task.f2.noObjetivos) ? [] : ['Define alcance y no-objetivos.']),
      ...(filled(task.f2.pasos) ? [] : ['Esquematiza los pasos.']),
      ...(completePredictions >= 3 ? [] : ['Completa tres predicciones con texto y umbral.']),
    ].length === 0;
  }
  if (task.fase === 3) {
    return [
      ...(task.f3.iteraciones.some(iteration => filled(iteration.intento)) ? [] : ['Registra al menos una iteración.']),
      ...(task.f3.checkCompila ? [] : ['Confirma que compila.']),
      ...(task.f3.checkAuditado ? [] : ['Confirma que fue auditado.']),
    ].length === 0;
  }
  const completeReviews = task.f4.aar.filter(item => filled(item.observado) && filled(item.causa)).length;
  return [
    ...(completeReviews === task.f4.aar.length ? [] : ['Completa observado y causa en cada predicción.']),
    ...(task.f4.aar.some(item => item.mia) ? [] : ['Marca al menos una suposición propia como causa.']),
    ...(filled(task.f4.cambio) ? [] : ['Define un cambio procedimental concreto.']),
    ...(filled(task.f4.titulo) ? [] : ['Titula el registro con una afirmación.']),
  ].length === 0;
}

export function isAllowedPhaseFieldPath(field: string, phase: TaskPhase): boolean {
  const available = {
    1: ['f1.checkMapeo', 'f1.confirmacion', 'f1.linaje', 'f1.dudas', 'f1.analisisProblema.problemaDetectado', 'f1.analisisProblema.evidencia', 'f1.analisisProblema.analisis', 'f1.analisisProblema.decision', 'f1.analisisProblema.justificacion', 'f1.analisisProblema.problemaVigente'],
    2: ['f2.decision', 'f2.faqs', 'f2.alcance', 'f2.noObjetivos', 'f2.pasos', 'f2.descartadas', 'f2.guia', 'f2.criterios', 'f2.predicciones'],
    3: ['f3.iteraciones', 'f3.checkCompila', 'f3.checkAuditado', 'f3.notas'],
    4: ['f4.aar', 'f4.cambio', 'f4.patron', 'f4.titulo', 'f4.conexiones', 'f4.mejorasCriterios'],
  } as const;
  return available[phase] ? available[phase].includes(field as (typeof available)[TaskPhase][number]) : false;
}

export function validateUpdateForTask(taskInput: Task, update: FormUpdate): boolean {
  const task = repairTask(taskInput);
  const parsed = formUpdateSchema.safeParse(update);
  if (!parsed.success) return false;
  if (parsed.data.status !== 'proposed') return true;
  if (parsed.data.baseRevision !== buildPhaseRevision(task, task.fase)) return false;
  return isAllowedPhaseFieldPath(parsed.data.field, task.fase);
}
