export type ConversationalProjectFixture = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  lastActiveTaskId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type ExecutionIterationFixture = {
  id: string;
  methodVersionId: string | null;
  objective: string;
  action: string;
  tool: string;
  input: string;
  result: string;
  evidence: Array<{ id: string; kind: 'note' | 'link' | 'artifact' | 'observation'; label: string; value: string }>;
  learning: string;
  nextAdjustment: string;
  applicableConditions: string[];
  success: boolean;
  successCriteriaResults: Array<{ criterion: string; passed: boolean }>;
  createdAt: number;
};

export type MethodVersionFixture = {
  id: string;
  version: number;
  parentVersionId: string | null;
  status: 'draft' | 'published' | 'superseded';
  changeKind: 'initial' | 'material';
  preconditions: string[];
  steps: Array<{ id: string; title: string; objective: string; dependencies: string[]; inputs: string[]; output: string; tool: string; risk: string; successCriterion: string; sourceCriterionId: string | null }>;
  tools: string[];
  inputs: string[];
  outputs: string[];
  controls: string[];
  exceptions: string[];
  exceptionsReviewed: boolean;
  successCriteria: string[];
  supportingIterationIds: string[];
  createdAt: number;
};

export type AutomationCandidateFixture = {
  id: string;
  methodVersionId: string;
  stepIds: string[];
  classification: 'manual' | 'assistable' | 'automatable';
  frequency: string;
  stability: string;
  risk: string;
  humanJudgment: string;
  trigger: string;
  inputs: string[];
  transformation: string;
  output: string;
  candidateTool: string;
  expectedFailures: string[];
  humanCheckpoint: string;
  occurrenceIterationIds: string[];
};

const now = () => Date.now();
const randomSuffix = () => Math.random().toString(36).slice(2, 10);

export function buildConversationalProject(overrides: Partial<ConversationalProjectFixture> = {}): ConversationalProjectFixture {
  const createdAt = overrides.createdAt ?? now();
  const updatedAt = overrides.updatedAt ?? createdAt;
  return {
    id: overrides.id ?? `project-${randomSuffix()}`,
    name: overrides.name ?? 'Proyecto de muestra',
    description: overrides.description ?? 'Proyecto reutilizable para pruebas de pruebas funcionales.',
    status: overrides.status ?? 'active',
    lastActiveTaskId: overrides.lastActiveTaskId ?? null,
    createdAt,
    updatedAt,
  };
}

export function buildMethodVersion(overrides: Partial<MethodVersionFixture> = {}): MethodVersionFixture {
  const id = overrides.id ?? `method-${randomSuffix()}`;
  return {
    id,
    version: overrides.version ?? 1,
    parentVersionId: overrides.parentVersionId ?? null,
    status: overrides.status ?? 'draft',
    changeKind: overrides.changeKind ?? 'initial',
    preconditions: overrides.preconditions ?? ['Contexto definido'],
    steps: overrides.steps ?? [
      {
        id: `step-${randomSuffix()}`,
        title: 'Paso inicial',
        objective: 'Generar un resultado verificable',
        dependencies: [],
        inputs: ['Entrada A'],
        output: 'Salida esperada',
        tool: 'N/A',
        risk: 'Ninguno',
        successCriterion: 'El resultado cumple',
        sourceCriterionId: null,
      },
    ],
    tools: overrides.tools ?? ['CLI'],
    inputs: overrides.inputs ?? ['Contexto', 'Recursos'],
    outputs: overrides.outputs ?? ['Resultado'],
    controls: overrides.controls ?? ['Confirmación humana'],
    exceptions: overrides.exceptions ?? [],
    exceptionsReviewed: overrides.exceptionsReviewed ?? true,
    successCriteria: overrides.successCriteria ?? ['Verificación funcional'],
    supportingIterationIds: overrides.supportingIterationIds ?? [],
    createdAt: overrides.createdAt ?? now(),
  };
}

export function buildExecutionIteration(overrides: Partial<ExecutionIterationFixture> = {}): ExecutionIterationFixture {
  return {
    id: overrides.id ?? `iteration-${randomSuffix()}`,
    methodVersionId: overrides.methodVersionId ?? null,
    objective: overrides.objective ?? 'Validar cambio de método',
    action: overrides.action ?? 'Ejecutar prueba guiada',
    tool: overrides.tool ?? 'CLI',
    input: overrides.input ?? 'Entrada de control',
    result: overrides.result ?? 'Resultado consistente',
    evidence: overrides.evidence ?? [
      {
        id: `evidence-${randomSuffix()}`,
        kind: 'observation',
        label: 'Observación inicial',
        value: 'La ejecución completa y deja trazabilidad visible',
      },
    ],
    learning: overrides.learning ?? 'El flujo se estabilizó para el mismo ajuste.',
    nextAdjustment: overrides.nextAdjustment ?? 'Ajustar una sola variable',
    applicableConditions: overrides.applicableConditions ?? ['Misma versión'],
    success: overrides.success ?? true,
    successCriteriaResults: overrides.successCriteriaResults ?? [
      { criterion: 'Verificación funcional', passed: true },
    ],
    createdAt: overrides.createdAt ?? now(),
  };
}

export function buildAutomationCandidate(overrides: Partial<AutomationCandidateFixture> = {}): AutomationCandidateFixture {
  return {
    id: overrides.id ?? `candidate-${randomSuffix()}`,
    methodVersionId: overrides.methodVersionId ?? `method-${randomSuffix()}`,
    stepIds: overrides.stepIds ?? ['step-1'],
    classification: overrides.classification ?? 'manual',
    frequency: overrides.frequency ?? 'Alta',
    stability: overrides.stability ?? 'Media',
    risk: overrides.risk ?? 'Riesgo controlado',
    humanJudgment: overrides.humanJudgment ?? 'Verificar excepciones antes de automatizar',
    trigger: overrides.trigger ?? 'Nueva tarea con mismo patrón',
    inputs: overrides.inputs ?? ['Patrón de entrada', 'Regla de salida'],
    transformation: overrides.transformation ?? 'Aplicar la regla X al conjunto',
    output: overrides.output ?? 'Resultado con formato esperado',
    candidateTool: overrides.candidateTool ?? 'Script interno',
    expectedFailures: overrides.expectedFailures ?? ['Entradas incompletas', 'Entorno externo fuera'],
    humanCheckpoint: overrides.humanCheckpoint ?? 'Confirmar revisión previa a ejecutar',
    occurrenceIterationIds: overrides.occurrenceIterationIds ?? [],
  };
}
