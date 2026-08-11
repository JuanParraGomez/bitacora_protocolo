/**
 * Duplicado de apps/api/src/shared/types.ts (ver nota allí).
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
