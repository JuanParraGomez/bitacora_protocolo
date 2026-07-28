import { repairTask } from './task.schema';
import {
  formUpdateSchema,
  type FormUpdate,
  phaseList,
  type TaskPhase,
  type PhaseEvaluation,
  type ProposalDecision,
} from './task-assistant.schema';
import type { Task } from './task.schema';

type PhaseSnapshot = { phase: TaskPhase; fields: Record<string, unknown> };

type ResponseLike = {
  taskId: string;
  phase: TaskPhase;
  responseRevision: string;
  requestId?: string;
};

type AssistantUpdateResult = {
  task: Task;
  pending: FormUpdate[];
  applied: Array<FormUpdate & { status: 'applied' }>;
  rejected: Array<FormUpdate>;
};

type ProposalResponseContext = {
  projectId: string;
  taskId: string;
  phase: TaskPhase;
  methodVersionId: string | null;
  baseRevision: string;
};

type AssistantUpdateOptions = {
  response: ProposalResponseContext;
  decision?: ProposalDecision;
};

function currentMethodVersionId(task: Task): string | null {
  const versions = [...task.methodVersions].filter((version) => version.status !== 'superseded');
  if (!versions.length) return null;

  const sorted = versions.sort((left, right) => {
    if (left.version !== right.version) return right.version - left.version;
    return right.createdAt - left.createdAt;
  });

  return sorted[0]?.id ?? null;
}


const hashSnapshot = (value: unknown): string => {
  const source = JSON.stringify(value);
  let left = 0x811c9dc5;
  let right = 0x9e3779b9;

  for (const char of source) {
    const code = char.codePointAt(0) ?? 0;
    left ^= code;
    left = Math.imul(left, 0x01000193) >>> 0;
    right ^= code + left;
    right = Math.imul(right, 0x85ebca6b) >>> 0;
  }

  return `${left.toString(16).padStart(8, '0')}${right.toString(16).padStart(8, '0')}`;
};

function extractPhaseData(task: Task, phase: TaskPhase): Record<string, unknown> {
  if (phase === 1) {
    const {
      linaje,
      dudas,
      checkMapeo,
      confirmacion,
      analisisProblema,
      resultadoDeseado,
      alcance,
      restricciones,
      actores,
      criterioExito,
    } = task.f1;
    return {
      linaje,
      dudas,
      checkMapeo,
      confirmacion,
      analisisProblema,
      resultadoDeseado,
      alcance,
      restricciones,
      actores,
      criterioExito,
    };
  }
  if (phase === 2) {
    const {
      decision,
      faqs,
      alcance,
      noObjetivos,
      pasos,
      descartadas,
      guia,
      criterios,
      predicciones,
      subproblemas,
      preguntasAbiertas,
      riesgos,
    } = task.f2;
    return {
      decision,
      faqs,
      alcance,
      noObjetivos,
      pasos,
      descartadas,
      guia,
      criterios,
      predicciones,
      subproblemas,
      preguntasAbiertas,
      riesgos,
    };
  }
  if (phase === 3) {
    const { iteraciones, checkCompila, checkAuditado, notas } = task.f3;
    return { iteraciones, checkCompila, checkAuditado, notas };
  }
  const { aar, cambio, patron, titulo, conexiones, mejorasCriterios, methodVersionId } = task.f4;
  return { aar, cambio, patron, titulo, conexiones, mejorasCriterios, methodVersionId };
}

function normalizePhase(task: Task, phase?: Task['fase']): TaskPhase {
  const value = typeof phase === 'number' ? phase : task.fase;
  return phaseList.includes(value as TaskPhase) ? value as TaskPhase : task.fase as TaskPhase;
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

function resolveTaskField(target: unknown, key: string): unknown {
  if (!target || typeof target !== 'object') return undefined;
  return (target as Record<string, unknown>)[key];
}

function writeTaskField(target: unknown, key: string, value: unknown): void {
  if (!target || typeof target !== 'object') return;
  (target as Record<string, unknown>)[key] = value;
}

function assignByPath(task: Task, path: string, value: unknown): void {
  const parts = path.split('.');
  let cursor: Record<string, unknown> = task as unknown as Record<string, unknown>;

  for (let index = 0; index < parts.length - 1; index++) {
    const segment = parts[index];
    if (!segment) continue;
    const current = resolveTaskField(cursor, segment);
    if (!current || typeof current !== 'object') {
      const next = {};
      writeTaskField(cursor, segment, next);
      cursor = next as Record<string, unknown>;
      continue;
    }
    cursor = current as Record<string, unknown>;
  }

  const finalSegment = parts.at(-1);
  if (finalSegment) writeTaskField(cursor, finalSegment, value);
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
  if (evaluation.taskId !== task.id || evaluation.phase !== task.fase || evaluation.responseRevision !== expectedRevision) return false;
  if (evaluation.gateVersion !== 'outcome-v2') return false;

  if (task.fase === 4) {
    const activeVersionId = currentMethodVersionId(task);
    return Boolean(activeVersionId && evaluation.methodVersionId === activeVersionId);
  }

  return true;
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

export function classifyUpdateConflict(taskInput: Task, updateInput: FormUpdate): boolean {
  const task = repairTask(taskInput);
  const currentRevision = buildPhaseRevision(task, task.fase);
  const parsed = formUpdateSchema.safeParse(updateInput);

  if (!parsed.success) return true;
  const candidate = parsed.data as FormUpdate;
  if (candidate.status !== 'proposed') return true;
  if (candidate.baseRevision !== currentRevision) return true;
  if (!isAllowedPhaseFieldPath(candidate.field, task.fase as TaskPhase)) return true;

  return false;
}

function stageAssistantUpdates(taskInput: Task, updatesInput: FormUpdate[]): AssistantUpdateResult {
  const task = repairTask(taskInput);
  const currentRevision = buildPhaseRevision(task, task.fase);
  const nextTask = repairTask(JSON.parse(JSON.stringify(task)));
  const pending: FormUpdate[] = [];
  const applied: Array<FormUpdate & { status: 'applied' }> = [];
  const rejected: FormUpdate[] = [];

  for (const update of updatesInput) {
    const parsed = formUpdateSchema.safeParse(update);
    if (!parsed.success) {
      rejected.push({ ...update, status: 'rejected' as const });
      continue;
    }

    const candidate = parsed.data as FormUpdate;
    if (!isAllowedPhaseFieldPath(candidate.field, task.fase as TaskPhase)) {
      rejected.push({ ...candidate, status: 'rejected' as const });
      continue;
    }

    if (candidate.status !== 'proposed' || candidate.baseRevision !== currentRevision) {
      rejected.push({ ...candidate, status: 'conflict' as const });
      continue;
    }

    pending.push(candidate);
  }

  return { task: nextTask, pending, applied, rejected };
}

function proposalResponseIdentityMatches(
  task: Task,
  response: ProposalResponseContext,
): boolean {
  const expectedMethodVersionId = task.fase === 4 ? currentMethodVersionId(task) : null;
  return response.projectId === task.projectId
    && response.taskId === task.id
    && response.phase === task.fase
    && response.methodVersionId === expectedMethodVersionId;
}

function asApplied(update: FormUpdate): FormUpdate & { status: 'applied' } {
  return { ...update, status: 'applied' };
}

function asRejected(update: FormUpdate): FormUpdate {
  return { ...update, status: 'rejected' };
}

function asConflict(update: FormUpdate): FormUpdate {
  return { ...update, status: 'conflict' };
}

function applyExplicitProposalDecision(
  taskInput: Task,
  updatesInput: FormUpdate[],
  options: AssistantUpdateOptions,
): AssistantUpdateResult {
  const task = repairTask(taskInput);
  const currentRevision = buildPhaseRevision(task, task.fase);
  const nextTask = repairTask(JSON.parse(JSON.stringify(task)));
  const pending: FormUpdate[] = [];
  const applied: Array<FormUpdate & { status: 'applied' }> = [];
  const rejected: FormUpdate[] = [];
  const responseIdentityMatches = proposalResponseIdentityMatches(task, options.response);

  for (const update of updatesInput) {
    const parsed = formUpdateSchema.safeParse(update);
    if (!parsed.success) {
      rejected.push({ ...update, status: 'rejected' as const });
      continue;
    }

    const candidate = parsed.data as FormUpdate;
    const isDecisionTarget = options.decision?.proposalId === candidate.id;

    if (!responseIdentityMatches) {
      rejected.push(asConflict(candidate));
      continue;
    }

    if (isDecisionTarget && candidate.status === 'applied') {
      applied.push(asApplied(candidate));
      continue;
    }

    if (isDecisionTarget && candidate.status === 'rejected') {
      rejected.push(asRejected(candidate));
      continue;
    }

    if (candidate.status === 'conflict') {
      rejected.push(asConflict(candidate));
      continue;
    }

    if (!isAllowedPhaseFieldPath(candidate.field, task.fase as TaskPhase)) {
      rejected.push(asRejected(candidate));
      continue;
    }

    if (candidate.status !== 'proposed') {
      rejected.push(asConflict(candidate));
      continue;
    }

    if (isDecisionTarget && options.decision?.action === 'reject') {
      rejected.push(asRejected(candidate));
      continue;
    }

    if (options.response.baseRevision !== currentRevision || candidate.baseRevision !== currentRevision) {
      rejected.push(asConflict(candidate));
      continue;
    }

    if (!options.decision || !isDecisionTarget) {
      pending.push(candidate);
      continue;
    }

    if (options.decision.baseRevision !== currentRevision) {
      rejected.push(asConflict(candidate));
      continue;
    }

    const value = options.decision.action === 'edit' ? options.decision.value : candidate.value;
    const decided = formUpdateSchema.safeParse({
      ...candidate,
      value,
      status: 'applied',
    });
    if (!decided.success) {
      rejected.push(asRejected(candidate));
      continue;
    }

    const appliedCandidate = asApplied(decided.data as FormUpdate);
    assignByPath(nextTask, appliedCandidate.field, appliedCandidate.value);
    applied.push(appliedCandidate);
  }

  return { task: nextTask, pending, applied, rejected };
}

export function applyAssistantUpdates(
  taskInput: Task,
  updatesInput: FormUpdate[],
  options?: AssistantUpdateOptions,
): AssistantUpdateResult {
  if (!options) return stageAssistantUpdates(taskInput, updatesInput);
  return applyExplicitProposalDecision(taskInput, updatesInput, options);
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
    1: ['f1.checkMapeo', 'f1.confirmacion', 'f1.linaje', 'f1.dudas', 'f1.analisisProblema.problemaDetectado', 'f1.analisisProblema.evidencia', 'f1.analisisProblema.analisis', 'f1.analisisProblema.decision', 'f1.analisisProblema.justificacion', 'f1.analisisProblema.problemaVigente', 'f1.resultadoDeseado', 'f1.alcance', 'f1.restricciones', 'f1.actores', 'f1.criterioExito'],
    2: ['f2.decision', 'f2.faqs', 'f2.alcance', 'f2.noObjetivos', 'f2.pasos', 'f2.descartadas', 'f2.guia', 'f2.criterios', 'f2.predicciones', 'f2.subproblemas', 'f2.preguntasAbiertas', 'f2.riesgos'],
    3: ['f3.iteraciones', 'f3.checkCompila', 'f3.checkAuditado', 'f3.notas'],
    4: ['f4.aar', 'f4.cambio', 'f4.patron', 'f4.titulo', 'f4.conexiones', 'f4.mejorasCriterios', 'f4.methodVersionId'],
  } as const;
  return available[phase] ? (available[phase] as readonly string[]).includes(field) : false;
}

export function validateUpdateForTask(taskInput: Task, update: FormUpdate): boolean {
  const task = repairTask(taskInput);
  const parsed = formUpdateSchema.safeParse(update);
  if (!parsed.success) return false;
  const candidate = parsed.data as FormUpdate;
  if (candidate.status !== 'proposed') return true;
  if (candidate.baseRevision !== buildPhaseRevision(task, task.fase)) return false;
  return isAllowedPhaseFieldPath(candidate.field, task.fase as TaskPhase);
}
