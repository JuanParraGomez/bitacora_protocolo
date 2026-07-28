import { repairTask, canAdvance, gateReasons } from './app/features/tasks/domain/task-rules';

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
        evidence: [{ id: 'ev-1', kind: 'note', label: 'Hallorado', value: 'Evidencia reproducible' }],
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

console.log('phase', task.fase);
console.log('canAdvance', canAdvance(task));
console.log('gateReasons', gateReasons(task));
