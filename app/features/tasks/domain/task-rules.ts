import type { CriterionImprovement, Task } from './task.schema';
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

export function gateReasons(taskInput: Task): string[] {
  const task = repairTask(taskInput);
  if (task.fase === 1) {
    const hasLineage = task.f1.linaje.some(row => Object.values(row).filter(filled).length >= 2);
    return [
      ...(hasLineage ? [] : ['Completa al menos una relación de linaje con dos campos.']),
      ...(task.f1.checkMapeo || task.f1.confirmacion ? [] : ['Confirma el mapeo completo antes de avanzar.']),
      ...(task.f1.analisisProblema.decision === 'mantener' || task.f1.analisisProblema.decision === 'reformular' ? [] : ['Decide si mantienes o reformulas el problema.']),
      ...(task.f1.analisisProblema.problemaDetectado.trim() && task.f1.analisisProblema.evidencia.trim() && task.f1.analisisProblema.analisis.trim() ? [] : ['Completa el problema, la evidencia y el análisis.']),
      ...(task.f1.analisisProblema.justificacion.trim() && task.f1.analisisProblema.problemaVigente.trim() ? [] : ['Justifica la decisión y escribe la formulación vigente.']),
    ];
  }
  if (task.fase === 2) {
    const completePredictions = task.f2.predicciones.filter(p => filled(p.texto) && filled(p.umbral)).length;
    return [
      ...(filled(task.f2.decision) ? [] : ['Escribe la decisión o resultado que habilita la tarea.']),
      ...(filled(task.f2.alcance) && filled(task.f2.noObjetivos) ? [] : ['Define alcance y no-objetivos.']),
      ...(filled(task.f2.pasos) ? [] : ['Esquematiza los pasos.']),
      ...(completePredictions >= 3 ? [] : ['Completa tres predicciones con texto y umbral.']),
    ];
  }
  if (task.fase === 3) {
    return [
      ...(task.f3.iteraciones.some(i => filled(i.intento)) ? [] : ['Registra al menos una iteración.']),
      ...(task.f3.checkCompila ? [] : ['Confirma que compila.']),
      ...(task.f3.checkAuditado ? [] : ['Confirma que fue auditado.']),
    ];
  }
  const completeReviews = task.f4.aar.filter(a => filled(a.observado) && filled(a.causa)).length;
  return [
    ...(completeReviews === task.f4.aar.length ? [] : ['Completa observado y causa en cada predicción.']),
    ...(task.f4.aar.some(a => a.mia) ? [] : ['Marca al menos una suposición propia como causa.']),
    ...(filled(task.f4.cambio) ? [] : ['Define un cambio procedimental concreto.']),
    ...(filled(task.f4.titulo) ? [] : ['Titula el registro con una afirmación.']),
  ];
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
  if (task.fase < 4) return { ...task, fase: (task.fase + 1) as Task['fase'] };
  return { ...task, estado: 'completada' };
}

export function addIteration(taskInput: Task): Task {
  const task = repairTask(taskInput);
  const next = { id: `iteration-${Date.now().toString(36)}`, intento: '', resultado: '', ajuste: '', criterioIds: [] };
  return { ...task, f3: { ...task.f3, iteraciones: [...task.f3.iteraciones, next] } };
}

export function deriveCriterionImprovements(taskInput: Task): CriterionImprovement[] {
  const task = repairTask(taskInput);
  return task.f2.criterios.map(criterion => {
    const previous = task.f4.mejorasCriterios.find(item => item.criterioId === criterion.id);
    return previous ? { ...previous } : { criterioId: criterion.id, confirmado: false, mejora: '' };
  });
}

function promptCriteria(task: Task): string[] {
  return task.f2.criterios
    .filter(criterion => criterion.texto.trim() || criterion.comentario.trim())
    .map((criterion, index) => `${index + 1}. ${criterion.texto || '[sin criterio]'} | Comentario: ${criterion.comentario || '[sin comentario]'} | Prioridad: ${criterion.prioridad} | Estado: ${criterion.estado} | Impacto: ${criterion.impacto}`);
}

function promptProblemContext(task: Task): string[] {
  return [`Problema vigente: ${task.f1.analisisProblema.problemaVigente || task.directiva || '[pendiente]'}`];
}

function promptGuide(task: Task): string[] {
  return [
    ...promptProblemContext(task),
    '',
    `Decisión: ${task.f2.decision || '[pendiente]'}`,
    `Alcance: ${task.f2.alcance || '[pendiente]'}`,
    `No-objetivos: ${task.f2.noObjetivos || '[pendiente]'}`,
    `Pasos: ${task.f2.pasos || '[pendiente]'}`,
    `FAQs: ${task.f2.faqs || '[pendiente]'}`,
    '',
    `Guía: ${task.f2.guia || '[pendiente]'}`,
    'Predicciones:',
    ...(task.f2.predicciones.length
      ? task.f2.predicciones.map((prediction, index) => `${index + 1}. ${prediction.texto || '[sin texto]'} | Umbral: ${prediction.umbral || '[sin umbral]'}`)
      : ['- [pendiente]']),
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
      ? task.f3.iteraciones.filter(i => i.intento || i.resultado || i.ajuste)
        .map((i, n) => `${n + 1}. Intento: ${i.intento || '[pendiente]'} | Resultado: ${i.resultado || '[pendiente]'} | Ajuste: ${i.ajuste || '[pendiente]'}`)
      : ['- [pendiente]']),
    '',
    `Compila: ${task.f3.checkCompila ? 'sí' : 'no'}`,
    `Auditado: ${task.f3.checkAuditado ? 'sí' : 'no'}`,
    `Notas: ${task.f3.notas || '[pendiente]'}`,
  ];
}

function promptReview(task: Task): string[] {
  return [
    ...promptProblemContext(task),
    '',
    'Confrontaciones:',
    ...(task.f4.aar.length
      ? task.f4.aar.filter(item => item.observado || item.causa || item.pred || item.mia)
        .map((item, index) => `${index + 1}. Observado: ${item.observado || '[pendiente]'} | Causa: ${item.causa || '[pendiente]'} | Mía: ${item.mia ? 'sí' : 'no'}`)
      : ['- [pendiente]']),
    `Cambio procedural: ${task.f4.cambio || '[pendiente]'}`,
    `Título: ${task.f4.titulo || '[pendiente]'}`,
    `Conexiones: ${task.f4.conexiones || '[pendiente]'}`,
    '',
    'Mejoras:',
    ...deriveCriterionImprovements(task).map(item => `${item.criterioId}: ${item.confirmado ? '[x]' : '[ ]'} ${item.mejora || '[pendiente]'}`),
  ];
}

function promptOrientation(task: Task): string[] {
  return [
    ...promptProblemContext(task),
    '',
    'Linaje:',
    ...(task.f1.linaje.length
      ? task.f1.linaje
        .filter(row => Object.values(row).some(filled))
        .map((row, index) => `${index + 1}. origen: ${row.origen || '[sin origen]'} | resultado: ${row.resultado || '[sin resultado]'}`)
      : ['- [pendiente]']),
    '',
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
  return String(value ?? '').replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char);
}

export function buildMarkdown(taskInput: Task): string {
  const task = repairTask(taskInput);
  const predictions = task.f2.predicciones.filter(p => filled(p.texto) || filled(p.umbral));
  const lines = [
    `# ${escapeMarkdown(task.f4.titulo || task.nombre)}`,
    '', '## Contexto', escapeMarkdown(task.directiva), '',
    '## Decisión', escapeMarkdown(task.f2.decision || '[pendiente]'), '',
    '## Alcance', escapeMarkdown(task.f2.alcance || '[pendiente]'), '',
    '## Predicciones',
    ...(predictions.length ? predictions.map((p, i) => `- ${i + 1}. ${escapeMarkdown(p.texto || '[sin texto]')} | Umbral: ${escapeMarkdown(p.umbral || '[sin umbral]')} | Confianza: ${escapeMarkdown(p.conf)}`) : ['- [pendiente]']),
  ];
  lines.push('', '## Análisis del problema', escapeMarkdown(task.f1.analisisProblema.problemaVigente || '[pendiente]'), '', '## Criterios revisados', ...promptCriteria(task).map(criterion => `- ${escapeMarkdown(criterion)}`), '', '## Iteraciones', ...task.f3.iteraciones.filter(i => i.intento || i.resultado || i.ajuste).map((iteration, index) => `- ${index + 1}. ${escapeMarkdown(iteration.intento)} | ${escapeMarkdown(iteration.resultado)} | ${escapeMarkdown(iteration.ajuste)}`));
  return lines.join('\n');
}

export const buildMd = buildMarkdown;
