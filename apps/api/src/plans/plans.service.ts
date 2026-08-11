import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Answers,
  Plan,
  PlanStep,
  StackItem,
} from '../shared/types';

function asList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asText(value: string | string[] | undefined): string {
  return asList(value).join(' ').trim();
}

/**
 * Genera un plan a partir de las respuestas del asistente.
 *
 * Motor basado en reglas deterministas: cada regla mira 1-2 respuestas y
 * propone reutilizar servicios existentes en vez de construir desde cero.
 * Punto de extensión futuro: sustituir/complementar estas reglas con una
 * llamada a un LLM, manteniendo esta misma interfaz.
 */
@Injectable()
export class PlansService {
  generate(answers: Answers): Plan {
    const problema = asText(answers['problema_texto']);
    if (!problema) {
      throw new BadRequestException(
        'Faltan respuestas: al menos "problema_texto" es obligatorio.',
      );
    }

    const funciones = asList(answers['funciones']);
    const tipo = asText(answers['tipo_producto']);
    const plataformas = asText(answers['plataformas']);
    const plazo = asText(answers['plazo']);
    const experiencia = asText(answers['experiencia']);
    const presupuesto = asText(answers['presupuesto']);
    const lanzamiento = asText(answers['lanzamiento']);

    const noCode = experiencia.startsWith('Ninguna');
    const gratis = presupuesto.startsWith('Mínimo');

    const stack: StackItem[] = [];
    const reuse: StackItem[] = [];
    const warnings: string[] = [];

    // --- Base del producto -------------------------------------------------
    if (tipo === 'Tienda online') {
      stack.push({
        area: 'Producto',
        recommendation: noCode ? 'Shopify' : 'Medusa (open source) o Shopify',
        why: 'Una tienda ya resuelta (catálogo, carrito, pagos, envíos) te ahorra meses de trabajo.',
      });
    } else if (tipo === 'Aplicación móvil' || plataformas === 'Móvil') {
      stack.push({
        area: 'Producto',
        recommendation: noCode
          ? 'FlutterFlow o Glide (no-code)'
          : 'Expo (React Native)',
        why: 'Una sola base de código para iOS y Android; publicar en ambas tiendas desde el primer día.',
      });
    } else {
      stack.push({
        area: 'Producto',
        recommendation: noCode
          ? 'Webflow, Framer o Bubble (no-code)'
          : 'Next.js + NestJS (este mismo monorepo sirve de base)',
        why: noCode
          ? 'Sin experiencia técnica, un builder visual te da un prototipo real en días.'
          : 'Stack estándar, enorme ecosistema y despliegue sencillo.',
      });
    }

    // --- Datos ---------------------------------------------------------------
    if (noCode || gratis) {
      reuse.push({
        area: 'Base de datos',
        recommendation: 'Supabase (plan gratuito)',
        why: 'Postgres gestionado con auth y APIs incluidas; gratis hasta volúmenes reales.',
      });
    } else {
      reuse.push({
        area: 'Base de datos',
        recommendation: 'PostgreSQL + Prisma',
        why: 'La opción aburrida y fiable: cualquier desarrollador la conoce y migra bien.',
      });
    }

    // --- Funciones imprescindibles → servicios existentes ---------------------
    const featureRules: Array<{
      match: string;
      item: StackItem;
    }> = [
      {
        match: 'Usuarios y cuentas',
        item: {
          area: 'Autenticación',
          recommendation: noCode ? 'Clerk' : 'Clerk o Auth.js',
          why: 'Login seguro (contraseñas, magic links, OAuth) sin escribir ni una línea de auth.',
        },
      },
      {
        match: 'Pagos',
        item: {
          area: 'Pagos',
          recommendation: 'Stripe',
          why: 'Cobros, suscripciones y facturación resueltos y con cumplimiento PCI incluido.',
        },
      },
      {
        match: 'Panel de administración',
        item: {
          area: 'Administración',
          recommendation: 'Refine (React) o el admin de Supabase',
          why: 'Un CRUD de gestión generado encima de tus datos, sin construirlo a mano.',
        },
      },
      {
        match: 'Notificaciones',
        item: {
          area: 'Notificaciones',
          recommendation: 'Resend (email) + Novu (multicanal)',
          why: 'Envío de email/push con plantillas y entregabilidad ya resueltas.',
        },
      },
      {
        match: 'Chat o tiempo real',
        item: {
          area: 'Tiempo real',
          recommendation: 'Supabase Realtime o Pusher',
          why: 'WebSockets gestionados; no montes tu propio servidor de sockets.',
        },
      },
      {
        match: 'IA o análisis de datos',
        item: {
          area: 'IA',
          recommendation: 'API de OpenAI/Anthropic + Vercel AI SDK',
          why: 'Acceso a modelos de primer nivel por uso, sin infraestructura propia.',
        },
      },
      {
        match: 'Subir archivos',
        item: {
          area: 'Archivos',
          recommendation: 'UploadThing o S3 + CloudFront',
          why: 'Subidas, almacenamiento y CDN sin gestionar servidores de ficheros.',
        },
      },
      {
        match: 'Integraciones externas',
        item: {
          area: 'Integraciones',
          recommendation: 'Zapier o Make (y APIs directas cuando crezcan)',
          why: 'Conecta con cientos de servicios sin escribir conectores propios.',
        },
      },
    ];
    for (const rule of featureRules) {
      if (funciones.includes(rule.match)) reuse.push(rule.item);
    }

    // --- Hosting ---------------------------------------------------------------
    stack.push({
      area: 'Despliegue',
      recommendation: gratis
        ? 'Vercel + planes gratuitos de Supabase/Render'
        : 'Vercel (web) + Railway o Render (api)',
      why: 'Despliegue con git push y HTTPS incluido; sin administrar servidores.',
    });

    // --- Avisos ------------------------------------------------------------------
    if (plazo === 'En semanas' && funciones.length >= 4) {
      warnings.push(
        `Plazo de semanas con ${funciones.length} funciones imprescindibles: recorta a 1-2 para la primera versión o el plazo no es realista.`,
      );
    }
    if (lanzamiento === 'Escalable desde el día 1' && experiencia !== 'Soy desarrollador/a') {
      warnings.push(
        'Escalar desde el día 1 sin experiencia técnica suele traducirse en sobrecoste: valida primero con un prototipo simple.',
      );
    }
    if (tipo === 'No lo sé todavía') {
      warnings.push(
        'Aún no tienes claro el formato: empieza por una landing + formulario para validar la demanda antes de construir nada.',
      );
    }

    // --- Pasos -------------------------------------------------------------------
    const steps: PlanStep[] = [
      {
        title: 'Valida el problema (semana 1)',
        detail:
          'Habla con 5-10 personas que sufran el problema y confirma que pagarían o cambiarían su rutina por tu solución.',
      },
      {
        title: 'Define el MVP más pequeño',
        detail:
          'Elige UNA función imprescindible. Todo lo demás queda en la lista de "después".',
      },
      {
        title: 'Monta la base reutilizando',
        detail: `Configura ${reuse[0]?.recommendation ?? 'los servicios recomendados'} y la base del producto. Nada de código propio aquí.`,
      },
      {
        title: 'Construye solo lo que te diferencia',
        detail:
          'El código que escribas debe ser exclusivamente la lógica de tu problema; el resto ya lo dan los servicios de arriba.',
      },
      {
        title: 'Lanza a un grupo pequeño e itera',
        detail:
          'Enséñaselo a los usuarios de la fase de validación, mide si se resuelve el problema y ajusta.',
      },
    ];

    const resultado = asText(answers['resultado']);
    const summary =
      `Problema: ${problema}. ` +
      (resultado ? `Éxito esperado: ${resultado}. ` : '') +
      `Recomendación: ${stack[0]?.recommendation ?? ''} apoyándote en servicios existentes para no construir de más.`;

    return { summary, stack, reuse, steps, warnings };
  }
}
