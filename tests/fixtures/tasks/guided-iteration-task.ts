export const guidedIterationTask = {
  id: 'guided-fixture', nombre: 'Tarea guiada', directiva: 'Validar criterios', fase: 3, estado: 'activa',
  f1: { analisisProblema: { problemaDetectado: 'Problema', evidencia: 'Evidencia', analisis: 'Análisis', decision: 'mantener', justificacion: 'Confirmado', problemaVigente: 'Problema' } },
  f2: { criterios: [{ id: 'criterion-1', texto: 'Criterio', comentario: 'Comentario revisado', prioridad: 'alta', estado: 'pendiente', impacto: 'alto' }] },
  f3: { iteraciones: [{ id: 'iteration-1', intento: 'Intento', resultado: 'Resultado', ajuste: 'Ajuste', criterioIds: ['criterion-1'] }], checkCompila: false, checkAuditado: false },
};
