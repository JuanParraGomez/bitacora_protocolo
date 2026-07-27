# Research: Bitácora de iteraciones guiada

## Decision: conservar las cuatro fases y enriquecer sus datos

**Rationale**: La tarea ya posee orientación, guía, ejecución y revisión, además de reglas de avance y registros compatibles. El protocolo analítico pertenece a la orientación; la guía, las iteraciones y el resumen de mejoras se pueden reforzar en sus fases correspondientes sin añadir navegación ni estados paralelos.

**Alternatives considered**:

- Crear una quinta fase para el análisis: rechazada porque separa una decisión previa de los datos de orientación existentes y aumenta los cambios de migración y de flujo.
- Mantener el protocolo como texto libre en la guía: rechazado porque no hace explícita la decisión de conservar o reformular el problema.

## Decision: modelar criterios como registros estructurados y derivar el resumen final

**Rationale**: La prioridad, estado, impacto, comentario y seguimiento de mejora deben permanecer ligados a un criterio identificable. El bloque final se deriva de los criterios vigentes y conserva solo su confirmación y mejora, por lo que no puede divergir como una segunda lista independiente.

**Alternatives considered**:

- Usar un único texto para todos los criterios: rechazado porque no permite priorizar ni llevar seguimiento individual.
- Duplicar criterios por valor en la fase final: rechazado porque permite inconsistencias entre la guía y el resumen.

## Decision: preservar la posición de lectura al insertar una iteración

**Rationale**: La interfaz actual enlaza únicamente el primer elemento de una colección que el modelo ya permite ampliar. La inserción debe conservar el ancla visible y mover el foco de manera controlada a la nueva tarjeta o su primer campo, respetando preferencias de movimiento reducido; así no se pierde el contexto ni se produce un salto al inicio.

**Alternatives considered**:

- Recargar o volver a montar la vista tras insertar: rechazada porque causa el reinicio de desplazamiento informado.
- No gestionar foco ni visibilidad: rechazada porque la persona puede no localizar la iteración nueva, especialmente con listas largas.

## Decision: generar prompts de etapa desde una única composición de datos vigente

**Rationale**: Los prompts deben reflejar problema vigente, criterios, comentarios y datos de ejecución aplicables. Una composición de dominio por etapa evita omisiones causadas por construir textos de forma independiente en cada componente. Los campos de prompt permanecen editables y se persisten en la tarea existente.

**Alternatives considered**:

- Concatenar campos directamente en cada componente: rechazada por duplicación y riesgo de no incluir todos los criterios.
- Enviar el prompt a un proveedor externo: fuera de alcance; no aporta al guardado local ni respeta la simplicidad operativa del proyecto.

## Decision: probar primero dominio, integración y navegador para los comportamientos observables

**Rationale**: La reparación de tareas y la composición de prompts son deterministas y se cubren con pruebas unitarias. La persistencia y la transición de fases requieren integración. El defecto de desplazamiento y el guardado desde cajitas requieren una prueba de navegador porque dependen del DOM, foco y posición visible.

**Alternatives considered**:

- Probar solo unidades: rechazado porque no detecta saltos de desplazamiento ni etiquetas/campos inaccesibles.
- Probar solo navegador: rechazado porque hace menos diagnósticos los regresos de datos y composición de prompt.
