import Link from 'next/link';

export default function Home() {
  return (
    <>
      <h1>De un problema a una solución tecnológica</h1>
      <p className="lead">
        Cuéntanos qué quieres resolver. Te haremos pocas preguntas simples —
        nunca más de 4-5 por fase — y te devolveremos un plan concreto que
        reutiliza herramientas que ya existen, en lugar de construirlo todo
        desde cero.
      </p>
      <div className="card">
        <h2>Cómo funciona</h2>
        <p>
          <strong>1. El problema</strong> — qué quieres resolver y para quién.
        </p>
        <p>
          <strong>2. El alcance</strong> — qué forma tiene la solución y qué es
          imprescindible.
        </p>
        <p>
          <strong>3. Tus restricciones</strong> — tiempo, presupuesto y
          experiencia.
        </p>
        <p className="hint">
          Con eso generamos tu plan: stack recomendado, servicios a reutilizar
          y pasos ordenados.
        </p>
      </div>
      <p style={{ marginTop: '2rem' }}>
        <Link className="button primary" href="/wizard">
          Empezar
        </Link>
      </p>
    </>
  );
}
