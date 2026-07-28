import { z } from 'zod';
import {
  assistantTurnSchema,
  formUpdateSchema,
  type Contradiction,
  type FormUpdate,
  type TaskPhase,
} from '../domain/task-assistant.schema';
import { buildPhaseRevision, buildPhaseSnapshot } from '../domain/task-assistant-rules';
import { phaseInstructions, getPhaseInstructionKey } from '../domain/phase-instructions';
import { repairTask, type Task } from '../domain/task.schema';

type MockAdapterMode = 'success' | 'delay' | 'malformed' | 'unavailable';

type TaskSnapshot = Record<string, unknown>;

export type ChatRequest = {
  requestId: string;
  workspaceLabel: string;
  projectId?: string;
  taskId: string;
  phase: TaskPhase;
  methodVersionId?: string | null;
  baseRevision: string;
  message: string;
  phaseSnapshot: TaskSnapshot;
  confirmedFields?: TaskSnapshot;
  pendingProposals?: FormUpdate[];
  contradictions?: Contradiction[];
  recentMessages: Array<unknown>;
  previousEvaluations: Array<unknown>;
};

export type ChatResponse = {
  requestId: string;
  projectId: string;
  taskId: string;
  phase: TaskPhase;
  methodVersionId: string | null;
  baseRevision: string;
  message: string;
  primaryQuestion: string | null;
  proposals: FormUpdate[];
  contradictions: Contradiction[];
  suggestions: string[];
  updates: FormUpdate[];
};

export type EvaluationRequest = {
  requestId: string;
  taskId: string;
  phase: TaskPhase;
  responseRevision: string;
  phaseSnapshot: TaskSnapshot;
  gateReasons: string[];
  instructionKey: string;
  previousEvaluations: Array<unknown>;
  activeMethodVersionId?: string | null;
};

export type EvaluationResponse = {
  id: string;
  requestId: string;
  taskId: string;
  phase: TaskPhase;
  responseRevision: string;
  gateVersion: 'legacy-v1' | 'outcome-v2';
  methodVersionId: string | null;
  status: 'acceptable' | 'needs-work' | 'error';
  weaknesses: string[];
  recommendations: string[];
  gatePassed: boolean;
  gateReasons: string[];
  evaluatorVersion: string;
  createdAt: number;
};

export type WorkspaceAssistantAdapter = {
  send(request: ChatRequest): Promise<ChatResponse>;
  evaluate(request: EvaluationRequest): Promise<EvaluationResponse>;
};

export type MockWorkspaceAdapterOptions = {
  sendMode?: MockAdapterMode;
  evaluateMode?: MockWorkspaceAdapterOptions['sendMode'];
  delayMs?: number;
};

const MAX_SUGGESTIONS = 3;
const MAX_PREVIOUS_ENTRIES = 5;
const UPDATE_LIMIT = 180;

const evaluationResponseSchema = z.object({
  id: z.string().min(1),
  requestId: z.string().min(1),
  taskId: z.string().min(1),
  phase: z.number().int().min(1).max(4),
  responseRevision: z.string(),
  gateVersion: z.enum(['legacy-v1', 'outcome-v2']).default('outcome-v2'),
  methodVersionId: z.string().nullable().default(null),
  status: z.enum(['acceptable', 'needs-work', 'error']),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  gatePassed: z.boolean(),
  gateReasons: z.array(z.string()),
  evaluatorVersion: z.string().default('mock-v1'),
  createdAt: z.number().int().min(0).default(() => Date.now()),
});

function normalizeText(value: string): string {
  return value
    .replaceAll('\n', ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;
}

function hasConfirmedValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0 && value !== 'pendiente';
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.some(hasConfirmedValue);
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .some(([, entry]) => hasConfirmedValue(entry));
  }
  return value !== undefined && value !== null;
}

function hasConfirmedFieldValue(field: string, value: unknown): boolean {
  if (field === 'f2.predicciones') {
    return Array.isArray(value)
      && value.filter((entry) => (
        entry
        && typeof entry === 'object'
        && hasConfirmedValue((entry as Record<string, unknown>).texto)
        && hasConfirmedValue((entry as Record<string, unknown>).umbral)
      )).length >= 3;
  }

  if (field === 'f3.iteraciones') {
    return Array.isArray(value)
      && value.some((entry) => (
        entry
        && typeof entry === 'object'
        && hasConfirmedValue((entry as Record<string, unknown>).intento)
        && hasConfirmedValue((entry as Record<string, unknown>).result)
      ));
  }

  if (field === 'f4.aar') {
    return Array.isArray(value)
      && value.some((entry) => (
        entry
        && typeof entry === 'object'
        && hasConfirmedValue((entry as Record<string, unknown>).observado)
        && hasConfirmedValue((entry as Record<string, unknown>).causa)
      ));
  }

  return hasConfirmedValue(value);
}

function sanitizeEvaluationValue(value: string): string {
  return normalizeText(value).replaceAll('<', ' ').replaceAll('>', ' ').slice(0, UPDATE_LIMIT);
}

function isInstructionLike(value: string): boolean {
  const text = normalizeText(value).toLowerCase();
  return text.includes('<script') || text.includes('javascript:') || text.includes('onerror=') || text.includes('onload=');
}

function trimEntries<T>(value: readonly T[] | undefined): T[] {
  if (!value?.length) return [];
  return [...value].slice(-MAX_PREVIOUS_ENTRIES);
}

function isTrustedInstructionKey(phase: TaskPhase, instructionKey: string): boolean {
  return phaseInstructions[phase].some((instruction) => instruction.key === instructionKey);
}

function buildEvaluationId(requestId: string, revision: string, phase: TaskPhase): string {
  return `eval-${phase}-${Date.now().toString(36)}-${requestId}`;
}

function trimRecentPhaseEvaluations(taskId: string, phase: TaskPhase, entries: readonly unknown[]): Array<Record<string, unknown>> {
  const filtered = entries.filter((entry): entry is Record<string, unknown> => {
    if (!entry || typeof entry !== 'object') return false;
    const candidate = entry as Record<string, unknown>;
    return candidate.taskId === taskId && candidate.phase === phase;
  });

  return trimEntries(filtered);
}

function uniqueByPrefix(list: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of list) {
    const entry = normalizeText(item).slice(0, 120);
    if (!entry) continue;
    if (seen.has(entry)) continue;
    seen.add(entry);
    result.push(entry);
    if (result.length >= MAX_SUGGESTIONS) break;
  }

  return result;
}

function deterministicId(prefix: string, ...parts: string[]): string {
  const source = parts.join('\u001f');
  let hash = 0x811c9dc5;

  for (const char of source) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `${prefix}-${hash.toString(36)}`;
}

function readFieldValue(snapshot: TaskSnapshot, field: string): unknown {
  if (Object.prototype.hasOwnProperty.call(snapshot, field)) return snapshot[field];

  const parts = field.split('.');
  const path = /^f[1-4]$/.test(parts[0] ?? '') ? parts.slice(1) : parts;
  let current: unknown = snapshot;

  for (const part of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

type PrimaryQuestionCandidate = { field: string; question: string };

const primaryQuestionCandidates: Record<TaskPhase, PrimaryQuestionCandidate[]> = {
  1: [
    { field: 'f1.resultadoDeseado', question: '¿Cuál es el resultado deseado que debe producir esta tarea?' },
    { field: 'f1.alcance', question: '¿Cuál es el alcance concreto de este problema?' },
    { field: 'f1.restricciones', question: '¿Qué restricciones debemos respetar?' },
    { field: 'f1.actores', question: '¿Qué personas o actores están involucrados?' },
    { field: 'f1.criterioExito', question: '¿Cómo sabremos que el problema quedó resuelto?' },
    { field: 'f1.analisisProblema.problemaVigente', question: '¿Cómo describirías ahora el problema vigente en una frase verificable?' },
    { field: 'f1.analisisProblema.evidencia', question: '¿Qué evidencia observable confirma que este problema existe?' },
  ],
  2: [
    { field: 'f2.decision', question: '¿Qué decisión debe habilitar esta guía?' },
    { field: 'f2.alcance', question: '¿Cuál es el alcance concreto que debe cubrir esta etapa?' },
    { field: 'f2.noObjetivos', question: '¿Qué no debe intentar resolver esta etapa?' },
    { field: 'f2.pasos', question: '¿Cuáles son los pasos esenciales de la guía?' },
    { field: 'f2.subproblemas', question: '¿Qué subproblemas deben resolverse por separado?' },
    { field: 'f2.preguntasAbiertas', question: '¿Qué preguntas siguen abiertas?' },
    { field: 'f2.riesgos', question: '¿Qué riesgos podrían impedir el resultado?' },
    { field: 'f2.predicciones', question: '¿Qué tres resultados medibles esperas observar?' },
  ],
  3: [
    { field: 'f3.iteraciones', question: '¿Qué intento concreto debemos ejecutar y observar?' },
    { field: 'f3.checkCompila', question: '¿La ejecución ya compila o funciona de extremo a extremo?' },
    { field: 'f3.checkAuditado', question: '¿La evidencia de esta ejecución ya fue auditada?' },
  ],
  4: [
    { field: 'f4.aar', question: '¿Qué diferencia hubo entre lo predicho y lo observado?' },
    { field: 'f4.cambio', question: '¿Qué cambio procedimental deja este aprendizaje?' },
    { field: 'f4.titulo', question: '¿Qué título resume la mejora validada?' },
  ],
};

function findPrimaryGap(request: ChatRequest): PrimaryQuestionCandidate | null {
  const confirmed = request.confirmedFields ?? request.phaseSnapshot;
  const pendingFields = new Set<string>((request.pendingProposals ?? []).map((proposal) => proposal.field));
  const candidate = primaryQuestionCandidates[request.phase].find(({ field }) => (
    !hasConfirmedFieldValue(field, readFieldValue(confirmed, field)) && !pendingFields.has(field)
  ));

  return candidate ?? null;
}

function buildPrimaryQuestion(request: ChatRequest, contradictions: Contradiction[]): string | null {
  const currentContradiction = contradictions[0];
  if (currentContradiction) {
    return `¿Puedes aclarar la contradicción en ${currentContradiction.field}?`;
  }

  return findPrimaryGap(request)?.question ?? null;
}

function suggestionFromPhaseSnapshot(phase: TaskPhase, snapshot: TaskSnapshot, message: string): string[] {
  const normalized = normalizeText(message).toLowerCase();

  if (phase === 1) {
    const lineage = snapshot.linaje as Array<Record<string, string>> | undefined;
    const hasLineage = Array.isArray(lineage) && lineage.some((row) => hasText(row.origen) || hasText(row.resultado));
    const analysis = snapshot.analisisProblema as { problemaDetectado?: string; evidencia?: string; analisis?: string; decision?: string; justificacion?: string; problemaVigente?: string } | undefined;

    const missing: string[] = [];
    if (!hasLineage) missing.push('Completa al menos una relación de linaje.');
    if (!hasText(snapshot.checkMapeo)) missing.push('Activa la casilla de confirmación del mapeo.');
    if (!hasText(snapshot.confirmacion)) missing.push('Confirma la revisión final del diagnóstico.');
    if (!hasText(analysis?.problemaDetectado) || !hasText(analysis?.evidencia) || !hasText(analysis?.analisis)) {
      missing.push('Completa problema detectado, evidencia y análisis.');
    }

    if (normalized.includes('problema') && analysis?.decision !== 'mantener' && analysis?.decision !== 'reformular') {
      return uniqueByPrefix([...missing, 'Define si mantienes o reformulas el problema vigente.', ...missing.slice(0, 1)]);
    }

    return uniqueByPrefix(missing.length ? missing : [
      'Aclara el siguiente dato funcional por campo.',
      'Define una formulación vigente más precisa.',
      'Cierra con una decisión explícita y accionable.',
    ]);
  }

  if (phase === 2) {
    const missing: string[] = [];
    if (!hasText(snapshot.decision as unknown)) missing.push('Especifica la decisión o resultado de guía.');
    if (!hasText(snapshot.alcance as unknown) || !hasText(snapshot.noObjetivos as unknown)) missing.push('Completa alcance y no-objetivos.');
    if (!hasText(snapshot.pasos as unknown)) missing.push('Registra los pasos clave del plan.');

    return uniqueByPrefix(missing.length ? missing : [
      'Añade una predicción con umbral.',
      'Relaciona el criterio o mejora con evidencia.',
      'Completa preguntas o acciones de la guía.',
    ]);
  }

  if (phase === 3) {
    const missing: string[] = [];
    if (!hasText(snapshot.checkCompila as unknown) || !hasText(snapshot.checkAuditado as unknown)) missing.push('Confirma compilación y auditabilidad.');

    return uniqueByPrefix(missing.length ? missing : [
      'Registra un intento y su resultado.',
      'Anota qué ajustaste y por qué.',
      'Vincula cada ajuste con evidencias concretas.',
    ]);
  }

  const missing: string[] = [];
  if (!hasText(snapshot.cambio as unknown) || !hasText(snapshot.titulo as unknown)) {
    missing.push('Finaliza el cambio procedimental y el título de la mejora.');
  }

  return uniqueByPrefix(missing.length ? missing : [
    'Describe la mejora causal y su razonamiento.',
    'Confirma al menos una hipótesis marcada como mía.',
    'Cierra la confrontación con evidencia.',
  ]);
}

function buildTaskSnapshot(taskInput: string, phase: TaskPhase, snapshot: TaskSnapshot): Task {
  const phaseKey = `f${phase}` as const;
  return repairTask({
    id: taskInput,
    fase: phase,
    [phaseKey]: snapshot ?? {},
  });
}

function splitConversationalList(value: string): string[] {
  return value
    .split(/\r?\n|[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildGapValue(request: ChatRequest, field: string): unknown {
  const value = sanitizeEvaluationValue(request.message);

  if (['f1.actores', 'f2.subproblemas', 'f2.preguntasAbiertas', 'f2.riesgos'].includes(field)) {
    return splitConversationalList(value);
  }

  if (field === 'f2.predicciones') {
    return splitConversationalList(value).map((entry) => ({
      texto: entry,
      umbral: entry,
      conf: 'media',
    }));
  }

  if (field === 'f3.checkCompila' || field === 'f3.checkAuditado') {
    return !/\b(no|todav[ií]a no|false)\b/i.test(value);
  }

  if (field === 'f3.iteraciones') {
    return [{
      id: deterministicId('iteration', request.requestId),
      intento: value,
      resultado: value,
      ajuste: 'Revisar la evidencia y ajustar el siguiente intento.',
      criterioIds: [],
      methodVersionId: request.methodVersionId ?? null,
      objective: value,
      action: value,
      tool: 'Herramienta por confirmar',
      input: 'Entrada descrita en la conversación',
      result: value,
      evidence: [{
        id: deterministicId('evidence', request.requestId),
        kind: 'observation',
        label: 'Respuesta conversacional',
        value,
      }],
      learning: value,
      nextAdjustment: 'Revisar la evidencia y ajustar el siguiente intento.',
      applicableConditions: ['Contexto confirmado en la conversación'],
      success: false,
      successCriteriaResults: [],
      createdAt: 0,
    }];
  }

  if (field === 'f4.aar') {
    return [{
      pred: 'Predicción por confirmar',
      observado: value,
      causa: value,
      mia: false,
    }];
  }

  return value;
}

function buildUpdatesFromMessage(request: ChatRequest): FormUpdate[] {
  const text = normalizeText(request.message).toLowerCase();
  const updates: Array<{ field: string; value: unknown }> = [];
  const projectId = request.projectId ?? 'legacy';
  const methodVersionId = request.methodVersionId ?? null;
  const confirmed = request.confirmedFields ?? request.phaseSnapshot;
  const pendingFields = new Set<string>((request.pendingProposals ?? []).map((proposal) => proposal.field));

  if (request.phase === 1 && text.includes('problema')) {
    updates.push({ field: 'f1.analisisProblema.problemaDetectado', value: sanitizeEvaluationValue(request.message) });
  }

  if (request.phase === 1 && text.includes('evidencia')) {
    updates.push({ field: 'f1.analisisProblema.evidencia', value: sanitizeEvaluationValue(request.message) });
  }

  if (request.phase === 1 && (text.includes('decisión') || text.includes('decision'))) {
    updates.push({ field: 'f1.analisisProblema.decision', value: /mantener/.test(text) ? 'mantener' : 'reformular' });
  }

  if (request.phase === 2 && (text.includes('decisión') || text.includes('decision'))) {
    updates.push({ field: 'f2.decision', value: sanitizeEvaluationValue(request.message) });
  }

  if (request.phase === 2 && text.includes('alcance')) {
    updates.push({ field: 'f2.alcance', value: sanitizeEvaluationValue(request.message) });
  }

  if (request.phase === 3 && text.includes('iter')) {
    updates.push({ field: 'f3.notas', value: sanitizeEvaluationValue(request.message) });
  }

  if (request.phase === 4 && text.includes('cambio')) {
    updates.push({ field: 'f4.cambio', value: sanitizeEvaluationValue(request.message) });
  }

  if (!updates.length && request.phase === 2) {
    const gap = findPrimaryGap(request);
    if (gap) updates.push({ field: gap.field, value: buildGapValue(request, gap.field) });
  }

  if (!updates.length) {
    const gap = findPrimaryGap(request);
    if (gap) updates.push({ field: gap.field, value: buildGapValue(request, gap.field) });
  }

  return updates
    .slice(0, 2)
    .filter((candidate) => !pendingFields.has(candidate.field))
    .map((candidate) => formUpdateSchema.parse({
      id: deterministicId('proposal', request.requestId, candidate.field),
      sourceMessageId: request.requestId,
      projectId,
      taskId: request.taskId,
      phase: request.phase,
      methodVersionId,
      baseRevision: request.baseRevision,
      status: 'proposed',
      field: candidate.field,
      value: candidate.value,
      previousValue: readFieldValue(confirmed, candidate.field),
    }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toMessageList(request: ChatRequest, proposals: FormUpdate[]): ChatResponse {
  const suggestions = suggestionFromPhaseSnapshot(request.phase, request.phaseSnapshot, request.message);
  const projectId = request.projectId ?? 'legacy';
  const methodVersionId = request.methodVersionId ?? null;
  const contradictions = (request.contradictions ?? []).filter((contradiction) => (
    contradiction.projectId === projectId
    && contradiction.taskId === request.taskId
    && contradiction.phase === request.phase
    && contradiction.methodVersionId === methodVersionId
  ));
  const turn = assistantTurnSchema.parse({
    requestId: request.requestId,
    projectId,
    taskId: request.taskId,
    phase: request.phase,
    methodVersionId,
    baseRevision: request.baseRevision,
    message: `Asistente activo en ${request.workspaceLabel || 'este proyecto'}: listo para orientar la fase ${request.phase}.`,
    primaryQuestion: buildPrimaryQuestion(request, contradictions),
    proposals,
    contradictions,
    suggestions,
  });

  return {
    ...turn,
    phase: turn.phase as TaskPhase,
    proposals: turn.proposals as FormUpdate[],
    contradictions: turn.contradictions as Contradiction[],
    updates: turn.proposals as FormUpdate[],
  };
}

export function createMockWorkspaceAssistant(options: MockWorkspaceAdapterOptions = {}): WorkspaceAssistantAdapter {
  const inFlightSend = new Map<string, Promise<ChatResponse>>();
  const completedSend = new Map<string, ChatResponse>();
  const inFlightEvaluation = new Map<string, Promise<EvaluationResponse>>();

  async function send(request: ChatRequest): Promise<ChatResponse> {
    const completed = completedSend.get(request.requestId);
    if (completed) return completed;

    const cached = inFlightSend.get(request.requestId);
    if (cached) return cached;

    if (options.sendMode === 'unavailable') {
      throw new Error('not available');
    }

  const resolved: Promise<ChatResponse> = (async () => {
      if (options.sendMode === 'delay' && options.delayMs) {
        await sleep(options.delayMs);
      }

      const content = normalizeText(request.message);
      if (!content) {
        throw new Error('message must not be empty');
      }

      if (isInstructionLike(content)) {
        throw new Error('instruction-like content rejected');
      }

      const phaseSnapshot = buildPhaseSnapshot(buildTaskSnapshot(request.taskId, request.phase, request.phaseSnapshot), request.phase).fields;
      const historicalEvaluations = trimRecentPhaseEvaluations(request.taskId, request.phase, request.previousEvaluations);
      const task = buildTaskSnapshot(request.taskId, request.phase, phaseSnapshot);
      const expectedBaseRevision = buildPhaseRevision(task, request.phase);
      const currentBaseRevision = request.baseRevision;
      const proposals = buildUpdatesFromMessage(request);
      const draft = toMessageList(request, proposals);

      draft.baseRevision = currentBaseRevision;
      if (currentBaseRevision !== expectedBaseRevision) {
        draft.suggestions = [
          'El contexto cambió; confirma el estado actual del formulario antes de continuar.',
          ...draft.suggestions,
        ];
      }

      if (historicalEvaluations.length > 0) {
        const historyReasons = historicalEvaluations.flatMap((entry) => {
          const reasons = entry.gateReasons;
          return Array.isArray(reasons) ? reasons.filter((value) => typeof value === 'string').map((value) => String(value)) : [];
        });
        draft.suggestions = uniqueByPrefix([...historyReasons, ...draft.suggestions]);
      }
      draft.suggestions = uniqueByPrefix(draft.suggestions);

      if (options.sendMode === 'malformed') {
        return assistantTurnSchema.parse({
          ...draft,
          updates: undefined,
          primaryQuestion: [],
        }) as unknown as ChatResponse;
      }

      completedSend.set(request.requestId, draft);
      return draft;
    })().finally(() => {
      inFlightSend.delete(request.requestId);
    });

    inFlightSend.set(request.requestId, resolved);
    return resolved;
  }

  async function evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const cached = inFlightEvaluation.get(request.requestId);
    if (cached) return cached;

    if (options.evaluateMode === 'unavailable') {
      throw new Error('not available');
    }

    const resolved: Promise<EvaluationResponse> = (async () => {
      if (options.evaluateMode === 'delay' && options.delayMs) {
        await sleep(options.delayMs);
      }

      const historical = trimRecentPhaseEvaluations(request.taskId, request.phase, request.previousEvaluations);

      const historyGateReasons = historical.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const item = entry as Record<string, unknown>;
        const reasons = item.gateReasons;
        return Array.isArray(reasons) ? reasons.filter((value) => typeof value === 'string').map((value) => String(value)) : [];
      });

      const reasons = trimEntries(request.gateReasons);
      const finalReasons = reasons.length > 0 ? reasons : trimEntries(historyGateReasons);

      const expectedInstructionKey = getPhaseInstructionKey(request.phase);
      const usesTrustedInstruction = isTrustedInstructionKey(request.phase, request.instructionKey);

      if (!usesTrustedInstruction) {
        return evaluationResponseSchema.parse({
          id: buildEvaluationId(request.requestId, request.responseRevision, request.phase),
          requestId: request.requestId,
          taskId: request.taskId,
          phase: request.phase,
          responseRevision: request.responseRevision,
          status: 'error',
          weaknesses: [`Clave de instrucción inválida para la fase ${request.phase}.`],
          recommendations: ['Usa una clave de instrucción del catálogo de fases para esta evaluación.'],
          gatePassed: false,
          gateReasons: ['Clave de instrucción inválida.'],
          evaluatorVersion: 'mock-v1',
        }) as EvaluationResponse;
      }

      if (!expectedInstructionKey) {
        return evaluationResponseSchema.parse({
          id: buildEvaluationId(request.requestId, request.responseRevision, request.phase),
          requestId: request.requestId,
          taskId: request.taskId,
          phase: request.phase,
          responseRevision: request.responseRevision,
          status: 'error',
          weaknesses: [`No hay instrucción de fase disponible para fase ${request.phase}.`],
          recommendations: ['Reparar el catálogo interno de instrucciones y volver a intentar.'],
          gatePassed: false,
          gateReasons: ['Instrucción de fase ausente.'],
          evaluatorVersion: 'mock-v1',
        }) as EvaluationResponse;
      }

      if (finalReasons.length === 0) {
        const response = {
          id: buildEvaluationId(request.requestId, request.responseRevision, request.phase),
          requestId: request.requestId,
          taskId: request.taskId,
          phase: request.phase,
          responseRevision: request.responseRevision,
          gateVersion: 'outcome-v2',
          methodVersionId: request.phase === 4 ? request.activeMethodVersionId ?? null : null,
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          evaluatorVersion: 'mock-v1',
        };
        if (options.evaluateMode === 'malformed') {
          const malformed = { ...response, recommendations: 0 } as unknown as EvaluationResponse;
          return evaluationResponseSchema.parse(malformed) as EvaluationResponse;
        }
        return evaluationResponseSchema.parse(response) as EvaluationResponse;
      }

      const payload = {
        id: buildEvaluationId(request.requestId, request.responseRevision, request.phase),
        requestId: request.requestId,
        taskId: request.taskId,
        phase: request.phase,
        responseRevision: request.responseRevision,
        status: 'needs-work' as const,
        weaknesses: finalReasons.map((item) => `Debilidad: ${item}`),
        recommendations: finalReasons.map((item) => `Recomendación: ${item}`),
        gatePassed: false,
        gateReasons: finalReasons,
        evaluatorVersion: 'mock-v1',
      };

      if (options.evaluateMode === 'malformed') {
        const malformed = { ...payload, recommendations: 0 } as unknown as EvaluationResponse;
        return evaluationResponseSchema.parse(malformed) as EvaluationResponse;
      }

      return evaluationResponseSchema.parse(payload) as EvaluationResponse;
    })().finally(() => {
      inFlightEvaluation.delete(request.requestId);
    });

    inFlightEvaluation.set(request.requestId, resolved);
    return resolved;
  }

  return { send, evaluate };
}

export const mockWorkspaceAssistant = createMockWorkspaceAssistant();
