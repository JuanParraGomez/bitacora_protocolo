'use client';

import { useEffect, useState } from 'react';
import { fetchPhases, generatePlan } from '../../lib/api';
import type { Answers, Phase, Plan } from '../../lib/types';
import PhaseWizard from '../../components/PhaseWizard';
import PlanView from '../../components/PlanView';

export default function WizardPage() {
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPhases()
      .then(setPhases)
      .catch(() =>
        setError(
          'No se pudo conectar con la API. ¿Está arrancada? (npm run dev:api)',
        ),
      );
  }, []);

  async function handleComplete(answers: Answers) {
    setSubmitting(true);
    setError(null);
    try {
      setPlan(await generatePlan(answers));
    } catch {
      setError('No se pudo generar el plan. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <>
        <h1>Ruta</h1>
        <p className="error">{error}</p>
      </>
    );
  }

  if (plan) {
    return <PlanView plan={plan} onRestart={() => setPlan(null)} />;
  }

  if (!phases) {
    return (
      <>
        <h1>Ruta</h1>
        <p className="lead">Cargando…</p>
      </>
    );
  }

  return (
    <PhaseWizard
      phases={phases}
      submitting={submitting}
      onComplete={handleComplete}
    />
  );
}
