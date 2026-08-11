'use client';

import { useState } from 'react';
import type { Answers, Phase, Question } from '../lib/types';

interface Props {
  phases: Phase[];
  submitting: boolean;
  onComplete: (answers: Answers) => void;
}

function isAnswered(question: Question, answers: Answers): boolean {
  if (question.optional) return true;
  const value = answers[question.id];
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' && value.trim().length > 0;
}

export default function PhaseWizard({ phases, submitting, onComplete }: Props) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const phase = sorted[index];
  const isLast = index === sorted.length - 1;
  const canContinue = phase.questions.every((q) => isAnswered(q, answers));

  function setSingle(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [id]: next };
    });
  }

  function next() {
    if (isLast) onComplete(answers);
    else setIndex((i) => i + 1);
  }

  return (
    <>
      <div className="progress" aria-label="Progreso">
        {sorted.map((p, i) => (
          <span key={p.id} className={i <= index ? 'active' : ''} />
        ))}
      </div>

      <h1>
        Fase {phase.order}: {phase.title}
      </h1>
      <p className="lead">{phase.description}</p>

      <div className="card">
        {phase.questions.map((q) => (
          <div className="question" key={q.id}>
            <p>
              {q.text}
              {q.optional ? ' (opcional)' : ''}
            </p>
            {q.hint && <p className="hint">{q.hint}</p>}

            {q.type === 'text' && (
              <textarea
                value={(answers[q.id] as string) ?? ''}
                onChange={(e) => setSingle(q.id, e.target.value)}
                placeholder="Escribe aquí…"
              />
            )}

            {q.type === 'single' &&
              q.options?.map((option) => (
                <label className="option" key={option}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === option}
                    onChange={() => setSingle(q.id, option)}
                  />
                  {option}
                </label>
              ))}

            {q.type === 'multi' &&
              q.options?.map((option) => (
                <label className="option" key={option}>
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(answers[q.id]) &&
                      (answers[q.id] as string[]).includes(option)
                    }
                    onChange={() => toggleMulti(q.id, option)}
                  />
                  {option}
                </label>
              ))}
          </div>
        ))}

        <div className="actions">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || submitting}
          >
            Atrás
          </button>
          <button
            className="primary"
            onClick={next}
            disabled={!canContinue || submitting}
          >
            {submitting
              ? 'Generando…'
              : isLast
                ? 'Generar mi plan'
                : 'Siguiente fase'}
          </button>
        </div>
      </div>
    </>
  );
}
