# Tasks: Rediseño visual de Nexus (11 pantallas)

## Alcance

Implementación por bloques a partir de los mockups de alta fidelidad ubicados en:
`/Users/j.parra/Downloads/tareas dificiles/Nexus — Rediseño visual/`

### Referencias de entrada obligatorias

- `01-workspace-fase-uno-chat.png`
- `02-fase-uno-problema-fuentes.png`
- `03-fase-dos-plan-predicciones.png`
- `04-fase-tres-iteraciones.png`
- `05-modal-cerrar-tarea.png`
- `06-biblioteca-referencias.png`
- `07-vista-proyectos.png`
- `08-modal-crear-proyecto.png`
- `09-popover-cuenta-configuracion.png`
- `10-alerta-bloqueo-modal.png`
- `11-propuesta-ia-chat.png`

## Entregables por pantalla

- [ ] T001 Workspace general con fase 1 + chat
  - Criterio: layout de 3 columnas (sidebar, canvas, Nexus AI), botón `+ Nueva tarea`, estado de fase y progreso, bloqueo visual superior opcional, CTA `Evaluar etapa`.
  - Archivo objetivo: componentes de layout y workspace principal.
  - Ruta de validación: `.../Nexus — Rediseño visual/01-workspace-fase-uno-chat.png`

- [ ] T002 Fase 1: problema, mapa de fuentes y adjuntos
  - Criterio: campo `Problema o tarea`, botón `Iterar con IA`, tarjetas de fuentes repetibles con menú contextual discreto y área para adjuntos.
  - Archivo objetivo: componente de fase 1.
  - Ruta de validación: `.../Nexus — Rediseño visual/02-fase-uno-problema-fuentes.png`

- [ ] T003 Fase 2: plan, alcance, pasos, predicciones y recomendaciones
  - Criterio: campos `Resultado o decisión que habilita esta tarea`, `Alcance`, `Fuera de alcance`, lista de pasos ordenable, sección de predicciones con `+ Agregar predicción`, y área de recomendaciones de IA bajo aprobación.
  - Archivo objetivo: componente de fase 2.
  - Ruta de validación: `.../Nexus — Rediseño visual/03-fase-dos-plan-predicciones.png`

- [ ] T004 Fase 3: iteraciones, resultados y propuesta de siguiente iteración
  - Criterio: historial de iteraciones, estado breve por iteración, adjuntos por item y flujo de creación de `+ Nueva iteración` con propuesta aprobable de IA.
  - Archivo objetivo: componente de fase 3.
  - Ruta de validación: `.../Nexus — Rediseño visual/04-fase-tres-iteraciones.png`

- [ ] T005 Modal “Cerrar tarea”
  - Criterio: modal centrado con lista de predicciones (cumplido/no cumplido/sin evidencia), evidencia adjunta y campos de aprendizaje reutilizable; botón de cierre con validaciones de campos faltantes.
  - Archivo objetivo: modal de cierre.
  - Ruta de validación: `.../Nexus — Rediseño visual/05-modal-cerrar-tarea.png`

- [ ] T006 Biblioteca / Referencias
  - Criterio: vista lista o tabla compacta con buscador, columnas de nombre/tipo/fecha/procedencia y menú contextual por fila.
  - Archivo objetivo: pantalla de Biblioteca.
  - Ruta de validación: `.../Nexus — Rediseño visual/06-biblioteca-referencias.png`

- [ ] T007 Vista de Proyectos
  - Criterio: lista compacta + buscador, cantidad de tareas y última actividad, menú por proyecto y acción para entrar sin abrir formularios en sidebar.
- Archivo objetivo: pantalla de proyectos.
  - Ruta de validación: `.../Nexus — Rediseño visual/07-vista-proyectos.png`

- [ ] T008 Modal “Crear proyecto”
  - Criterio: modal centrado con nombre, explicación breve opcional, botones `Cancelar` y `Crear proyecto` y validación mínima de campo requerido.
  - Archivo objetivo: modal de creación.
  - Ruta de validación: `.../Nexus — Rediseño visual/08-modal-crear-proyecto.png`

- [ ] T009 Popover de cuenta y configuración
  - Criterio: popover compacto bajo avatar, opciones de cuenta y ajustes, tamaño pequeño y cierre con click fuera.
  - Archivo objetivo: menú de perfil.
  - Ruta de validación: `.../Nexus — Rediseño visual/09-popover-cuenta-configuracion.png`

- [ ] T010 Alerta de bloqueo y modal explicativo
  - Criterio: banner rojo compacto con `Bloqueo de etapa · Ver más` + `X`, modal con causa, pendientes y acciones.
  - Archivo objetivo: alertas de bloqueo.
  - Ruta de validación: `.../Nexus — Rediseño visual/10-alerta-bloqueo-modal.png`

- [ ] T011 Tarjeta de propuesta de IA dentro del chat
  - Criterio: tarjeta de propuesta dentro de chat con vista previa, botones `Aprobar y aplicar` y `Seguir iterando`, sin autoaplicación.
  - Archivo objetivo: componente de mensaje de IA.
  - Ruta de validación: `.../Nexus — Rediseño visual/11-propuesta-ia-chat.png`

## Orden recomendado de trabajo

1) T001
2) T002
3) T003
4) T004
5) T010 y T011 (componentes de interacción IA)
6) T005
7) T006
8) T007
9) T008
10) T009
