# Research: Correcciones UX/UI del workspace

## Decision 1: Unificar la creacion sin crear un segundo workflow

**Decision**: Todas las entradas de creacion reutilizan el mismo formulario, validacion y operacion de persistencia. Con una tarea activa se presenta como overlay; sin tareas, la entrada sigue siendo plenamente funcional desde el estado vacio o `/tasks/new`.

**Rationale**: UX-001 y UX-004 nacen de entradas que terminan en comportamientos distintos. El mismo contrato evita divergencia y permite probar idempotencia.

**Alternatives considered**:

- Mantener una pagina informativa en `/tasks/new`: rechazada porque no resuelve el bloqueo.
- Crear un formulario independiente para el home: rechazada porque duplicaria validacion y persistencia.

## Decision 2: Separar navegacion movil mediante drawer

**Decision**: Por debajo de 768 px, la barra lateral se oculta inicialmente y se presenta como drawer modal controlado desde la cabecera. En escritorio puede alternar entre expandida y contraida.

**Rationale**: La captura `23-home-mobile.png` demuestra que sidebar y contenido no caben en el mismo plano. El drawer conserva contexto, foco y una sola columna.

**Alternatives considered**:

- Apilar sidebar completo sobre el contenido: rechazada por longitud, mezcla de controles y perdida de orientacion.
- Eliminar navegacion en movil: rechazada porque bloquearia cambio de tarea y proyecto.

## Decision 3: Mantener regiones con scroll propio y footer fuera del flujo desplazable

**Decision**: El shell define altura util, columnas estables y regiones de scroll explicitas. El footer lateral ocupa una fila propia y no usa superposicion sobre la lista.

**Rationale**: UX-002, UX-008 y UX-010 muestran controles visibles cubiertos o separados de sus formularios.

**Alternatives considered**:

- Corregir solo `z-index`: rechazada porque conservaria geometria y alturas conflictivas.
- Usar un scroll unico para toda la pagina: rechazada porque degrada conversacion, formulario y navegacion persistente.

## Decision 4: Biblioteca contextual y entrada global con responsabilidades claras

**Decision**: Dentro de una tarea, `Biblioteca` abre el slideover sin desmontar el workspace. `/library` funciona como entrada global: muestra recursos si puede y siempre ofrece abrir o volver a una tarea.

**Rationale**: Resuelve UX-005, UX-006 y UX-017 sin duplicar el componente de biblioteca.

**Alternatives considered**:

- Eliminar `/library`: rechazada porque existe navegacion global hacia esa ruta.
- Convertir siempre biblioteca en pagina completa: rechazada porque perderia el contexto de vinculacion con la tarea.

## Decision 5: Deduplicar avisos por operacion

**Decision**: Cada operacion asigna una identidad estable durante su ciclo de vida; publicar nuevamente el mismo exito actualiza o reemplaza el aviso, no agrega otro.

**Rationale**: El limite numerico de avisos no evita UX-013. La deduplicacion debe representar la operacion, no solo el texto.

**Alternatives considered**:

- Reducir el limite global a uno: rechazada porque ocultaria errores simultaneos relevantes.
- Aplicar un temporizador al mensaje: rechazada porque no evita dos avisos iniciales.

## Decision 6: Conservar compatibilidad del legado con validacion explicita

**Decision**: `Directiva cruda` permanece opcional y se etiqueta como tal. Una fila vacia debe completarse o eliminarse antes de agregar otra.

**Rationale**: La auditoria demuestra ambiguedad, no una regla de negocio que obligue la directiva. Hacerla requerida alteraria tareas historicas y el contrato actual.

**Alternatives considered**:

- Hacer obligatoria la directiva: rechazada por falta de evidencia funcional y riesgo de compatibilidad.
- Ignorar el legado: rechazada porque `/legacy` sigue accesible y forma parte del alcance confirmado.

## Decision 7: Accesibilidad y localizacion como contratos verificables

**Decision**: Titulos de documento, nombres accesibles, foco, Escape, retorno de foco, estados live y error 404 en espanol se validan por rol y nombre, no por selectores visuales fragiles.

**Rationale**: UX-014–UX-016 requieren resultados observables y resistentes a cambios de presentacion.

**Alternatives considered**:

- Cubrir estos puntos solo con revision manual: rechazada porque no previene regresiones.
- Comparaciones pixel-perfect: rechazadas como unica fuente porque no demuestran semantica ni operabilidad.

## Decision 8: Evidencia reproducible, no equivalencia pixel-perfect

**Decision**: Las capturas historicas identifican el problema y las pruebas automatizadas reproducen el comportamiento. Las validaciones visuales posteriores usan viewports CSS canonicos y verifican ausencia de solape, clipping y overflow.

**Rationale**: Los archivos tienen extension `.png` pero contenido JPEG, y las dimensiones capturadas difieren de algunos overrides declarados.

**Alternatives considered**:

- Reescribir las evidencias: rechazada porque alteraria el registro de auditoria.
- Exigir igualdad de pixeles: rechazada por diferencias de renderizado y porque no valida interaccion.
