# Research: Formularios y prompts sincronizados por fase

## Decision: conservar el agregado `Task` y sus cuatro objetos de fase

**Rationale**: Los datos de formulario, los prompts guardados y las marcas de personalización ya viven juntos en la tarea y se guardan mediante el mismo flujo. Añadir un servicio, una clave de almacenamiento o una entidad independiente no mejora la interacción solicitada y aumenta el riesgo de que formulario y prompt se desincronicen.

**Alternatives considered**:

- Un almacenamiento separado por prompt: rechazado porque exige coordinación de guardado y compatibilidad adicional.
- Un proveedor externo de generación: rechazado porque el requisito es componer datos locales y la constitución prohíbe dependencias operativas nuevas.

## Decision: distinguir prompt automático y prompt personalizado con la marca persistida existente

**Rationale**: Las fases 2–4 ya almacenan una marca booleana de personalización. La composición se actualizará ante cambios del formulario solo cuando la marca sea falsa. Editar la caja cambia la marca a verdadera; regenerar vuelve a componer el texto y la establece en falsa. La fase 1 recibirá el mismo par de campos por reparación del esquema.

**Alternatives considered**:

- Sobrescribir siempre el textarea: rechazado porque destruye una instrucción editada deliberadamente.
- Añadir confirmaciones antes de cada cambio: rechazado porque rompería la actualización directa que pide la funcionalidad.

## Decision: una función de composición por etapa y observación local del formulario

**Rationale**: `buildPrompt` ya concentra la composición para guía, ejecución y revisión. Se ampliará para orientación y para incluir únicamente el conjunto de campos que corresponde a cada etapa, más el contexto heredado necesario. Cada componente de fase observará los datos que alimentan su prompt y solo escribirá el resultado si no está personalizado. Así se evita que una fase modifique un prompt ajeno.

**Alternatives considered**:

- Un observador profundo único en `TaskWorkspace`: rechazado porque mezclará responsabilidades de las cuatro fases y hace más difícil respetar las exclusiones de cada prompt.
- Componer el prompt dentro de las plantillas: rechazado porque duplica reglas y complica las pruebas de texto seguro.

## Decision: componente reutilizable de distribución de fase, con diseño responsive por CSS

**Rationale**: Los cuatro componentes presentan el mismo patrón conceptual: encabezado, formulario y prompt. Un contenedor o clase reutilizable puede formar dos columnas en escritorio y una sola columna para anchos reducidos sin duplicar media queries. El DOM debe conservar primero el formulario y después el prompt para que el orden de teclado siga el flujo de llenado.

**Alternatives considered**:

- Dos rutas o vistas separadas: rechazado porque impide comparar el formulario y la instrucción al mismo tiempo.
- Forzar dos columnas en todos los tamaños: rechazado porque afecta legibilidad y accesibilidad en móvil o zoom alto.

## Decision: pruebas rojas primero en dominio, persistencia y navegador

**Rationale**: La regla de sincronización y la reparación de tareas son verificables en Vitest; el diseño de dos áreas, el orden de lectura y el guardado requieren Playwright. Las pruebas cubrirán tanto actualización automática como protección de texto manual, incluyendo valores vacíos y caracteres especiales.

**Alternatives considered**:

- Verificación manual exclusiva: rechazada por la política obligatoria de pruebas primero y por el riesgo de regresiones entre fases.
