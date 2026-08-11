import type { Answers, Phase, Plan } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchPhases(): Promise<Phase[]> {
  const res = await fetch(`${API_URL}/phases`);
  if (!res.ok) throw new Error('No se pudieron cargar las fases');
  return res.json() as Promise<Phase[]>;
}

export async function generatePlan(answers: Answers): Promise<Plan> {
  const res = await fetch(`${API_URL}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error('No se pudo generar el plan');
  return res.json() as Promise<Plan>;
}
