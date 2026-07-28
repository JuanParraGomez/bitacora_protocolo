import { repairTask } from './app/features/tasks/domain/task-rules';
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

function filled(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

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

console.log({len: task.f3.iteraciones.length, hasValidIteration});
console.log(task.f3.iteraciones[0]);
