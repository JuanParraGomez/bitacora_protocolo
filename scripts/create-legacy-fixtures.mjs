import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const root = path.resolve(process.cwd(), 'tests/fixtures/legacy');
fs.mkdirSync(root, { recursive: true });

function create(name, rows = []) {
  const file = path.join(root, name);
  fs.rmSync(file, { force: true });
  const db = new Database(file);
  db.exec('CREATE TABLE kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const insert = db.prepare('INSERT INTO kv_store (key, value) VALUES (?, ?)');
  for (const [key, value] of rows) insert.run(key, value);
  db.close();
}

const now = () => Date.now();
const baseIndex = (tareas = [], registros = []) => ({ tareas, registros });

create('bitacora.sqlite', [['bitacora:index', JSON.stringify(baseIndex())]]);
create('empty.sqlite');
create('malformed.sqlite', [['bitacora:index', '{not-json']]);
create('interrupted.sqlite', [['bitacora:index', JSON.stringify(baseIndex())]]);
create('historical-pre-assistant.sqlite', [
  ['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-pre-assistant', nombre: 'Legacy sin asistente', fase: 1, estado: 'activa', tipo: 'protocolo' }], registros: [] })],
  ['bitacora:t:legacy-pre-assistant', JSON.stringify({
    id: 'legacy-pre-assistant',
    nombre: 'Legacy sin asistente',
    directiva: 'Conservar datos',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: { linaje: [{ origen: 'brief', resultado: 'mapa' }], promptOrientacion: 'Prompt legacy', promptOrientacionPersonalizado: true },
  })],
]);
create('historical-custom-prompts.sqlite', [
  ['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-prompts', nombre: 'Legacy prompts', fase: 4, estado: 'activa', tipo: 'protocolo' }], registros: [] })],
  ['bitacora:t:legacy-prompts', JSON.stringify({
    id: 'legacy-prompts',
    nombre: 'Legacy prompts',
    directiva: 'Prompts editados',
    fase: 4,
    estado: 'activa',
    tipo: 'protocolo',
    f1: { promptOrientacion: 'Orientación manual', promptOrientacionPersonalizado: true },
    f2: { promptGuia: 'Guía manual', promptGuiaPersonalizado: true },
    f3: { promptEjecucion: 'Ejecución manual', promptEjecucionPersonalizado: true },
    f4: { promptAar: 'AAR manual', promptAarPersonalizado: true, aar: [{ pred: 'P', observado: 'O', causa: 'C', mia: true }] },
  })],
]);
create('historical-assistant-secrets.sqlite', [
  ['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-secret-assistant', nombre: 'Legacy secretos', fase: 2, estado: 'activa', tipo: 'protocolo' }], registros: [] })],
  ['bitacora:t:legacy-secret-assistant', JSON.stringify({
    id: 'legacy-secret-assistant',
    nombre: 'Legacy secretos',
    directiva: 'Limpiar asistente',
    fase: 2,
    estado: 'activa',
    tipo: 'protocolo',
    assistant: {
      schemaVersion: 99,
      messages: [],
      evaluations: [],
      settings: { mode: 'deepseek', connectionStatus: 'deferred', schemaVersion: 99, apiKey: 'never-commit', token: 'never-token' },
    },
  })],
]);

create('two-projects.sqlite', [
  ['bitacora:projects', JSON.stringify({
    schemaVersion: 1,
    activeProjectId: 'alpha',
    projects: [
      {
        id: 'alpha',
        name: 'Proyecto alfa',
        description: 'Grupo para validación de vista de proyectos',
        status: 'active',
        lastActiveTaskId: 'conv-two-project-alpha',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: 'beta',
        name: 'Proyecto beta',
        description: 'Grupo secundario para migración y selección',
        status: 'active',
        lastActiveTaskId: 'conv-two-project-beta',
        createdAt: now() - 120000,
        updatedAt: now(),
      },
    ],
  })],
  ['bitacora:index', JSON.stringify({
    tareas: [
      { id: 'conv-two-project-alpha', nombre: 'Tarea Alfa', fase: 1, estado: 'activa', tipo: 'protocolo', projectId: 'alpha' },
      { id: 'conv-two-project-beta', nombre: 'Tarea Beta', fase: 2, estado: 'activa', tipo: 'protocolo', projectId: 'beta' },
    ],
    registros: [],
  })],
  ['bitacora:t:conv-two-project-alpha', JSON.stringify({
    id: 'conv-two-project-alpha',
    schemaVersion: 2,
    projectId: 'alpha',
    nombre: 'Tarea Alfa',
    directiva: 'Validar separación por proyectos',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: { linaje: [{ origen: 'brief', resultado: 'proyecto separado' }], promptOrientacion: '', promptOrientacionPersonalizado: false },
    assistant: { schemaVersion: 2, messages: [], evaluations: [], settings: { mode: 'mock', connectionStatus: 'deferred', schemaVersion: 2 } },
  })],
  ['bitacora:t:conv-two-project-beta', JSON.stringify({
    id: 'conv-two-project-beta',
    schemaVersion: 2,
    projectId: 'beta',
    nombre: 'Tarea Beta',
    directiva: 'Comparar proyecto secundario',
    fase: 2,
    estado: 'activa',
    tipo: 'protocolo',
    f2: { decision: '', faqs: '', alcance: '', noObjetivos: '', pasos: '', descartadas: '', guia: '' },
    assistant: { schemaVersion: 2, messages: [], evaluations: [], settings: { mode: 'mock', connectionStatus: 'deferred', schemaVersion: 2 } },
  })],
]);

create('legacy-project.sqlite', [
  ['bitacora:index', JSON.stringify({
    tareas: [
      { id: 'legacy-project-task', nombre: 'Sin proyecto persistido', fase: 1, estado: 'activa', tipo: 'protocolo' },
    ],
    registros: [],
  })],
  ['bitacora:t:legacy-project-task', JSON.stringify({
    id: 'legacy-project-task',
    nombre: 'Sin proyecto persistido',
    directiva: 'Debe mapear a legacy',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: { linaje: [{ origen: 'legacy', resultado: 'sin proyectos' }], promptOrientacion: '' },
    assistant: { schemaVersion: 1, messages: [], evaluations: [], settings: { mode: 'deferred', connectionStatus: 'deferred', schemaVersion: 1 } },
  })],
]);

create('repeatable-v1.sqlite', [
  ['bitacora:index', JSON.stringify({
    tareas: [{ id: 'repeatable-v1-task', nombre: 'Método repetible v1', fase: 4, estado: 'completada', tipo: 'protocolo', projectId: 'legacy' }],
    registros: [],
  })],
  ['bitacora:t:repeatable-v1-task', JSON.stringify({
    id: 'repeatable-v1-task',
    schemaVersion: 2,
    projectId: 'legacy',
    nombre: 'Método repetible v1',
    directiva: 'Validar evidencia de una sola versión',
    fase: 4,
    estado: 'completada',
    tipo: 'protocolo',
    methodVersions: [
      {
        id: 'method-v1',
        version: 1,
        parentVersionId: null,
        status: 'published',
        changeKind: 'initial',
        preconditions: ['Datos mínimos disponibles'],
        steps: [
          {
            id: 'step-1',
            title: 'Paso estable',
            objective: 'Resolver subproblema base',
            dependencies: [],
            inputs: ['Entrada'],
            output: 'Resultado',
            tool: 'CLI',
            risk: 'Bajo',
            successCriterion: 'Cumple objetivo',
            sourceCriterionId: null,
          },
        ],
        tools: ['CLI'],
        inputs: ['Entrada'],
        outputs: ['Salida'],
        controls: ['Confirmación humana'],
        exceptions: [],
        exceptionsReviewed: true,
        successCriteria: ['Completado funcional'],
        supportingIterationIds: ['repeatable-iter-1', 'repeatable-iter-2'],
        createdAt: now(),
      },
    ],
    f3: {
      iteraciones: [
        { id: 'repeatable-iter-1', methodVersionId: 'method-v1', objetivo: '', action: '', tool: '', input: '', result: '', evidence: [], learning: '', nextAdjustment: 'No aplica', applicableConditions: [], success: true, successCriteriaResults: [{ criterion: 'Completado funcional', passed: true }], createdAt: now() },
        { id: 'repeatable-iter-2', methodVersionId: 'method-v1', objetivo: '', action: '', tool: '', input: '', result: '', evidence: [], learning: '', nextAdjustment: 'No aplica', applicableConditions: [], success: true, successCriteriaResults: [{ criterion: 'Completado funcional', passed: true }], createdAt: now() },
      ],
      checkCompila: true,
      checkAuditado: true,
    },
    assistant: { schemaVersion: 2, messages: [], evaluations: [], settings: { mode: 'mock', connectionStatus: 'deferred', schemaVersion: 2 } },
  })],
]);

create('material-v2.sqlite', [
  ['bitacora:index', JSON.stringify({
    tareas: [{ id: 'material-v2-task', nombre: 'Cambio material v2', fase: 4, estado: 'completada', tipo: 'protocolo', projectId: 'legacy' }],
    registros: [],
  })],
  ['bitacora:t:material-v2-task', JSON.stringify({
    id: 'material-v2-task',
    schemaVersion: 2,
    projectId: 'legacy',
    nombre: 'Cambio material v2',
    directiva: 'Validar reinicio material',
    fase: 4,
    estado: 'completada',
    tipo: 'protocolo',
    methodVersions: [
      {
        id: 'method-v2-base',
        version: 1,
        parentVersionId: null,
        status: 'superseded',
        changeKind: 'initial',
        preconditions: ['Fase estable'],
        steps: [
          {
            id: 'step-1',
            title: 'Paso base',
            objective: 'Primera versión',
            dependencies: [],
            inputs: ['Entrada'],
            output: 'Salida',
            tool: 'Script',
            risk: 'Bajo',
            successCriterion: 'Salida válida',
            sourceCriterionId: null,
          },
        ],
        tools: ['Script'],
        inputs: ['Entrada'],
        outputs: ['Salida'],
        controls: ['Confirmación humana'],
        exceptions: ['Proveedor no disponible'],
        exceptionsReviewed: true,
        successCriteria: ['Completado funcional'],
        supportingIterationIds: ['material-iter-1'],
        createdAt: now() - 120000,
      },
      {
        id: 'method-v2-material',
        version: 2,
        parentVersionId: 'method-v2-base',
        status: 'published',
        changeKind: 'material',
        preconditions: ['Paso previo validado'],
        steps: [
          {
            id: 'step-1',
            title: 'Paso nuevo',
            objective: 'Nueva ruta material',
            dependencies: [],
            inputs: ['Entrada nueva'],
            output: 'Salida nueva',
            tool: 'Script',
            risk: 'Medio',
            successCriterion: 'Salida estable',
            sourceCriterionId: null,
          },
        ],
        tools: ['Script'],
        inputs: ['Entrada nueva'],
        outputs: ['Salida nueva'],
        controls: ['Revisión humana'],
        exceptions: ['Timeout'],
        exceptionsReviewed: true,
        successCriteria: ['Completado funcional'],
        supportingIterationIds: ['material-iter-2'],
        createdAt: now(),
      },
    ],
    f3: {
      iteraciones: [
        { id: 'material-iter-1', methodVersionId: 'method-v2-base', objetivo: '', action: '', tool: '', input: '', result: '', evidence: [], learning: '', nextAdjustment: 'Materializar cambio', applicableConditions: [], success: true, successCriteriaResults: [{ criterion: 'Completado funcional', passed: true }], createdAt: now() },
        { id: 'material-iter-2', methodVersionId: 'method-v2-material', objetivo: '', action: '', tool: '', input: '', result: '', evidence: [], learning: '', nextAdjustment: 'No aplica', applicableConditions: [], success: true, successCriteriaResults: [{ criterion: 'Completado funcional', passed: true }], createdAt: now() },
      ],
      checkCompila: true,
      checkAuditado: true,
    },
    assistant: { schemaVersion: 2, messages: [], evaluations: [], settings: { mode: 'mock', connectionStatus: 'deferred', schemaVersion: 2 } },
  })],
]);
