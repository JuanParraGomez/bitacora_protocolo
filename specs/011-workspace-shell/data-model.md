# Data Model: Shell y navegación del workspace

Esta feature no añade tablas, claves de almacenamiento, contratos de backend ni
migraciones. Las entidades persistentes `Project`, `Task`, índices y estado de
presentación conservan sus modelos actuales.

## View models de presentación

### WorkspaceNavigationItem

- `id`: `tasks | library | references | settings`
- `label`: texto visible y nombre accesible
- `icon`: nombre cerrado del SVG local
- `destination`: ruta existente o evento existente
- `active`: estado derivado del contexto actual
- `disabled`: estado existente de disponibilidad, cuando aplica

No se persiste. El orden canónico es Tareas, Biblioteca, Referencias, Ajustes.

### WorkspaceUserIdentity

- `name`: texto no vacío
- `email`: texto visible con forma de correo
- `avatarUrl`: URL opcional ya disponible; no se obtiene ni persiste aquí
- `initials`: fallback visible de una o dos letras

No se persiste. Si no existe identidad real, se usa un fallback local no
personal y explícito; nunca se fabrica una persona real.

### WorkspaceHeaderContext

- `projectName`: nombre del proyecto actual
- `taskName`: nombre de la tarea actual o fallback existente
- `phase`: entero existente 1–4
- `phaseTitle`: nombre existente de la fase
- `compactNavigation`: indica tablet/móvil
- `sidebarCollapsed`: indica desktop contraído

Derivado de props existentes; no cambia dominio.

### WorkspaceViewportMode

- `desktop`: ancho mayor a 1024px
- `tablet`: ancho entre 768px y 1024px, drawer cerrado inicialmente
- `mobile`: ancho menor o igual a 767px, header compacto

El alto no cambia el modo; los viewports contractuales fijan además 900, 768,
844 y 667px para verificación visual.

## Transiciones observables

```text
desktop visible ── contraer ──> desktop contraído
desktop contraído ── expandir ──> desktop visible
tablet/móvil cerrado ── hamburguesa ──> drawer abierto
drawer abierto ── Escape/cerrar/seleccionar ──> drawer cerrado + foco al toggle
proyecto cerrado ── activar ──> proyecto expandido
proyecto expandido ── activar ──> proyecto cerrado
búsqueda con coincidencia ──> grupos coincidentes expandidos temporalmente
```

## Invariantes

- Ninguna transición cambia rutas, IDs de dominio o datos persistidos salvo las
  operaciones ya existentes de selección/crear/renombrar.
- Solo una instancia navegable del sidebar existe por breakpoint.
- Nueva tarea, Biblioteca y Ajustes aparecen una vez por contexto.
- El panel principal queda `inert` mientras el drawer móvil modal está abierto.
