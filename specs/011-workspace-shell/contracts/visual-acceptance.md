# Visual Acceptance Contract: Shell y navegación del workspace

## Alcance

Este contrato normaliza únicamente navegación y header para IMG-UX-01,
IMG-UX-02, IMG-UX-05 e IMG-UX-06. IMG-UX-03/04 aportan reglas responsive. El
lienzo, agente, bloqueo y cierre se inspeccionan solo para detectar solapes o
duplicados; su rediseño pertenece a otras specs.

## Sidebar desktop

1. Regiones en orden: marca, navegación, búsqueda, PROYECTOS, identidad.
2. Navegación vertical: Tareas, Biblioteca, Referencias, Ajustes; cada control
   tiene icono visible, texto y estado activo inequívoco.
3. Buscador: placeholder “Buscar tareas o proyectos…” e indicador visible ⌘K.
4. PROYECTOS: cada proyecto se percibe como carpeta expandible; tareas se
   anidan visual y semánticamente; crear/renombrar siguen disponibles como
   utilidades secundarias.
5. Footer: avatar o iniciales, nombre y correo; sustituye “Aprendizajes
   guardados”.
6. Nueva tarea, Biblioteca y Ajustes no se repiten en el mismo DOM visible.

## Header

1. Breadcrumb textual y semántico: `proyecto / tarea`.
2. Chip verde: `Etapa N de 4` con N del dato existente.
3. Subtítulo: nombre de fase actual, por ejemplo “Orientación y rastreo”.
4. Desktop no repite destinos del sidebar.
5. Nombres largos truncan o envuelven sin cubrir chip, toggle ni contenido.

## Responsive

### Tablet — IMG-UX-03, 1024×768

- Drawer ausente/cerrado en la carga inicial.
- Hamburguesa visible con nombre “Abrir navegación”.
- Abrir mueve foco al cierre; Escape/cerrar/seleccionar devuelve foco al toggle.
- Drawer no cubre permanentemente lienzo/agente/footer ni genera overflow.

### Mobile — IMG-UX-04, 390×844 y 320×667

- Header compacto: hamburguesa, logo Nexus y breadcrumb.
- Panel principal `inert` durante drawer modal.
- No hay dos sidebars ni IDs de formulario duplicados.

## Matriz principal de referencias

| Ref | Estado | Sidebar/header observable | Regla externa de seguridad |
|-----|--------|---------------------------|----------------------------|
| IMG-UX-01 | etapa activa, agente contraído | composición base completa, breadcrumb etapa 1 | una primaria, cero solapes |
| IMG-UX-02 | agente expandido | sidebar mantiene ancho/jerarquía; header estable | agente como columna, no overlay |
| IMG-UX-05 | bloqueo | shell estable; utilidades no compiten con Reevaluar | no cambiar mensajes de bloqueo |
| IMG-UX-06 | completada | chip 4/4, breadcrumb, Biblioteca única | no competir con Volver a tareas |

## Accesibilidad y geometría

- Texto normal ≥4.5:1; componentes y texto grande ≥3:1.
- Estados normal, hover, focus-visible y activo mantienen umbrales.
- Iconos decorativos quedan ocultos al árbol accesible; controles mantienen
  nombre por texto/`aria-label`.
- Sidebar, lienzo, agente, compositor y footer tienen intersección geométrica 0.
- Existe exactamente un `[data-primary-action="true"]` visible por estado.

## Baselines y Capa C

- La baseline es captura ejecutable aprobada/versionada, nunca el mockup.
- Cada actualización requiere flag explícito y aprobación humana del diff.
- `evidence/visual-comparison.md` compara ACTUAL vs IMG-UX-01/02/05/06 por
  navegación/header y clasifica cada delta: `aprobada`, `pendiente`, `defecto`.
