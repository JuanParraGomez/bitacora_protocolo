export type ReferenceSection = { id: string; heading: string; summary: string; points: string[] };

export const REFERENCE_SECTIONS: ReferenceSection[] = [
  { id: 'orientacion', heading: 'Orientación e insumos', summary: 'Reunir el brief, los datos y las referencias antes de producir.', points: ['Extrae información literal y cita la fuente.', 'No rellenes vacíos con suposiciones de la IA.'] },
  { id: 'guia', heading: 'Guía de comprensión y predicción', summary: 'Trabajar hacia atrás desde la decisión y formular predicciones falsables.', points: ['Define alcance y no-objetivos.', 'Cada predicción necesita un umbral observable.'] },
  { id: 'ejecucion', heading: 'Ejecución e iteración', summary: 'Registrar qué se hizo, qué ocurrió y qué se ajustó.', points: ['Conserva errores y resultados inesperados.', 'Confirma compilación y auditoría antes de avanzar.'] },
  { id: 'revision', heading: 'AAR y registro permanente', summary: 'Confrontar predicción contra realidad y cristalizar el patrón.', points: ['Identifica al menos una suposición propia.', 'Define un cambio procedimental reutilizable.'] },
];

function escapeText(value: string): string {
  return value.replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char);
}

export function renderReferenceText(): string {
  return REFERENCE_SECTIONS.map(section => [
    `## ${escapeText(section.heading)}`,
    escapeText(section.summary),
    ...section.points.map(point => `- ${escapeText(point)}`),
  ].join('\n')).join('\n\n');
}
