import type { TaskPhase } from './task-assistant.schema';

export type InstructionKey = 'socratic' | 'guide-criteria' | 'execution-checks' | 'aar-signals';

export type PhaseInstruction = {
  phase: TaskPhase;
  key: InstructionKey;
  title: string;
  criteria: string[];
};

export const phaseInstructions: Record<TaskPhase, PhaseInstruction[]> = {
  1: [
    {
      phase: 1,
      key: 'socratic',
      title: 'Orientación socrática',
      criteria: [
        'Formula preguntas cerradas primero y mantiene foco en contexto funcional.',
        'No reutilizar texto de prompt* guardado como instrucción ejecutiva.',
        'No solicitar credenciales, ni claves, ni configuración de proveedor en el flujo.',
      ],
    },
  ],
  2: [
    {
      phase: 2,
      key: 'guide-criteria',
      title: 'Guía analítica',
      criteria: [
        'Prioriza decisión, alcance y no objetivos antes de proponer acciones.',
        'Valida consistencia entre predicciones y pasos.',
        'Asegura que la propuesta siga solo campos funcionales de la fase.',
      ],
    },
  ],
  3: [
    {
      phase: 3,
      key: 'execution-checks',
      title: 'Ejecución segura',
      criteria: [
        'Verifica compilación y hallazgos de auditoría con estado booleano.',
        'Conecta iteraciones con entradas funcionales de la fase.',
      ],
    },
  ],
  4: [
    {
      phase: 4,
      key: 'aar-signals',
      title: 'AAR y registro permanente',
      criteria: [
        'Confronta observación y causa por cada predicción registrada.',
        'Confirma al menos un supuesto propio para cerrar revisión.',
      ],
    },
  ],
};

export const getPhaseInstructionKey = (phase: TaskPhase): InstructionKey => {
  const first = phaseInstructions[phase][0];
  return first?.key ?? 'socratic';
};

