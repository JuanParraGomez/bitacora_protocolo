/**
 * Contratos compartidos entre api y web.
 * Se mantienen duplicados en apps/web/src/lib/types.ts para no añadir
 * un paquete compartido todavía. Si crecen, extraer a packages/contracts.
 */

export type QuestionType = 'text' | 'single' | 'multi';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  hint?: string;
  options?: string[];
  optional?: boolean;
}

export interface Phase {
  id: string;
  order: number;
  title: string;
  description: string;
  questions: Question[];
}

/** questionId -> respuesta (texto libre, opción única o varias opciones) */
export type Answers = Record<string, string | string[]>;

export interface StackItem {
  area: string;
  recommendation: string;
  why: string;
}

export interface PlanStep {
  title: string;
  detail: string;
}

export interface Plan {
  summary: string;
  stack: StackItem[];
  reuse: StackItem[];
  steps: PlanStep[];
  warnings: string[];
}
