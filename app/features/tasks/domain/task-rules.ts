import type { CriterionImprovement, MethodVersion, Task } from './task.schema';
import { createBlankTask as createSchemaTask, repairTask as repairSchemaTask } from './task.schema';
import { canContinueByAssistant } from './task-assistant-rules';

export type GateResult = { allowed: boolean; reasons: string[] };

export const createBlankTask = createSchemaTask;

export function repairTask(input: unknown): Task {
  return repairSchemaTask(input);
}

function filled(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function hasTextLine(value: unknown): boolean {
  return filled(value);
}

function normalizeTextArray(lines: unknown): string[] {
  if (!Array.isArray(lines)) return [];
  return lines
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
}

export function currentMethodVersion(taskInput: Task): MethodVersion | null {
  const versions = [...(taskInput.methodVersions ?? [])].filter((version) => version.status !== 'superseded');
  if (!versions.length) return null;
  const sorted = versions.sort((left, right) => {
    if (left.version !== right.version) return right.version - left.version;
    return right.createdAt - left.createdAt;
  });
  return sorted[0] ?? null;
}

function isIterationSuccessfulForVersion(task: Task, iteration: Task['f3']['iteraciones'][number], versionId: string): boolean {
  if (iteration.methodVersionId !== versionId) return false;
  if (!iteration.success) return false;
  if (!iteration.applicableConditions || iteration.applicableConditions.length === 0) return false;
  const criteria = Array.isArray(iteration.successCriteriaResults) ? iteration.successCriteriaResults : [];
  if (criteria.length === 0) return true;
  return criteria.every((entry) => entry.passed === true);
}

export function deriveMethodMaturity(taskInput: Task): 'hypothesis' | 'proposed-path' | 'documented-once' | 'repeatable-method' {
  const task = repairTask(taskInput);
  const active = currentMethodVersion(task);
  if (!active) return 'hypothesis';

  const stableIterations = task.f3.iteraciones.filter((item) => isIterationSuccessfulForVersion(task, item, active.id));
  if (stableIterations.length >= 2) return 'repeatable-method';
  if (stableIterations.length >= 1) return 'documented-once';
  return 'proposed-path';
}

function isValidMethodVersion(version: MethodVersion): boolean {
  return version.steps.length > 0
    && version.successCriteria.length > 0
    && version.inputs.every((value) => value.trim().length > 0)
    && version.outputs.every((value) => value.trim().length > 0);
}

function buildMethodVersionSnapshot(task: Task, baseVersion: MethodVersion | null, changeKind: MethodVersion['changeKind']): MethodVersion {
  const sourceId = baseVersion?.id ?? null;
  const nextVersion = (baseVersion?.version ?? 0) + 1;
  const preconditions = normalizeTextArray([
    task.f1.criterioExito,
    task.f1.alcance,
    task.f1.restricciones,
  ]);
  const steps = (() => {
    const values = normalizeTextArray((task.f2.pasos || '').split('\n')).map((line, index) => ({
      id: `step-${Date.now().toString(36)}-${index}`,
      title: `Paso ${index + 1}`,
      objective: line || `Resultado del paso ${index + 1}`,
      dependencies: [],
      inputs: [task.f1.alcance || 'Contexto inicial'],
      output: line || 'Salida esperada del paso',
      tool: 'Sin definir',
      risk: 'Riesgo bajo',
      successCriterion: 'Se observa el resultado esperado',
      sourceCriterionId: task.f2.criterios?.[0]?.id ?? null,
    }));
    return values.length > 0 ? values : [{
      id: `step-${Date.now().toString(36)}-base`,
      title: 'Paso inicial',
      objective: 'Definir un camino base',
      dependencies: [],
      inputs: ['Contexto inicial'],
      output: 'Resultado reproducible',
      tool: 'Sin definir',
      risk: 'Riesgo bajo',
      successCriterion: 'Se alcanza resultado medible',
      sourceCriterionId: task.f2.criterios?.[0]?.id ?? null,
    }];
  })();

  return {
    id: `method-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    version: nextVersion,
    parentVersionId: sourceId,
    status: 'draft',
    changeKind,
    preconditions: preconditions.length ? preconditions : ['Problema y alcance definidos'],
    steps,
    tools: steps.map((item) => item.tool).filter((value) => value.length > 0),
    inputs: preconditions,
    outputs: ['Solución repetible con evidencia'],
    controls: ['Revisión humana del cambio'],
    exceptions: [],
    exceptionsReviewed: false,
    successCriteria: steps.map((item) => item.successCriterion).filter((value) => value.length > 0),
    supportingIterationIds: task.f3.iteraciones.map((iteration) => iteration.id).filter((value) => value.length > 0),
    createdAt: Date.now(),
  };
}

function withMethodVersionDraft(task: Task, nextVersion: MethodVersion): Task {
  const methods = [...task.methodVersions];
  const previous = methods.find((version) => version.status !== 'superseded' && version.id === currentMethodVersion(task)?.id);
  if (previous) {
    const index = methods.findIndex((version) => version.id === previous.id);
    if (index >= 0) {
      methods[index] = { ...previous, status: 'superseded' };
    }
  }

  return {
    ...task,
    methodVersions: [...methods, nextVersion],
    f4: {
      ...task.f4,
      methodVersionId: task.f4.methodVersionId || nextVersion.id,
    },
  };
}

export function ensureMethodVersionForExecution(taskInput: Task): Task {
  const task = repairTask(taskInput);
  const active = currentMethodVersion(task);
  if (active) return task;

  const candidate = buildMethodVersionSnapshot(task, null, 'initial');
  if (!isValidMethodVersion(candidate)) {
    return task;
  }
  return withMethodVersionDraft(task, candidate);
}

export function gateReasons(taskInput: Task): string[] {
  const task = repairTask(taskInput);
  if (task.fase === 1) {
    const hasLineage = task.f1.linaje.some((row) => Object.values(row).filter(filled).length >= 2);
    const actors = normalizeTextArray(task.f1.actores);
    return [
      ...(hasLineage ? [] : ['Completa al menos una relación de linaje con dos campos.']),
      ...(task.f1.checkMapeo || task.f1.confirmacion ? [] : ['Confirma el mapeo completo antes de avanzar.']),
      ...(task.f1.analisisProblema.decision === 'mantener' || task.f1.analisisProblema.decision === 'reformular' ? [] : ['Decide si mantienes o reformulas el problema.']),
      ...(task.f1.analisisProblema.problemaDetectado.trim() && task.f1.analisisProblema.evidencia.trim() && task.f1.analisisProblema.analisis.trim() ? [] : ['Completa el problema, la evidencia y el análisis.']),
      ...(task.f1.analisisProblema.justificacion.trim() && task.f1.analisisProblema.problemaVigente.trim() ? [] : ['Justifica la decisión y escribe la formulación vigente.']),
      ...(task.f1.resultadoDeseado.trim() ? [] : ['Especifica un resultado deseado verificable.']),
      ...(task.f1.alcance.trim() ? [] : ['Define alcance explícito para la fase 1.']),
      ...(task.f1.restricciones.trim() ? [] : ['Registra restricciones operativas o riesgos de alcance.']),
      ...(actors.length >= 1 ? [] : ['Define al menos un actor involucrado.']),
      ...(task.f1.criterioExito.trim() ? [] : ['Define criterio(s) de éxito para cerrar la fase.']),
    ];
  }
  if (task.fase === 2) {
    const subproblems = normalizeTextArray(task.f2.subproblemas);
    const risks = normalizeTextArray(task.f2.riesgos);
    const openQuestions = normalizeTextArray(task.f2.preguntasAbiertas);
    const pasoLines = normalizeTextArray(String(task.f2.pasos || '').split('\n'));

    return [
      ...(filled(task.f2.decision) ? [] : ['Escribe la decisión o resultado que habilita la tarea.']),
      ...(filled(task.f2.alcance) && filled(task.f2.noObjetivos) ? [] : ['Define alcance y no-objetivos.']),
      ...(filled(task.f2.pasos) ? [] : ['Esquematiza los pasos.']),
      ...(subproblems.length >= 1 ? [] : ['Añade al menos un subproblema concreto.']),
      ...(pasoLines.length >= 1 ? [] : ['Especifica pasos ordenados.']),
      ...(openQuestions.length >= 1 ? [] : ['Añade al menos una pregunta abierta pendiente.']),
      ...(risks.length >= 1 ? [] : ['Registra al menos un riesgo identificado.']),
      ...(completePredictions(task.f2.predicciones) >= 3 ? [] : ['Completa tres predicciones con texto y umbral.']),
    ];
  }
  if (task.fase === 3) {
    const hasValidIteration = task.f3.iteraciones.some((iteration) => {
      return (
        filled(iteration.intento)
        && filled(iteration.resultado)
        && filled(iteration.ajuste)
        && filled(iteration.objective)
        && filled(iteration.action)
        && filled(iteration.tool)
        && filled(iteration.input)
        && filled(iteration.result)
        && filled(iteration.learning)
        && filled(iteration.nextAdjustment)
        && Array.isArray(iteration.evidence)
        && iteration.evidence.length >= 1
        && Array.isArray(iteration.criterioIds)
        && Array.isArray(iteration.applicableConditions)
        && iteration.applicableConditions.length >= 1
        && filled(iteration.methodVersionId)
      );
    });

    return [
      ...(hasValidIteration ? [] : ['Registra al menos una iteración completa de ejecución y su siguiente ajuste.']),
      ...(task.f3.checkCompila ? [] : ['Confirma que compila.']),
      ...(task.f3.checkAuditado ? [] : ['Confirma que fue auditado.']),
    ];
  }

  const activeVersion = currentMethodVersion(task);
  const opportunityRules = task.automationOpportunities.filter((opportunity) => opportunity.methodVersionId === activeVersion?.id);
  const stepIds = new Set((activeVersion?.steps ?? []).map((step) => step.id));
  const coveredSteps = opportunityRules
    .flatMap((item) => item.stepIds)
    .filter((stepId) => stepIds.has(stepId));

  return [
    ...(activeVersion ? [] : ['Crea una versión inicial de método para continuar.']),
    ...(activeVersion && isValidMethodVersion(activeVersion) ? [] : ['Completa precondiciones, pasos, entradas, salidas, controles y criterios de éxito del método.']),
    ...(opportunityRules.length >= 1 ? [] : ['Registra al menos una oportunidad de automatización por evidencia observada.']),
    ...(opportunityRules.length > 0 && coveredSteps.length === 0 ? ['Cada oportunidad debe vincularse con pasos del método.'] : []),
    ...(task.f4.cambio.trim() ? [] : ['Describe el cambio procedimental consolidado.']),
    ...(task.f4.titulo.trim() ? [] : ['Define un título de cierre para el registro.']),
  ];
}

function completePredictions(predictions: Array<{ texto: string; umbral: string }>): number {
  return predictions.filter((prediction) => filled(prediction.texto) && filled(prediction.umbral)).length;
}

export function canAdvance(task: Task): GateResult {
  const reasons = gateReasons(task);
  return { allowed: reasons.length === 0, reasons };
}

export function canAdvanceWithAssistant(task: Task): GateResult {
  const taskWithAssistant = repairTask(task);
  const gate = canAdvance(taskWithAssistant);
  if (!gate.allowed) return gate;
  if (!canContinueByAssistant(taskWithAssistant)) return { allowed: false, reasons: ['La fase requiere una evaluación vigente y aceptable del asistente para continuar.'] };
  return gate;
}

export function advanceTask(taskInput: Task): Task {
  const task = repairTask(taskInput);
  if (!canAdvance(task).allowed) return task;

  if (task.fase === 2) {
    return { ...ensureMethodVersionForExecution(task), fase: 3 };
  }

  if (task.fase < 4) {
    return { ...task, fase: (task.fase + 1) as Task['fase'] };
  }
  return { ...task, estado: 'completada' };
}

export function addIteration(taskInput: Task): Task {
  const task = repairTask(taskInput);
  const next = {
    id: `iteration-${Date.now().toString(36)}`,
    intento: '',
    resultado: '',
    ajuste: '',
    criterioIds: [],
    methodVersionId: currentMethodVersion(task)?.id ?? null,
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
  };
  return { ...task, f3: { ...task.f3, iteraciones: [...task.f3.iteraciones, next] } };
}

export function deriveCriterionImprovements(taskInput: Task): CriterionImprovement[] {
  const task = repairTask(taskInput);
  return task.f2.criterios.map((criterion) => {
    const previous = task.f4.mejorasCriterios.find((item) => item.criterioId === criterion.id);
    return previous ? { ...previous } : { criterioId: criterion.id, confirmado: false, mejora: '' };
  });
}

function promptCriteria(task: Task): string[] {
  return task.f2.criterios
    .filter((criterion) => criterion.texto.trim() || criterion.comentario.trim())
    .map((criterion, index) => `${index + 1}. ${criterion.texto || '[sin criterio]'} | Comentario: ${criterion.comentario || '[sin comentario]'} | Prioridad: ${criterion.prioridad} | Estado: ${criterion.estado} | Impacto: ${criterion.impacto}`);
}

function promptProblemContext(task: Task): string[] {
  return [`Problema vigente: ${task.f1.analisisProblema.problemaVigente || '[pendiente]'}`];
}

function promptCriteriaList(task: Task): string[] {
  return task.f4.mejorasCriterios
    .map((item) => `${item.criterioId}: ${item.confirmado ? '[x]' : '[ ]'} ${item.mejora || '[pendiente]'}`);
}

function promptGuide(task: Task): string[] {
  const subproblems = normalizeTextArray(task.f2.subproblemas);
  const risks = normalizeTextArray(task.f2.riesgos);
  const questions = normalizeTextArray(task.f2.preguntasAbiertas);
  return [
    ...promptProblemContext(task),
    `Decisión: ${task.f2.decision || '[pendiente]'}`,
    `Alcance: ${task.f2.alcance || '[pendiente]'}`,
    `No-objetivos: ${task.f2.noObjetivos || '[pendiente]'}`,
    `Pasos: ${task.f2.pasos || '[pendiente]'}`,
    `FAQs: ${task.f2.faqs || '[pendiente]'}`,
    '',
    'Subproblemas:',
    ...(subproblems.length ? subproblems.map((item, index) => `${index + 1}. ${item}`) : ['- [pendiente]']),
    '',
    'Riesgos:',
    ...(risks.length ? risks.map((item, index) => `${index + 1}. ${item}`) : ['- [pendiente]']),
    '',
    'Preguntas abiertas:',
    ...(questions.length ? questions.map((item, index) => `${index + 1}. ${item}`) : ['- [pendiente]']),
    '',
    'Predicciones:',
    ...(task.f2.predicciones.length ? task.f2.predicciones.map((prediction, index) => `${index + 1}. ${prediction.texto || '[sin texto]'} | Umbral: ${prediction.umbral || '[sin umbral]'}`) : ['- [pendiente]']),
    '',
    'Criterios revisados:',
    ...(promptCriteria(task).length ? promptCriteria(task) : ['- [pendiente]']),
  ];
}

function promptExecution(task: Task): string[] {
  return [
    ...promptProblemContext(task),
    '',
    'Criterios revisados:',
    ...(promptCriteria(task).length ? promptCriteria(task) : ['- [pendiente]']),
    '',
    'Iteraciones:',
    ...(task.f3.iteraciones.length
      ? task.f3.iteraciones.filter((i) => i.intento || i.resultado || i.ajuste || i.objective || i.action || i.tool || i.input || i.result || i.learning)
        .map((i, n) => `${n + 1}. Objetivo: ${i.objective || '[sin texto]'} | Acción: ${i.action || '[sin texto]'} | Herramienta: ${i.tool || '[sin texto]'} | Resultado: ${i.result || '[sin texto]'} | Ajuste: ${i.nextAdjustment || '[sin texto]'}`)
      : ['- [pendiente]']),
    '',
    `Compila: ${task.f3.checkCompila ? 'sí' : 'no'}`,
    `Auditado: ${task.f3.checkAuditado ? 'sí' : 'no'}`,
    `Notas: ${task.f3.notas || '[pendiente]'}`,
  ];
}

function promptReview(task: Task): string[] {
  const version = currentMethodVersion(task);
  return [
    ...promptProblemContext(task),
    '',
    'Confrontaciones:',
    ...(task.f4.aar.length
      ? task.f4.aar.filter((item) => item.observado || item.causa || item.pred || item.mia)
        .map((item, index) => `${index + 1}. Observado: ${item.observado || '[pendiente]'} | Causa: ${item.causa || '[pendiente]'} | Mía: ${item.mia ? 'sí' : 'no'}`)
      : ['- [pendiente]']),
    `Cambio procedural: ${task.f4.cambio || '[pendiente]'}`,
    `Título: ${task.f4.titulo || '[pendiente]'}`,
    `Conexiones: ${task.f4.conexiones || '[pendiente]'}`,
    `Método activo: ${version?.id ?? '[pendiente]'}`,
    `Madurez: ${deriveMethodMaturity(task)}`,
    '',
    'Mejoras:',
    ...promptCriteriaList(task),
  ];
}

function promptOrientation(task: Task): string[] {
  return [
    ...promptProblemContext(task),
    '',
    'Linaje:',
    ...(task.f1.linaje.length
      ? task.f1.linaje
        .filter((row) => Object.values(row).some(filled))
        .map((row, index) => `${index + 1}. origen: ${row.origen || '[sin origen]'} | resultado: ${row.resultado || '[sin resultado]'}`)
      : ['- [pendiente]']),
    '',
    `Resultado deseado: ${task.f1.resultadoDeseado || '[pendiente]'}`,
    `Alcance: ${task.f1.alcance || '[pendiente]'}`,
    `Restricciones: ${task.f1.restricciones || '[pendiente]'}`,
    `Actores: ${normalizeTextArray(task.f1.actores).join(', ') || '[pendiente]'}`,
    `Criterio de éxito: ${task.f1.criterioExito || '[pendiente]'}`,
    `Dudas iniciales: ${task.f1.dudas || '[pendiente]'}`,
    `Mapeo confirmado: ${task.f1.checkMapeo ? 'sí' : 'no'}`,
    `Confirmación final: ${task.f1.confirmacion ? 'sí' : 'no'}`,
    `Problema detectado: ${task.f1.analisisProblema.problemaDetectado || '[pendiente]'}`,
    `Evidencia: ${task.f1.analisisProblema.evidencia || '[pendiente]'}`,
    `Análisis: ${task.f1.analisisProblema.analisis || '[pendiente]'}`,
    `Decisión: ${task.f1.analisisProblema.decision || 'pendiente'}`,
    `Justificación: ${task.f1.analisisProblema.justificacion || '[pendiente]'}`,
    `Formulación vigente: ${task.f1.analisisProblema.problemaVigente || '[pendiente]'}`,
  ];
}

export function buildPrompt(taskInput: Task, stage: 'orientation' | 'guide' | 'execution' | 'review'): string {
  const task = repairTask(taskInput);
  const lines = stage === 'orientation'
    ? promptOrientation(task)
    : stage === 'guide'
      ? promptGuide(task)
      : stage === 'execution'
        ? promptExecution(task)
        : promptReview(task);
  return lines.join('\n');
}

function escapeMarkdown(value: unknown): string {
  return String(value ?? '').replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char);
}

export function buildMarkdown(taskInput: Task): string {
  const task = repairTask(taskInput);
  const methodVersion = currentMethodVersion(task);
  const predictions = task.f2.predicciones.filter((p) => filled(p.texto) || filled(p.umbral));
  const lines = [
    `# ${escapeMarkdown(task.f4.titulo || task.nombre)}`,
    '', '## Contexto', escapeMarkdown(task.directiva), '',
    '## Decisión', escapeMarkdown(task.f2.decision || '[pendiente]'), '',
    '## Alcance', escapeMarkdown(task.f2.alcance || '[pendiente]'), '',
    '## Subproblemas', ...(normalizeTextArray(task.f2.subproblemas).map((item) => `- ${escapeMarkdown(item)}`) || ['- [pendiente]']),
    '## Predicciones',
    ...(predictions.length ? predictions.map((p, i) => `- ${i + 1}. ${escapeMarkdown(p.texto || '[sin texto]')} | Umbral: ${escapeMarkdown(p.umbral || '[sin umbral]')} | Confianza: ${escapeMarkdown(p.conf)}`) : ['- [pendiente]']),
    `## Madurez del método`, escapeMarkdown(deriveMethodMaturity(task)),
    `## Método activo`, escapeMarkdown(methodVersion?.id || '[pendiente]'), '',
    ...promptCriteriaList(task).map((entry) => `- ${escapeMarkdown(entry)}`),
  ];
  lines.push('', '## Análisis del problema', escapeMarkdown(task.f1.analisisProblema.problemaVigente || '[pendiente]'), '', '## Criterios revisados', ...promptCriteria(task).map((criterion) => `- ${escapeMarkdown(criterion)}`), '', '## Iteraciones', ...task.f3.iteraciones.filter((i) => i.intento || i.resultado || i.ajuste).map((iteration, index) => `- ${index + 1}. ${escapeMarkdown(iteration.intento)} | ${escapeMarkdown(iteration.resultado)} | ${escapeMarkdown(iteration.ajuste)} | Versión: ${escapeMarkdown(iteration.methodVersionId || '[sin versión]')}`));
  return lines.join('\n');
}

export const buildMd = buildMarkdown;
