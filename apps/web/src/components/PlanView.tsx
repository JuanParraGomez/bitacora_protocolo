'use client';

import type { Plan, StackItem } from '../lib/types';

interface Props {
  plan: Plan;
  onRestart: () => void;
}

function Items({ items }: { items: StackItem[] }) {
  return (
    <>
      {items.map((item) => (
        <div className="item" key={item.area}>
          <span className="area">{item.area}</span>
          <div>
            <strong>{item.recommendation}</strong>
          </div>
          <p className="why">{item.why}</p>
        </div>
      ))}
    </>
  );
}

export default function PlanView({ plan, onRestart }: Props) {
  return (
    <>
      <h1>Tu plan</h1>
      <p className="lead">{plan.summary}</p>

      {plan.warnings.length > 0 && (
        <div className="card">
          <h2>Ojo con esto</h2>
          {plan.warnings.map((w) => (
            <p className="warning" key={w}>
              {w}
            </p>
          ))}
        </div>
      )}

      <div className="card">
        <h2>Base del producto</h2>
        <Items items={plan.stack} />
      </div>

      {plan.reuse.length > 0 && (
        <div className="card">
          <h2>No lo construyas: reutiliza</h2>
          <Items items={plan.reuse} />
        </div>
      )}

      <div className="card">
        <h2>Pasos</h2>
        <ol className="steps">
          {plan.steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p className="detail">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <p style={{ marginTop: '2rem' }}>
        <button onClick={onRestart}>Empezar de nuevo</button>
      </p>
    </>
  );
}
