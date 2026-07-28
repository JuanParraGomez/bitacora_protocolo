import { repairTask, gateReasons } from './app/features/tasks/domain/task-rules';
import { mockWorkspaceAssistant } from './app/features/tasks/services/mock-workspace-assistant';
import { buildPhaseRevision } from './app/features/tasks/domain/task-assistant-rules';

const base = repairTask({
  id:'ws-eval-flow',
  nombre:'Flujo de evaluación',
  directiva:'Validar continuidad por fases',
  fase:1,
  estado:'activa',
  f1:{
    linaje:[{origen:'',resultado:''}],
    dudas:'',
    checkMapeo:false,
    confirmacion:false,
    analisisProblema:{problemaDetectado:'', evidencia:'', analisis:'', decision:'pendiente', justificacion:'', problemaVigente:''},
  },
  f2:{ criterios:[], predicciones:[{texto:'',umbral:'',conf:'media'},{texto:'',umbral:'',conf:'media'},{texto:'',umbral:'',conf:'media'}], },
  f3:{ iteraciones:[{id:'iter-1', intento:'', resultado:'', ajuste:'', criterioIds:[]}], checkCompila:false, checkAuditado:false},
  f4:{ aar:[{pred:'',observado:'',causa:'',mia:false}], }
});

const reasons = gateReasons(base);
console.log('reasons', reasons);
const ev = await mockWorkspaceAssistant.evaluate({
  requestId:'x',
  taskId:base.id,
  phase:1,
  responseRevision: buildPhaseRevision(base,1),
  phaseSnapshot: base.f1,
  gateReasons: reasons,
  instructionKey:'outcome',
  previousEvaluations: [],
});
console.log('eval1', ev);

const filled = repairTask({
  ...base,
  f1: {
    ...base.f1,
    linaje: [{ origen: 'Directivo', resultado: 'Meta' }],
    checkMapeo: true,
    confirmacion: true,
    analisisProblema: {
      ...base.f1.analisisProblema,
      problemaDetectado: 'Problema inicial detectado',
      evidencia: 'Evidencia verificable',
      analisis: 'Análisis funcional completo.',
      decision: 'reformular',
      justificacion: 'La evidencia permite reformular',
      problemaVigente: 'Problema vigente para continuar',
    },
  },
});

const reasons2 = gateReasons(filled);
console.log('reasons2', reasons2);
const ev2 = await mockWorkspaceAssistant.evaluate({
  requestId:'y',
  taskId: filled.id,
  phase: 1,
  responseRevision: buildPhaseRevision(filled,1),
  phaseSnapshot: filled.f1,
  gateReasons: reasons2,
  instructionKey:'outcome',
  previousEvaluations: [],
});
console.log('eval2', ev2);
