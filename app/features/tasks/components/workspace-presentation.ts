import type { TaskIndex } from '../domain/task.schema';
import type { PhaseEvaluation, TaskPhase } from '../domain/task-assistant.schema';
import type { Task } from '../domain/task.schema';

export type GateResult = {
  allowed: boolean;
  reasons: string[];
};

export type WorkspaceTaskState = 'active' | 'completed';

export type ContextualPrimaryActionKind =
  | 'evaluate'
  | 'evaluating'
  | 'reevaluate'
  | 'continue'
  | 'finish'
  | 'return';

export type ContextualPrimaryAction = {
  kind: ContextualPrimaryActionKind;
  label: string;
  disabled: boolean;
  nextPhase: TaskPhase | null;
  reason: string | null;
  gateReasons: string[];
};

export type ContextualPrimaryActionSnapshot = {
  phase: TaskPhase;
  taskState: WorkspaceTaskState;
  evaluation: PhaseEvaluation | null;
  isEvaluating: boolean;
  isStaleEvaluation?: boolean;
  gateResult: GateResult;
  transportError?: string | null;
};

export type EvaluationDisplayIssue = {
  field: string | null;
  message: string;
};

export type EvaluationDisplayStatus =
  | 'none'
  | 'evaluating'
  | 'acceptable'
  | 'blocked'
  | 'stale'
  | 'transport-error';

export type EvaluationDisplay = {
  status: EvaluationDisplayStatus;
  issues: EvaluationDisplayIssue[];
  announcement: string;
  recovery: 'evaluate' | 'reevaluate' | null;
};

export type CompletionSummary = {
  progress: string;
  finalOutcome: string;
  keyLearning: string[];
  evidence: string[];
  decision: string;
  records: TaskIndex['registros'];
};

const GATE_REASON_FIELD_MAP: Record<TaskPhase, ReadonlyArray<[string, string]>> = {
  1: [
    ['Completa al menos una relación de linaje con dos campos.', 'f1.linaje'],
    ['Confirma el mapeo completo antes de avanzar.', 'f1.checkMapeo'],
    ['Decide si mantienes o reformulas el problema.', 'f1.analisisProblema.decision'],
    ['Completa el problema, la evidencia y el análisis.', 'f1.analisisProblema'],
    ['Justifica la decisión y escribe la formulación vigente.', 'f1.analisisProblema.justificacion'],
    ['Especifica un resultado deseado verificable.', 'f1.resultadoDeseado'],
    ['Define alcance explícito para la fase 1.', 'f1.alcance'],
    ['Registra restricciones operativas o riesgos de alcance.', 'f1.restricciones'],
    ['Define al menos un actor involucrado.', 'f1.actores'],
    ['Define criterio(s) de éxito para cerrar la fase.', 'f1.criterioExito'],
  ],
  2: [
    ['Escribe la decisión o resultado que habilita la tarea.', 'f2.decision'],
    ['Define alcance y no-objetivos.', 'f2.alcance'],
    ['Esquematiza los pasos.', 'f2.pasos'],
    ['Añade al menos un subproblema concreto.', 'f2.subproblemas'],
    ['Especifica pasos ordenados.', 'f2.pasos'],
    ['Añade al menos una pregunta abierta pendiente.', 'f2.preguntasAbiertas'],
    ['Registra al menos un riesgo identificado.', 'f2.riesgos'],
    ['Completa tres predicciones con texto y umbral.', 'f2.predicciones'],
  ],
  3: [
    ['Registra al menos una iteración completa de ejecución y su siguiente ajuste.', 'f3.iteraciones'],
    ['Confirma que compila.', 'f3.checkCompila'],
    ['Confirma que fue auditado.', 'f3.checkAuditado'],
  ],
  4: [
    ['Completa observado y causa en cada predicción.', 'f4.aar'],
    ['Marca al menos una suposición propia como causa.', 'f4.aar'],
    ['Registra al menos una oportunidad de automatización por evidencia observada.', 'f4.aar'],
    ['Cada oportunidad debe vincularse con pasos del método.', 'f4.conexiones'],
    ['Define un cambio procedimental concreto.', 'f4.cambio'],
    ['Describe el cambio procedimental consolidado.', 'f4.cambio'],
    ['Define un título de cierre para el registro.', 'f4.titulo'],
  ],
};

function trimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeGateReasons(phase: TaskPhase, reasons: string[]): EvaluationDisplayIssue[] {
  const fieldByReason = new Map(GATE_REASON_FIELD_MAP[phase]);
  const issues: EvaluationDisplayIssue[] = [];
  const seen = new Set<string>();

  for (const reason of reasons) {
    const message = trimmed(reason);
    if (!message) continue;
    const field = fieldByReason.get(message) ?? null;
    const key = `${field ?? ''}::${message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    issues.push({ field, message });
  }

  return issues;
}

function uniqueTexts(values: Iterable<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const text = trimmed(value);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function collectIterationLearnings(task: Task): string[] {
  return uniqueTexts(task.f3.iteraciones.map((iteration) => iteration.learning));
}

function collectIterationEvidence(task: Task): string[] {
  const references: string[] = [];
  const seen = new Set<string>();

  for (const iteration of task.f3.iteraciones) {
    for (const evidence of iteration.evidence) {
      const text = trimmed(evidence.value) || trimmed(evidence.label);
      if (!text || seen.has(text)) continue;
      seen.add(text);
      references.push(text);
    }
  }

  return references;
}

function resolveCompletionOutcome(task: Task): string {
  const changed = trimmed(task.f4.cambio);
  if (changed) return changed;

  for (let index = task.f3.iteraciones.length - 1; index >= 0; index -= 1) {
    const iteration = task.f3.iteraciones[index];
    if (!iteration) continue;
    const result = trimmed(iteration.result);
    if (result) return result;
    const resultado = trimmed(iteration.resultado);
    if (resultado) return resultado;
  }

  return 'No registrado';
}

function resolveCompletionDecision(task: Task): string {
  return trimmed(task.f2.decision)
    || trimmed(task.f1.analisisProblema.decision)
    || trimmed(task.f1.analisisProblema.justificacion)
    || 'No registrado';
}

function resolveCompletionLearnings(task: Task): string[] {
  const learnings = collectIterationLearnings(task);
  if (learnings.length > 0) return learnings;
  const fallback = trimmed(task.f4.conexiones);
  return fallback ? [fallback] : [];
}

function resolveCompletionEvidence(task: Task): string[] {
  const evidence = collectIterationEvidence(task);
  if (evidence.length > 0) return evidence;
  const fallback = trimmed(task.f1.analisisProblema.evidencia);
  return fallback ? [fallback] : [];
}

function resolveCompletionRecords(task: Task, records: TaskIndex['registros']): TaskIndex['registros'] {
  const seen = new Set<string>();
  const filtered: TaskIndex['registros'] = [];

  for (const record of records) {
    const sourceTaskId = record.sourceTaskId || record.taskId || record.tareaId;
    if (sourceTaskId !== task.id) continue;
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    filtered.push(record);
  }

  return filtered;
}

function hasMeaningfulEvaluation(evaluation: PhaseEvaluation | null): evaluation is PhaseEvaluation {
  return Boolean(evaluation);
}

export function resolveContextualPrimaryAction(snapshot: ContextualPrimaryActionSnapshot): ContextualPrimaryAction {
  if (snapshot.taskState === 'completed') {
    return {
      kind: 'return',
      label: 'Volver a tareas',
      disabled: false,
      nextPhase: null,
      reason: 'La tarea ya está completada.',
      gateReasons: [],
    };
  }

  if (snapshot.isEvaluating) {
    return {
      kind: 'evaluating',
      label: 'Evaluando…',
      disabled: true,
      nextPhase: null,
      reason: 'La evaluación ya está en curso.',
      gateReasons: snapshot.gateResult.reasons.slice(),
    };
  }

  const gateReasons = snapshot.gateResult.reasons.filter((reason) => trimmed(reason).length > 0);
  const gateAllowed = snapshot.gateResult.allowed && gateReasons.length === 0;
  const evaluation = snapshot.evaluation;
  const hasEvaluation = hasMeaningfulEvaluation(evaluation);
  const evaluationIsAcceptable = hasEvaluation && evaluation.status === 'acceptable';
  const evaluationIsStale = Boolean(snapshot.isStaleEvaluation && evaluation);
  const evaluationNeedsRetry = hasEvaluation && !evaluationIsAcceptable;

  if (evaluationIsStale || evaluationNeedsRetry || snapshot.transportError) {
    return {
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: gateReasons.length > 0 ? gateReasons[0] ?? null : (snapshot.transportError ?? 'La evaluación debe recalcularse.'),
      gateReasons,
    };
  }

  if (!hasEvaluation) {
    return {
      kind: 'evaluate',
      label: 'Evaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: gateAllowed ? 'Aún no hay evaluación vigente.' : (gateReasons[0] ?? 'La fase tiene bloqueos pendientes.'),
      gateReasons,
    };
  }

  if (!evaluationIsAcceptable || !gateAllowed) {
    return {
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: gateReasons[0] ?? 'La evaluación requiere ajustes.',
      gateReasons,
    };
  }

  if (snapshot.phase === 4) {
    return {
      kind: 'finish',
      label: 'Finalizar tarea',
      disabled: false,
      nextPhase: null,
      reason: null,
      gateReasons,
    };
  }

  return {
    kind: 'continue',
    label: `Continuar a etapa ${snapshot.phase + 1}`,
    disabled: false,
    nextPhase: (snapshot.phase + 1) as TaskPhase,
    reason: null,
    gateReasons,
  };
}

export function resolveEvaluationDisplay(snapshot: {
  phase: TaskPhase;
  latestEvaluation: PhaseEvaluation | null;
  isEvaluating: boolean;
  isStaleEvaluation: boolean;
  transportError?: string | null;
  gateResult: GateResult;
}): EvaluationDisplay {
  const latestEvaluation = snapshot.latestEvaluation;
  const gateIssues = !snapshot.gateResult.allowed
    ? normalizeGateReasons(snapshot.phase, snapshot.gateResult.reasons)
    : [];
  const evaluationGateIssues = latestEvaluation
    ? normalizeGateReasons(snapshot.phase, latestEvaluation.gateReasons)
    : [];
  const evaluationIssues = latestEvaluation && latestEvaluation.status !== 'acceptable' && !snapshot.isEvaluating && !snapshot.transportError
    ? [
        ...uniqueTexts(latestEvaluation.weaknesses).map((message) => ({ field: null, message })),
        ...uniqueTexts(latestEvaluation.recommendations).map((message) => ({ field: null, message })),
      ]
    : [];
  const issues = [...gateIssues, ...evaluationGateIssues, ...evaluationIssues].filter((issue, index, entries) => {
    const key = `${issue.field ?? ''}::${issue.message}`;
    return entries.findIndex((candidate) => `${candidate.field ?? ''}::${candidate.message}` === key) === index;
  });

  if (snapshot.isEvaluating) {
    return {
      status: 'evaluating',
      issues,
      announcement: 'Generando evaluación con el estado actual de la fase.',
      recovery: null,
    };
  }

  if (snapshot.transportError) {
    return {
      status: 'transport-error',
      issues,
      announcement: snapshot.transportError,
      recovery: latestEvaluation ? 'reevaluate' : 'evaluate',
    };
  }

  if (snapshot.isStaleEvaluation && latestEvaluation) {
    return {
      status: 'stale',
      issues,
      announcement: 'La evaluación anterior quedó desfasada y debe recalcularse.',
      recovery: 'reevaluate',
    };
  }

  if (latestEvaluation?.status === 'acceptable' && snapshot.gateResult.allowed) {
    return {
      status: 'acceptable',
      issues,
      announcement: 'Estado vigente y apto para continuar.',
      recovery: null,
    };
  }

  if (latestEvaluation || !snapshot.gateResult.allowed) {
    return {
      status: 'blocked',
      issues,
      announcement: issues.length > 0
        ? 'La evaluación requiere ajustes antes de continuar.'
        : 'La fase tiene bloqueos pendientes.',
      recovery: latestEvaluation ? 'reevaluate' : 'evaluate',
    };
  }

  return {
    status: 'none',
    issues,
    announcement: 'Aún no se ha realizado ninguna evaluación.',
    recovery: 'evaluate',
  };
}

export function projectCompletionSummary(task: Task, records: TaskIndex['registros'] = []): CompletionSummary {
  return {
    progress: task.estado === 'completada' ? '4/4' : `${Math.min(Math.max(task.fase, 1), 4)}/4`,
    finalOutcome: resolveCompletionOutcome(task),
    keyLearning: resolveCompletionLearnings(task),
    evidence: resolveCompletionEvidence(task),
    decision: resolveCompletionDecision(task),
    records: resolveCompletionRecords(task, records),
  };
}
