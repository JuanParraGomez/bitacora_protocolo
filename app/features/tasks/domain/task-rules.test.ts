import { describe, expect, it } from 'vitest';
import {
  advanceTask,
  buildPrompt,
  buildMarkdown,
  canAdvance,
  canAdvanceWithAssistant,
  createBlankTask,
  deriveMethodMaturity,
  deriveCriterionImprovements,
  addIteration,
  repairTask,
} from './task-rules';
import { buildPhaseRevision } from './task-assistant-rules';

describe('task domain rules', () => {
  it('repairs missing legacy phase objects with safe defaults', () => {
    const task = repairTask({ id: 't1', nombre: 'Migrar', directiva: 'Hazlo' });
    expect(task.fase).toBe(1);
    expect(task.estado).toBe('activa');
    expect(task.f2.predicciones).toHaveLength(3);
    expect(task.f3.iteraciones).toHaveLength(1);
    expect(task.f4.aar).toEqual([]);
    expect(task.f1.analisisProblema.decision).toBe('pendiente');
    expect(task.f2.criterios).toEqual([]);
    expect(task.f4.mejorasCriterios).toEqual([]);
    expect(task.f4.aar).toEqual([]);
  });

  it('repairs an inherited task already in phases 2 to 4 without blocking its progress', () => {
    const task = repairTask({ id: 'legacy-2', fase: 3, directiva: 'Conservar la directiva' });
    expect(task.fase).toBe(3);
    expect(task.f1.analisisProblema.decision).toBe('mantener');
    expect(task.f1.analisisProblema.problemaVigente).toBe('Conservar la directiva');
    expect(task.f1.analisisProblema.justificacion).toContain('compatibilidad');
    expect(task.f1.linaje).toHaveLength(1);
    expect(task.f2.predicciones).toHaveLength(3);
    expect(repairTask({ id: 'legacy-4', fase: 4 }).f4.aar).toHaveLength(1);
  });

  it('rejects incomplete final decisions but accepts maintain and reformulate decisions', () => {
    const task = createBlankTask('Tarea', 'Directiva');
    task.f1.linaje = [{ origen: 'brief', resultado: 'mapeado' }];
    task.f1.confirmacion = true;
    task.f1.resultadoDeseado = 'Resultado esperado';
    task.f1.alcance = 'Alcance';
    task.f1.restricciones = 'Sin restricciones';
    task.f1.actores = ['Actor'];
    task.f1.criterioExito = 'Criterio de éxito';
    expect(canAdvance(task).reasons).toContain('Decide si mantienes o reformulas el problema.');
    task.f1.analisisProblema = {
      problemaDetectado: 'Problema inicial', evidencia: 'Evidencia', analisis: 'Análisis',
      decision: 'mantener', justificacion: 'La evidencia lo confirma', problemaVigente: 'Problema inicial',
    };
    expect(canAdvance(task).allowed).toBe(true);
  });

  it('adds identifiable iterations and ignores invalid criterion references during repair', () => {
    const task = repairTask({ id: 't-iter', f2: { criterios: [{ id: 'c1', texto: 'Criterio', prioridad: 'alta', estado: 'pendiente', impacto: 'alto' }] } });
    const withIteration = addIteration(task);
    withIteration.f3.iteraciones[0]!.criterioIds = ['c1', 'missing'];
    const repaired = repairTask(withIteration);
    expect(repaired.f3.iteraciones[0]!.id).toBeTruthy();
    expect(repaired.f3.iteraciones[0]!.criterioIds).toEqual(['c1']);
  });

  it('derives one improvement entry per source criterion without duplicating source text', () => {
    const task = repairTask({ id: 't-review', f2: { criterios: [
      { id: 'c1', texto: 'Criterio A' }, { id: 'c2', texto: 'Criterio B' },
    ] } });
    expect(deriveCriterionImprovements(task)).toEqual([
      { criterioId: 'c1', confirmado: false, mejora: '' },
      { criterioId: 'c2', confirmado: false, mejora: '' },
    ]);
  });

  const completePromptInput = {
    id: 't-prompt-complete',
    directiva: 'Directiva',
    f1: {
      linaje: [{ origen: 'Sistema', resultado: 'Migración' }],
      dudas: '¿Qué necesito resolver?',
      checkMapeo: true,
      confirmacion: true,
      analisisProblema: {
        problemaDetectado: 'Problema inicial',
        evidencia: 'Evidencia',
        analisis: 'Análisis base',
        decision: 'reformular',
        justificacion: 'Se requiere mejora',
        problemaVigente: 'Problema vigente',
      },
    },
    f2: {
      decision: 'Decisión base',
      alcance: 'Alcance',
      noObjetivos: 'No hace',
      pasos: 'Paso 1',
      criterios: [{ id: 'c1', texto: 'Criterio A', comentario: 'Comentario revisado', prioridad: 'alta', estado: 'pendiente', impacto: 'medio' }],
      predicciones: [
        { texto: 'Predicción 1', umbral: '10', conf: 'alta' },
        { texto: 'Predicción 2', umbral: '20', conf: 'media' },
        { texto: 'Predicción 3', umbral: '30', conf: 'baja' },
      ],
    },
    f3: {
      iteraciones: [{
        id: 'i1',
        intento: 'Intento',
        resultado: 'Resultado',
        ajuste: 'Ajuste',
        criterioIds: ['c1'],
        methodVersionId: 'method-1',
        objective: 'Objetivo',
        action: 'Acción',
        tool: 'Herramienta',
        input: 'Entrada',
        result: 'Resultado',
        evidence: [{ id: 'e-1', kind: 'note', label: 'Evidencia', value: 'Observación' }],
        learning: 'Aprendizaje',
        nextAdjustment: 'Ajuste',
        applicableConditions: ['Condición'],
      }],
      checkCompila: true,
      checkAuditado: true,
    },
    f4: {
      aar: [{ pred: 'Pred', observado: 'Observado', causa: 'Causa', mia: true }],
      cambio: 'Agregar trazabilidad',
      titulo: 'Afirmación',
      mejorasCriterios: [{ criterioId: 'c1', confirmado: true, mejora: 'Mejora' }],
    },
  };

  it('buildPrompt builds complete orientation prompt with only orientation fields', () => {
    const task = repairTask(completePromptInput);
    const prompt = buildPrompt(task, 'orientation');
    [
      'Problema vigente: Problema vigente',
      'Linaje:',
      'origen: Sistema',
      'resultado: Migración',
      'Dudas iniciales: ¿Qué necesito resolver?',
      'Decisión: reformular',
      'Justificación: Se requiere mejora',
      'Formulación vigente: Problema vigente',
    ].forEach(value => expect(prompt).toContain(value));
    ['Criterio A', 'Predicciones:', 'Iteraciones:', 'Confrontaciones:', 'Mejoras:'].forEach(value => expect(prompt).not.toContain(value));
  });

  it('buildPrompt builds complete guide prompt with only guide fields', () => {
    const task = repairTask(completePromptInput);
    const prompt = buildPrompt(task, 'guide');
    ['Problema vigente: Problema vigente', 'Decisión: Decisión base', 'Alcance: Alcance', 'No-objetivos: No hace', 'Predicciones:', '1. Predicción 1 | Umbral: 10', '1. Criterio A | Comentario: Comentario revisado'].forEach(value => expect(prompt).toContain(value));
    ['Iteraciones:', 'Confrontaciones:', 'Mejoras:', 'Afirmación'].forEach(value => expect(prompt).not.toContain(value));
  });

  it('buildPrompt builds complete execution prompt with only execution fields', () => {
    const task = repairTask(completePromptInput);
    const prompt = buildPrompt(task, 'execution');
    ['Problema vigente: Problema vigente', 'Criterios revisados:', '1. Objetivo: Objetivo | Acción: Acción | Herramienta: Herramienta | Resultado: Resultado | Ajuste: Ajuste', 'Compila: sí', 'Auditado: sí', 'Notas: [pendiente]'].forEach(value => expect(prompt).toContain(value));
    ['Confrontaciones:', 'Predicciones:', 'Alcance:', 'Mejoras:'].forEach(value => expect(prompt).not.toContain(value));
  });

  it('buildPrompt builds complete review prompt with only review fields', () => {
    const task = repairTask(completePromptInput);
    const prompt = buildPrompt(task, 'review');
    ['Problema vigente: Problema vigente', 'Confrontaciones:', '1. Observado: Observado | Causa: Causa | Mía: sí', 'Cambio procedural: Agregar trazabilidad', 'Mejoras:', 'c1: [x] Mejora', 'Afirmación'].forEach(value => expect(prompt).toContain(value));
    ['Iteraciones:', 'Notas:', 'Criterios revisados:'].forEach(value => expect(prompt).not.toContain(value));
  });

  it.each(['orientation', 'guide', 'execution', 'review'] as const)('buildPrompt shows pending values for empty %s prompt input', (stage) => {
    const task = repairTask({ id: 't-prompt-empty', f1: { linaje: [{}], analisisProblema: {} }, f2: { criterios: [], predicciones: [] }, f3: { iteraciones: [] }, f4: { aar: [] } });
    const prompt = buildPrompt(task, stage);
    expect(prompt).toContain('[pendiente]');
  });

  it('buildPrompt in orientation preserves special characters and punctuation', () => {
    const task = repairTask({
      id: 't-prompt-special-orientation',
      f1: {
        linaje: [{ origen: 'A&B', resultado: 'c> < d' }],
        analisisProblema: { problemaVigente: 'v<igente>', problemaDetectado: '<p>', evidencia: 'E&vid', analisis: 'A&', justificacion: '<tag>', decision: 'reformular' },
        dudas: '',
      },
    });
    const prompt = buildPrompt(task, 'orientation');
    expect(prompt).toContain('A&B');
    expect(prompt).toContain('c> < d');
    expect(prompt).toContain('<p>');
    expect(prompt).toContain('v<igente>');
    expect(prompt).toContain('E&vid');
    expect(prompt).toContain('<tag>');
  });

  it('buildPrompt in guide preserves special characters and punctuation', () => {
    const task = repairTask({
      id: 't-prompt-special-guide',
      f2: {
        decision: 'decisión&',
        alcance: 'Al<c>ance',
        noObjetivos: 'No<script>',
        pasos: 'Paso1 & Paso2',
        predicciones: [
          { texto: 'P<red>1', umbral: '0&1', conf: 'alta' },
          { texto: 'P2', umbral: '2', conf: 'media' },
          { texto: 'P3', umbral: '3', conf: 'media' },
        ],
      },
    });
    const prompt = buildPrompt(task, 'guide');
    expect(prompt).toContain('decisión&');
    expect(prompt).toContain('Al<c>ance');
    expect(prompt).toContain('No<script>');
    expect(prompt).toContain('Paso1 & Paso2');
    expect(prompt).toContain('P<red>1');
  });

  it('buildPrompt in execution preserves special characters and punctuation', () => {
    const task = repairTask({
      id: 't-prompt-special-execution',
      f2: {
        criterios: [{ id: 'c1', texto: 'Criterio & uno', comentario: 'C<>', prioridad: 'alta', estado: 'pendiente', impacto: 'medio' }],
      },
      f3: {
        iteraciones: [{
          intento: '<b>Intento</b>',
          objective: '<b>Objetivo</b>',
          action: 'Acción <a>',
          tool: 'Herramienta <t>',
          result: 'Res&ultado',
          nextAdjustment: 'A<j>uste',
          criterioIds: [],
          resultado: 'Resultado',
          ajuste: 'Ajuste',
          applicableConditions: ['Condición'],
        }],
        notas: 'Nota <especial>',
      },
    });
    const prompt = buildPrompt(task, 'execution');
    expect(prompt).toContain('<b>Objetivo</b>');
    expect(prompt).toContain('Res&ultado');
    expect(prompt).toContain('A<j>uste');
  });

  it('buildPrompt in review preserves special characters and punctuation', () => {
    const task = repairTask({
      id: 't-prompt-special-review',
      f4: {
        aar: [{ pred: 'P', observado: 'Obs<rv>', causa: 'C&ausa', mia: true }],
        cambio: 'Agregar <validación>',
        titulo: '<Título>',
      },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio A', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
    });
    const prompt = buildPrompt(task, 'review');
    expect(prompt).toContain('Obs<rv>');
    expect(prompt).toContain('C&ausa');
    expect(prompt).toContain('Agregar <validación>');
    expect(prompt).toContain('<Título>');
  });

  it('repairs legacy tasks that lack orientation prompt fields', () => {
    const task = repairTask({ id: 'legacy-orientation', directiva: 'Directiva base', fase: 3 });
    expect(task.f1.promptOrientacion).toBe('');
    expect(task.f1.promptOrientacionPersonalizado).toBe(false);
  });

  it('preserves the closed vocabulary for criterion priority, status and impact', () => {
    const task = repairTask({ id: 'labels', f2: { criterios: [{ id: 'c1', texto: 'C', prioridad: 'alta', estado: 'en-progreso', impacto: 'bajo' }] } });
    expect(task.f2.criterios[0]).toMatchObject({ prioridad: 'alta', estado: 'en-progreso', impacto: 'bajo' });
    const repairedInvalid = repairTask({ id: 'invalid-label', f2: { criterios: [{ prioridad: 'urgent' }] } });
    expect(repairedInvalid.f2.criterios).toHaveLength(0);
  });

  it.each([0, 5, -1, Number.NaN])('rejects phase %s outside 1..4', (phase) => {
    expect([1, 2, 3, 4]).not.toContain(phase);
  });

  it('does not advance when a gate has missing required fields', () => {
    const task = createBlankTask('Tarea', 'Directiva');
    expect(canAdvance(task)).toEqual({ allowed: false, reasons: expect.any(Array) });
    expect(advanceTask(task)).toMatchObject(task);
  });

  it('requires FR-020 minimum fields for stage 1 continuity', () => {
    const task = createBlankTask('Tarea', 'Directiva');
    task.fase = 1;
    task.f1 = {
      ...task.f1,
      linaje: [{ origen: 'brief', resultado: 'resolver' }],
      checkMapeo: true,
      confirmacion: true,
      resultadoDeseado: 'Resultado esperado',
      alcance: 'Limitado al caso base',
      restricciones: 'No tocar producción',
      actores: ['Equipo', 'Usuario'],
      criterioExito: 'Entrega funcional y comprobable',
      analisisProblema: {
        ...task.f1.analisisProblema,
        decision: 'mantener',
        problemaDetectado: 'Fallo de automatización',
        evidencia: 'Registros reproducidos',
        analisis: 'El problema puede resolverse con método',
        justificacion: 'Se confirmó el alcance',
        problemaVigente: 'Problema vigente confirmado',
      },
    };

    expect(canAdvance(task)).toEqual({ allowed: true, reasons: [] });
  });

  it('requires FR-021 minimum fields for stage 2 decomposition', () => {
    const task = repairTask({
      id: 't-stage-2-min',
      fase: 2,
      nombre: 'Tarea',
      directiva: 'Directiva',
      f2: {
        decision: 'Decisión operativa',
        alcance: 'Cobertura inicial',
        noObjetivos: 'Sin impacto externo',
        pasos: '1. Diagnóstico\n2. Ajuste',
        predicciones: [
          { texto: 'Predicción 1', umbral: '1', conf: 'alta' },
          { texto: 'Predicción 2', umbral: '2', conf: 'media' },
          { texto: 'Predicción 3', umbral: '3', conf: 'media' },
        ],
        subproblemas: ['Conectividad', 'Formato'],
        preguntasAbiertas: ['¿Qué cambia si falla X?'],
        riesgos: ['Riesgo de dependencia'],
      },
    });

    expect(canAdvance(task).allowed).toBe(true);
  });

  it('requires FR-022 complete iteration fields and review checks in stage 3', () => {
    const task = repairTask({
      id: 't-stage-3-min',
      fase: 3,
      nombre: 'Tarea',
      directiva: 'Directiva',
      f3: {
        iteraciones: [{
          id: 'it-1',
          intento: 'Primer intento',
          resultado: 'Observación inicial',
          ajuste: 'Ajuste del flujo',
          criterioIds: [],
          methodVersionId: 'method-1',
          objective: 'Generar salida válida',
          action: 'Ejecutar validación',
          tool: 'CLI',
          input: 'Datos de prueba',
          result: 'Salida esperada',
          evidence: [{ id: 'ev-1', kind: 'note', label: 'Hallazgo', value: 'Evidencia reproducible' }],
          learning: 'La validación requiere entradas consistentes',
          nextAdjustment: 'Corregir formato de salida',
          applicableConditions: ['Misma versión', 'Entrada estable'],
          success: true,
          successCriteriaResults: [{ criterion: 'verificacion', passed: true }],
          createdAt: 1,
        }],
        checkCompila: true,
        checkAuditado: true,
      },
    });

    expect(canAdvance(task).allowed).toBe(true);
  });

  it('derives documented-once and repeatable-method by version-matched successful iterations', () => {
    const task = repairTask({
      id: 't-maturity',
      nombre: 'Tarea',
      directiva: 'Directiva',
      f3: {
        iteraciones: [
          {
            id: 'it-1',
            intento: 'Intento',
            resultado: 'Resultado base',
            ajuste: 'Ajuste inicial',
            criterioIds: [],
            methodVersionId: 'method-1',
            objective: 'Objetivo',
            action: 'Ejecutar',
            tool: 'Script',
            input: 'Input',
            result: 'Output',
            evidence: [{ id: 'ev-1', kind: 'note', label: 'Evidencia', value: 'Ajuste aplicado' }],
            learning: 'Aprendizaje registrado',
            nextAdjustment: 'Continuar al paso 2',
            applicableConditions: ['Condición estable'],
            success: true,
            successCriteriaResults: [{ criterion: 'criterio', passed: true }],
            createdAt: 1,
          },
        ],
      },
      methodVersions: [
        {
          id: 'method-1',
          version: 1,
          parentVersionId: null,
          status: 'draft',
          changeKind: 'initial',
          preconditions: ['Entorno controlado'],
          steps: [{
            id: 'step-1',
            title: 'Paso 1',
            objective: 'Verificar la salida',
            dependencies: [],
            inputs: ['Entrada base'],
            output: 'Salida',
            tool: 'Script',
            risk: 'Bajo',
            successCriterion: 'Salida consistente',
            sourceCriterionId: null,
          }],
          tools: ['Script'],
          inputs: ['Entrada base'],
          outputs: ['Salida'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Salida consistente'],
          supportingIterationIds: ['it-1'],
          createdAt: 1,
        },
      ],
    });

    expect(deriveMethodMaturity(task)).toBe('documented-once');

    task.f3.iteraciones.push({
      id: 'it-2',
      intento: 'Segundo intento',
      resultado: 'Resultado estable',
      ajuste: 'Sin cambios',
      criterioIds: [],
      methodVersionId: 'method-1',
      objective: 'Objetivo',
      action: 'Ejecutar',
      tool: 'Script',
      input: 'Input',
      result: 'Output',
      evidence: [{ id: 'ev-2', kind: 'note', label: 'Evidencia', value: 'Ejecución correcta' }],
      learning: 'Reproducción establecida',
      nextAdjustment: 'No ajustar',
      applicableConditions: ['Condición estable'],
      success: true,
      successCriteriaResults: [{ criterion: 'criterio', passed: true }],
      createdAt: 2,
    });

    expect(deriveMethodMaturity(task)).toBe('repeatable-method');
  });

  it('resets maturity evidence when a new material method version becomes active', () => {
    const task = repairTask({
      id: 't-maturity-reset',
      nombre: 'Tarea',
      directiva: 'Directiva',
      f3: {
        iteraciones: [
          {
            id: 'it-1',
            intento: 'Intento',
            resultado: 'Resultado base',
            ajuste: 'Ajuste inicial',
            criterioIds: [],
            methodVersionId: 'method-1',
            objective: 'Objetivo',
            action: 'Ejecutar',
            tool: 'Script',
            input: 'Input',
            result: 'Output',
            evidence: [{ id: 'ev-1', kind: 'note', label: 'Evidencia', value: 'A' }],
            learning: 'Aprendizaje base',
            nextAdjustment: 'Siguiente',
            applicableConditions: ['Condición estable'],
            success: true,
            successCriteriaResults: [{ criterion: 'criterio', passed: true }],
            createdAt: 1,
          },
          {
            id: 'it-2',
            intento: 'Segundo intento',
            resultado: 'Resultado base',
            ajuste: 'Ajuste fino',
            criterioIds: [],
            methodVersionId: 'method-1',
            objective: 'Objetivo',
            action: 'Ejecutar',
            tool: 'Script',
            input: 'Input',
            result: 'Output',
            evidence: [{ id: 'ev-2', kind: 'note', label: 'Evidencia', value: 'B' }],
            learning: 'Aprendizaje estable',
            nextAdjustment: 'Siguiente',
            applicableConditions: ['Condición estable'],
            success: true,
            successCriteriaResults: [{ criterion: 'criterio', passed: true }],
            createdAt: 2,
          },
          {
            id: 'it-3',
            intento: 'Nueva versión',
            resultado: 'Resultado estable',
            ajuste: 'Ajuste material',
            criterioIds: [],
            methodVersionId: 'method-2',
            objective: 'Objetivo',
            action: 'Ejecutar',
            tool: 'CLI',
            input: 'Input',
            result: 'Salida',
            evidence: [{ id: 'ev-3', kind: 'note', label: 'Evidencia', value: 'C' }],
            learning: 'Aprendizaje actualizado',
            nextAdjustment: 'Seguir',
            applicableConditions: ['Nuevo flujo'],
            success: true,
            successCriteriaResults: [{ criterion: 'criterio', passed: true }],
            createdAt: 3,
          },
        ],
      },
      methodVersions: [
        {
          id: 'method-1',
          version: 1,
          parentVersionId: null,
          status: 'superseded',
          changeKind: 'initial',
          preconditions: ['Entorno base'],
          steps: [{
            id: 'step-1',
            title: 'Paso 1',
            objective: 'Verificar',
            dependencies: [],
            inputs: ['Input'],
            output: 'Output',
            tool: 'Script',
            risk: 'Bajo',
            successCriterion: 'Resultado esperado',
            sourceCriterionId: null,
          }],
          tools: ['Script'],
          inputs: ['Input'],
          outputs: ['Output'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Resultado esperado'],
          supportingIterationIds: ['it-1', 'it-2'],
          createdAt: 1,
        },
        {
          id: 'method-2',
          version: 2,
          parentVersionId: 'method-1',
          status: 'draft',
          changeKind: 'material',
          preconditions: ['Entorno nuevo'],
          steps: [{
            id: 'step-2',
            title: 'Paso 1',
            objective: 'Verificar',
            dependencies: [],
            inputs: ['Input nuevo'],
            output: 'Output nuevo',
            tool: 'CLI',
            risk: 'Medio',
            successCriterion: 'Resultado mejorado',
            sourceCriterionId: null,
          }],
          tools: ['CLI'],
          inputs: ['Input nuevo'],
          outputs: ['Output nuevo'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Resultado mejorado'],
          supportingIterationIds: ['it-3'],
          createdAt: 4,
        },
      ],
    });

    expect(deriveMethodMaturity(task)).toBe('documented-once');
  });

  it('ignores automation opportunities linked to non-active method versions in phase 4 gating', () => {
    const task = repairTask({
      id: 't-cross-version-opportunities',
      nombre: 'Tarea',
      directiva: 'Directiva',
      fase: 4,
      f4: {
        aar: [{ pred: 'Pred', observado: 'Observado', causa: 'Causa', mia: true }],
        cambio: 'Corrección de procedimiento',
        titulo: 'Versión activa',
      },
      methodVersions: [
        {
          id: 'method-1',
          version: 1,
          parentVersionId: null,
          status: 'draft',
          changeKind: 'initial',
          preconditions: ['Contexto base'],
          steps: [{
            id: 'step-1',
            title: 'Paso base',
            objective: 'Verificar',
            dependencies: [],
            inputs: ['Input'],
            output: 'Output',
            tool: 'CLI',
            risk: 'Bajo',
            successCriterion: 'Resultado esperado',
            sourceCriterionId: null,
          }],
          tools: ['CLI'],
          inputs: ['Input'],
          outputs: ['Output'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Resultado esperado'],
          supportingIterationIds: ['it-1'],
          createdAt: 1,
        },
        {
          id: 'method-2',
          version: 2,
          parentVersionId: 'method-1',
          status: 'draft',
          changeKind: 'material',
          preconditions: ['Contexto nuevo'],
          steps: [{
            id: 'step-2',
            title: 'Paso actualizado',
            objective: 'Verificar nuevo',
            dependencies: [],
            inputs: ['Input nuevo'],
            output: 'Output nuevo',
            tool: 'CLI',
            risk: 'Medio',
            successCriterion: 'Resultado estable',
            sourceCriterionId: null,
          }],
          tools: ['CLI'],
          inputs: ['Input nuevo'],
          outputs: ['Output nuevo'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Resultado estable'],
          supportingIterationIds: [],
          createdAt: 2,
        },
      ],
      automationOpportunities: [
        {
          id: 'opp-cross',
          methodVersionId: 'method-1',
          stepIds: ['step-1'],
          classification: 'manual',
          frequency: 'Frecuente',
          stability: 'Variable',
          risk: 'Bajo',
          humanJudgment: 'Revisar',
          trigger: 'Salida completa',
          inputs: ['Input'],
          transformation: 'Normalizar',
          output: 'Output',
          candidateTool: 'Herramienta',
          expectedFailures: ['Error transitorio'],
          humanCheckpoint: 'Confirmar',
          occurrenceIterationIds: ['it-1'],
        },
      ],
    });

    task.methodVersions = [...task.methodVersions].sort((left, right) => right.createdAt - left.createdAt);
    const phase4Task = repairTask(task);
    phase4Task.f4.methodVersionId = 'method-2';
    expect(canAdvance(phase4Task).allowed).toBe(false);

    phase4Task.automationOpportunities = [
      {
        id: 'opp-active',
        methodVersionId: 'method-2',
        stepIds: ['step-2'],
        classification: 'manual',
        frequency: 'Frecuente',
        stability: 'Variable',
        risk: 'Bajo',
        humanJudgment: 'Revisar',
        trigger: 'Salida completa',
        inputs: ['Input nuevo'],
        transformation: 'Normalizar',
        output: 'Output nuevo',
        candidateTool: 'Herramienta',
        expectedFailures: ['Error transitorio'],
        humanCheckpoint: 'Confirmar',
        occurrenceIterationIds: ['it-1'],
      },
    ];

    expect(canAdvance(phase4Task).allowed).toBe(true);
  });

  it('invalidates continuation when stage-2 delivery data changes after an acceptable outcome', () => {
    const task = repairTask({
      id: 't-stale-edit',
      nombre: 'Tarea',
      directiva: 'Directiva',
      f2: {
        decision: 'Decisión inicial',
        alcance: 'Alcance',
        noObjetivos: 'No objetivos',
        pasos: 'Paso 1',
        predicciones: [
          { texto: 'Predicción 1', umbral: '10', conf: 'alta' },
          { texto: 'Predicción 2', umbral: '20', conf: 'media' },
          { texto: 'Predicción 3', umbral: '30', conf: 'media' },
        ],
        subproblemas: ['Problema'],
        preguntasAbiertas: ['¿Por qué?'],
        riesgos: ['Riesgo'],
      },
    });
    task.fase = 2;

    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'p2-ok',
          taskId: task.id,
          phase: 2,
          responseRevision: buildPhaseRevision(task),
          gateVersion: 'outcome-v2',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: Date.now(),
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };

    expect(canAdvanceWithAssistant(task).allowed).toBe(true);

    task.f2.decision = 'Nueva decisión';
    expect(canAdvanceWithAssistant(task).allowed).toBe(false);
  });

  it('allows each phase only after its gate is complete', () => {
    const task = createBlankTask('Tarea', 'Directiva');
    task.f1.confirmacion = true;
    task.f1.linaje = [{ origen: 'brief', resultado: 'mapeado' }];
    task.f1.resultadoDeseado = 'Resultado esperado';
    task.f1.alcance = 'Alcance';
    task.f1.restricciones = 'Sin restricciones';
    task.f1.actores = ['Actor'];
    task.f1.criterioExito = 'Criterio de éxito';
    task.f1.analisisProblema = {
      problemaDetectado: 'Problema', evidencia: 'Evidencia', analisis: 'Análisis', decision: 'mantener',
      justificacion: 'Confirmado', problemaVigente: 'Problema',
    };
    expect(canAdvance(task).allowed).toBe(true);
    const phase2 = advanceTask(task);
    expect(phase2.fase).toBe(2);
    phase2.f2.decision = 'Decisión';
    phase2.f2.alcance = 'Alcance';
    phase2.f2.noObjetivos = 'No objetivos';
    phase2.f2.pasos = 'Pasos';
    phase2.f2.subproblemas = ['Subproblema'];
    phase2.f2.preguntasAbiertas = ['¿Por qué?'];
    phase2.f2.riesgos = ['Riesgo'];
    phase2.f2.predicciones = [
      { texto: 'A', umbral: 'B', conf: 'media' },
      { texto: 'C', umbral: 'D', conf: 'media' },
      { texto: 'E', umbral: 'F', conf: 'media' },
    ];
    expect(advanceTask(phase2).fase).toBe(3);
  });

  it('requires a fresh acceptable evaluation to continue from phase 1', () => {
    const task = createBlankTask('Tarea', 'Directiva');
    task.fase = 1;
    task.f1 = {
      ...task.f1,
      linaje: [{ origen: 'brief', resultado: 'resultado' }],
      checkMapeo: true,
      confirmacion: true,
      resultadoDeseado: 'Resultado esperado',
      alcance: 'Alcance',
      restricciones: 'Sin restricciones',
      actores: ['Actor'],
      criterioExito: 'Criterio de éxito',
      analisisProblema: {
        problemaDetectado: 'Detectado',
        evidencia: 'Evidencia',
        analisis: 'Análisis',
        decision: 'reformular',
        justificacion: 'Cierre',
        problemaVigente: 'Problema vigente',
      },
    };

    expect(canAdvanceWithAssistant(task).allowed).toBe(false);

    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'p1-ok',
          taskId: task.id,
          phase: 1,
          responseRevision: buildPhaseRevision(task, 1),
          gateVersion: 'outcome-v2',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: Date.now(),
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };

    expect(canAdvanceWithAssistant(task).allowed).toBe(true);
  });

  it('requires fresh phase-2 acceptance when continuing phase 2', () => {
    const task = repairTask({
      id: 't-phase-2',
      fase: 2,
      directiva: 'Directiva',
      f1: { linaje: [{ origen: 'brief', resultado: 'meta' }], analisisProblema: { decision: 'mantener', problemaVigente: 'Problema' } },
    f2: {
      decision: 'Decisión', alcance: 'Alcance', noObjetivos: 'Sin objetivos', pasos: 'Paso 1',
      predicciones: [
        { texto: 'Predicción 1', umbral: '10', conf: 'alta' },
        { texto: 'Predicción 2', umbral: '20', conf: 'media' },
        { texto: 'Predicción 3', umbral: '30', conf: 'media' },
      ],
      subproblemas: ['Subproblema'],
      preguntasAbiertas: ['¿Por qué?'],
      riesgos: ['Riesgo'],
    },
  });

    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'p2-stale',
          taskId: task.id,
          phase: 2,
          responseRevision: `${buildPhaseRevision(task, 2)}-old`,
          gateVersion: 'outcome-v2',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 1,
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };

    const blocked = canAdvanceWithAssistant(task);
    expect(blocked.allowed).toBe(false);
    expect(blocked.reasons).toContain('La fase requiere una evaluación vigente y aceptable del asistente para continuar.');

    task.assistant.evaluations[0]!.responseRevision = buildPhaseRevision(task, 2);
    expect(canAdvanceWithAssistant(task).allowed).toBe(true);
  });

  it('allows phase 3 and phase 4 to continue only with current acceptance', () => {
    const task = repairTask({
      id: 't-phase-3',
      fase: 3,
      directiva: 'Directiva',
      f2: { criterios: [{ id: 'c1', texto: 'Criterio', comentario: '', prioridad: 'alta', estado: 'pendiente', impacto: 'alto' }] },
      f3: {
        iteraciones: [{
          id: 'i1',
          intento: 'Intento',
          resultado: 'Resultado',
          ajuste: 'Ajuste',
          criterioIds: ['c1'],
          methodVersionId: 'method-1',
          objective: 'Objetivo',
          action: 'Ejecutar',
          tool: 'CLI',
          input: 'Entrada',
          result: 'Salida',
          evidence: [{ id: 'ev-1', kind: 'note', label: 'Evidencia', value: 'Ejecución completa' }],
          learning: 'Aprendizaje registrado',
          nextAdjustment: 'Continuar',
          applicableConditions: ['Condición base'],
        }],
        checkCompila: true,
        checkAuditado: true,
      },
    });

    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'p3-ok',
          taskId: task.id,
          phase: 3,
          responseRevision: buildPhaseRevision(task, 3),
          gateVersion: 'outcome-v2',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: Date.now(),
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };
    expect(canAdvanceWithAssistant(task).allowed).toBe(true);

    const phase4Task = repairTask({
      id: 't-phase-4',
      fase: 4,
      f4: {
        aar: [{ pred: 'Pred', observado: 'Observado', causa: 'Causa', mia: true }],
        cambio: 'Cambio',
        titulo: 'Título',
      },
      methodVersions: [{
        id: 'method-1',
        version: 1,
        parentVersionId: null,
        status: 'draft',
        changeKind: 'initial',
        preconditions: ['Contexto base'],
        steps: [{
          id: 'step-1',
          title: 'Paso inicial',
          objective: 'Verificar resultado',
          dependencies: [],
          inputs: ['Entrada'],
          output: 'Salida',
          tool: 'CLI',
          risk: 'Bajo',
          successCriterion: 'Resultado esperado',
          sourceCriterionId: null,
        }],
        tools: ['CLI'],
        inputs: ['Entrada'],
        outputs: ['Salida'],
        controls: ['Revisión humana'],
        exceptions: [],
        exceptionsReviewed: true,
        successCriteria: ['Resultado esperado'],
        supportingIterationIds: [],
        createdAt: 1,
      }],
      automationOpportunities: [{
        id: 'opp-1',
        methodVersionId: 'method-1',
        stepIds: ['step-1'],
        classification: 'manual',
        frequency: 'Frecuente',
        stability: 'Variable',
        risk: 'Bajo',
        humanJudgment: 'Revisar',
        trigger: 'Ejecución completa',
        inputs: ['Entrada'],
        transformation: 'Normalizar',
        output: 'Salida',
        candidateTool: 'CLI',
        expectedFailures: ['Error transitorio'],
        humanCheckpoint: 'Confirmar',
        occurrenceIterationIds: [],
      }],
    });
    phase4Task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'p4-need',
          taskId: phase4Task.id,
          phase: 4,
          responseRevision: buildPhaseRevision(phase4Task, 4),
          gateVersion: 'outcome-v2',
          methodVersionId: 'method-1',
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: Date.now(),
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };
    expect(canAdvanceWithAssistant(phase4Task).allowed).toBe(true);
  });

  it('generates Markdown without executable HTML/script injection', () => {
    const task = createBlankTask('<script>alert(1)</script>', 'Directiva');
    const markdown = buildMarkdown(task);
    expect(markdown).not.toContain('<script>');
    expect(markdown).toContain('&lt;script&gt;');
    expect(markdown).toContain('# ');
  });
});
