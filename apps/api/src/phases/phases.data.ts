import { Phase } from '../shared/types';

/**
 * Las 3 fases del asistente. Regla de producto: nunca más de 5 preguntas
 * por fase — si una fase necesita más, hay que dividirla o recortar.
 */
export const PHASES: Phase[] = [
  {
    id: 'problema',
    order: 1,
    title: 'El problema',
    description:
      'Antes de hablar de tecnología, entendamos qué quieres resolver.',
    questions: [
      {
        id: 'problema_texto',
        text: '¿Qué problema quieres resolver?',
        type: 'text',
        hint: 'Una frase es suficiente. Ej.: "Los repartidores pierden tiempo buscando direcciones".',
      },
      {
        id: 'quien',
        text: '¿A quién le pasa este problema?',
        type: 'single',
        options: [
          'A mí mismo',
          'A mi equipo o empresa',
          'A clientes o usuarios finales',
          'A un público amplio',
        ],
      },
      {
        id: 'frecuencia',
        text: '¿Cada cuánto ocurre?',
        type: 'single',
        options: [
          'A diario',
          'Varias veces por semana',
          'Ocasionalmente',
        ],
      },
      {
        id: 'hoy',
        text: '¿Cómo se resuelve hoy?',
        type: 'single',
        options: [
          'No se resuelve',
          'Con procesos manuales',
          'Con herramientas que no encajan',
          'Ya hay software pero falla',
        ],
      },
      {
        id: 'resultado',
        text: '¿Cómo se vería el éxito?',
        type: 'text',
        hint: 'Ej.: "Que cualquier vecino reporte una avería en 1 minuto".',
      },
    ],
  },
  {
    id: 'alcance',
    order: 2,
    title: 'El alcance',
    description: 'Qué forma tendrá la solución y qué es imprescindible.',
    questions: [
      {
        id: 'tipo_producto',
        text: '¿Qué tipo de producto imaginas?',
        type: 'single',
        options: [
          'Aplicación web',
          'Aplicación móvil',
          'Tienda online',
          'Plataforma SaaS',
          'API o automatización',
          'No lo sé todavía',
        ],
      },
      {
        id: 'plataformas',
        text: '¿Dónde lo usará la gente?',
        type: 'single',
        options: ['Navegador web', 'Móvil', 'Ambos'],
      },
      {
        id: 'funciones',
        text: '¿Qué funciones son imprescindibles? (elige solo las necesarias)',
        type: 'multi',
        options: [
          'Usuarios y cuentas',
          'Pagos',
          'Panel de administración',
          'Notificaciones',
          'Chat o tiempo real',
          'IA o análisis de datos',
          'Subir archivos',
          'Integraciones externas',
        ],
      },
      {
        id: 'plazo',
        text: '¿Para cuándo lo necesitas?',
        type: 'single',
        options: ['En semanas', '1-3 meses', 'Más de 3 meses', 'Sin prisa'],
      },
    ],
  },
  {
    id: 'restricciones',
    order: 3,
    title: 'Tus restricciones',
    description:
      'Lo último: con qué recursos cuentas. Esto decide si construir o reutilizar.',
    questions: [
      {
        id: 'experiencia',
        text: '¿Cuánta experiencia técnica tienes?',
        type: 'single',
        options: [
          'Ninguna, no programo',
          'Algo de código',
          'Soy desarrollador/a',
        ],
      },
      {
        id: 'presupuesto',
        text: '¿Qué presupuesto mensual puedes asumir?',
        type: 'single',
        options: [
          'Mínimo (solo herramientas gratis)',
          'Bajo (pago solo lo esencial)',
          'Moderado',
          'Flexible',
        ],
      },
      {
        id: 'equipo',
        text: '¿Quién lo va a construir?',
        type: 'single',
        options: [
          'Solo yo',
          '2-3 personas',
          'Un equipo de desarrollo',
        ],
      },
      {
        id: 'integraciones',
        text: '¿Necesitas conectar con algo existente?',
        type: 'multi',
        optional: true,
        options: [
          'Google (Calendar, Sheets…)',
          'WhatsApp o Telegram',
          'Email',
          'Redes sociales',
          'Otras APIs',
        ],
      },
      {
        id: 'lanzamiento',
        text: '¿Qué ambición tiene la primera versión?',
        type: 'single',
        options: [
          'Prototipo rápido para validar',
          'Producto serio desde el inicio',
          'Escalable desde el día 1',
        ],
      },
    ],
  },
];
