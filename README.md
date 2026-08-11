# Ruta

De un problema a una solución tecnológica. Una herramienta que guía al usuario
con preguntas simples — **máximo 4-5 preguntas por fase** — y le devuelve un
plan concreto que **reutiliza herramientas y servicios ya existentes** en vez
de reinventar la rueda.

## Estructura

Monorepo con npm workspaces:

- `apps/web` — frontend en **Next.js** (App Router). Asistente por fases.
- `apps/api` — backend en **NestJS**. Sirve las fases/preguntas y genera el plan.

## Desarrollo

```bash
npm install
npm run dev        # api en :3001 y web en :3000
```

Por separado: `npm run dev:api` / `npm run dev:web`.

## Tests y build

```bash
npm test           # tests unitarios del api (jest)
npm run build      # build de api y web
```

## Flujo del producto

1. **Fase 1 — El problema**: qué quieres resolver y para quién (4-5 preguntas).
2. **Fase 2 — Alcance**: tipo de producto, funciones imprescindibles, plazo (4-5 preguntas).
3. **Fase 3 — Restricciones**: presupuesto, experiencia técnica, integraciones (4-5 preguntas).

Con esas respuestas, el backend genera un **plan**: stack recomendado,
servicios existentes a reutilizar (auth, pagos, base de datos, hosting…) y
pasos ordenados para construir el producto.
