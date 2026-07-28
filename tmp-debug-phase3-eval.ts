import { repairTask, canAdvance } from './app/features/tasks/domain/task-rules';

const task = repairTask({
  id: 't-stage-3-min',
  fase: 3,
  f3: {
    iteraciones: [
      {
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
      },
    ],
    checkCompila: true,
    checkAuditado: true,
  },
});

const iter = task.f3.iteraciones[0]!;
console.log('intento', JSON.stringify(iter.intento));
console.log('resultado', Boolean(iter.resultado), iter.resultado.length);
console.log('ajuste', Boolean(iter.ajuste), iter.ajuste.length);
console.log('objective', Boolean(iter.objective), iter.objective.length);
console.log('action', Boolean(iter.action), iter.action.length);
console.log('tool', Boolean(iter.tool), iter.tool.length);
console.log('input', Boolean(iter.input), iter.input.length);
console.log('result', Boolean(iter.result), iter.result.length);
console.log('learning', Boolean(iter.learning), iter.learning.length);
console.log('next', Boolean(iter.nextAdjustment), iter.nextAdjustment.length);
console.log('methodVersionId', iter.methodVersionId, Boolean(iter.methodVersionId));
console.log('evidence', Array.isArray(iter.evidence), iter.evidence.length);
console.log('applicable', Array.isArray(iter.applicableConditions), iter.applicableConditions.length);
console.log('all', [iter.intento, iter.resultado, iter.ajuste, iter.objective, iter.action, iter.tool, iter.input, iter.result, iter.learning, iter.nextAdjustment, iter.evidence, iter.criterioIds, iter.applicableConditions, iter.methodVersionId].map((v) => v));
console.log(canAdvance(task));
