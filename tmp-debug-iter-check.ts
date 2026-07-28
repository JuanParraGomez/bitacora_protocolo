import { repairTask } from './app/features/tasks/domain/task-rules';

const task = repairTask({
  id: 't-stage-3-min',
  fase: 3,
  nombre: 'Tarea',
  directiva: 'Directiva',
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
        evidence: [
          { id: 'ev-1', kind: 'note', label: 'Hallazgo', value: 'Evidencia reproducible' },
        ],
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

for (const [i, iter] of task.f3.iteraciones.entries()) {
  const filled = (value: unknown): boolean => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  const cond = {
    intento: filled(iter.intento),
    resultado: filled(iter.resultado),
    ajuste: filled(iter.ajuste),
    objective: filled(iter.objective),
    action: filled(iter.action),
    tool: filled(iter.tool),
    input: filled(iter.input),
    result: filled(iter.result),
    learning: filled(iter.learning),
    nextAdjustment: filled(iter.nextAdjustment),
    evidenceArray: Array.isArray(iter.evidence) && iter.evidence.length >= 1,
    criterionIds: Array.isArray(iter.criterioIds),
    applicableConditions: Array.isArray(iter.applicableConditions) && iter.applicableConditions.length >= 1,
    methodVersion: filled(iter.methodVersionId),
  };
  console.log(i, cond, 'all', Object.values(cond).every(Boolean));
}
