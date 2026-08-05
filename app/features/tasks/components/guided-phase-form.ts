import type { Task } from '../domain/task.schema';

export type GuidedPhaseSaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type GuidedPhaseSaveCopy = {
  statusLabel: string;
  actionLabel: string;
  helperLabel: string;
  retryLabel: string;
};

export type GuidedPhaseFormModel = {
  phaseLabel: string;
  priorityFieldLabels: string[];
  contextSectionLabel: string | null;
  captureControlLabels: string[];
  saveCopy: GuidedPhaseSaveCopy;
};

const PHASE_LABELS: Record<Task['fase'], string> = {
  1: 'Entender el problema',
  2: 'Descomponer el camino',
  3: 'Ejecución',
  4: 'Revisión',
};

const PHASE_1_PRIORITY_FIELDS = [
  'Problema detectado',
  'Evidencia',
  'Análisis',
  'Resultado deseado',
  'Criterio de éxito',
];

const PHASE_2_CAPTURE_CONTROLS = [
  'Decisión',
  'Alcance',
  'No-objetivos',
  'Pasos',
  'Dependencias y orden entre pasos',
  'Subproblemas',
  'Preguntas abiertas',
  'Riesgos detectados',
  'Predicciones',
  'Criterios revisados',
];

const PHASE_3_CAPTURE_CONTROLS = [
  'Iteración 1',
  'Añadir iteración',
  'Confirma que compila',
  'Confirma que fue auditado',
];

const PHASE_4_CAPTURE_CONTROLS = [
  'Observado',
  'Causa',
  'Fue una suposición propia',
  'Título de consolidación',
  'Cambio procedimental',
  'Patrón operativo',
  'Conexiones y límites',
  'Añadir confrontación',
];

export function resolveGuidedPhaseSaveCopy(state: GuidedPhaseSaveState, errorMessage = ''): GuidedPhaseSaveCopy {
  if (state === 'dirty') {
    return {
      statusLabel: 'Cambios sin guardar',
      actionLabel: 'Guardar borrador',
      helperLabel: 'Los cambios aún no se han guardado.',
      retryLabel: 'Reintentar',
    };
  }

  if (state === 'saving') {
    return {
      statusLabel: 'Guardando…',
      actionLabel: 'Guardar borrador',
      helperLabel: 'Persistiendo el borrador actual.',
      retryLabel: 'Reintentar',
    };
  }

  if (state === 'saved') {
    return {
      statusLabel: 'Borrador guardado',
      actionLabel: 'Guardar borrador',
      helperLabel: 'El borrador queda disponible para continuar.',
      retryLabel: 'Reintentar',
    };
  }

  if (state === 'error') {
    return {
      statusLabel: errorMessage || 'No se pudo guardar el borrador.',
      actionLabel: 'Guardar borrador',
      helperLabel: 'El trabajo permanece en memoria y puede reintentarse.',
      retryLabel: 'Reintentar',
    };
  }

  return {
    statusLabel: 'Borrador listo',
    actionLabel: 'Guardar borrador',
    helperLabel: 'Los cambios se guardan manualmente.',
    retryLabel: 'Reintentar',
  };
}

export function buildGuidedPhaseFormModel(task: Task, saveState: GuidedPhaseSaveState = 'idle', saveError = ''): GuidedPhaseFormModel {
  const phaseLabel = PHASE_LABELS[task.fase] ?? `Fase ${task.fase}`;
  const isPhaseOne = task.fase === 1;

  return {
    phaseLabel,
    priorityFieldLabels: isPhaseOne ? [...PHASE_1_PRIORITY_FIELDS] : [],
    contextSectionLabel: isPhaseOne ? 'Contexto y confirmación' : null,
    captureControlLabels:
      task.fase === 2 ? [...PHASE_2_CAPTURE_CONTROLS]
        : task.fase === 3 ? [...PHASE_3_CAPTURE_CONTROLS]
          : task.fase === 4 ? [...PHASE_4_CAPTURE_CONTROLS]
            : [],
    saveCopy: resolveGuidedPhaseSaveCopy(saveState, saveError),
  };
}
