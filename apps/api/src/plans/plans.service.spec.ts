import { BadRequestException } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Answers } from '../shared/types';

describe('PlansService', () => {
  let service: PlansService;

  beforeEach(() => {
    service = new PlansService();
  });

  const baseAnswers: Answers = {
    problema_texto: 'Los vecinos no se enteran de las averías del edificio',
    quien: 'A clientes o usuarios finales',
    frecuencia: 'A diario',
    hoy: 'Con procesos manuales',
    resultado: 'Todos informados en menos de 5 minutos',
    tipo_producto: 'Aplicación web',
    plataformas: 'Navegador web',
    funciones: ['Usuarios y cuentas', 'Notificaciones'],
    plazo: '1-3 meses',
    experiencia: 'Algo de código',
    presupuesto: 'Bajo (pago solo lo esencial)',
    equipo: 'Solo yo',
    integraciones: ['Email'],
    lanzamiento: 'Prototipo rápido para validar',
  };

  it('rechaza respuestas vacías o ausentes', () => {
    expect(() => service.generate({})).toThrow(BadRequestException);
    expect(() => service.generate({ problema_texto: '' })).toThrow(
      BadRequestException,
    );
  });

  it('incluye el problema del usuario en el resumen', () => {
    const plan = service.generate(baseAnswers);
    expect(plan.summary).toContain('averías del edificio');
  });

  it('recomienda Stripe cuando se piden pagos', () => {
    const plan = service.generate({
      ...baseAnswers,
      funciones: [...(baseAnswers.funciones as string[]), 'Pagos'],
    });
    const all = [...plan.stack, ...plan.reuse].map((i) => i.recommendation);
    expect(all.some((r) => r.includes('Stripe'))).toBe(true);
  });

  it('recomienda una tienda gestionada para ecommerce', () => {
    const plan = service.generate({
      ...baseAnswers,
      tipo_producto: 'Tienda online',
    });
    const all = plan.stack.map((i) => i.recommendation);
    expect(
      all.some((r) => r.includes('Shopify') || r.includes('Medusa')),
    ).toBe(true);
  });

  it('recomienda auth gestionada en vez de construirla desde cero', () => {
    const plan = service.generate(baseAnswers);
    const all = plan.reuse.map((i) => i.recommendation);
    expect(all.some((r) => r.includes('Clerk') || r.includes('Auth.js'))).toBe(
      true,
    );
  });

  it('avisa cuando el plazo es corto y el alcance grande', () => {
    const plan = service.generate({
      ...baseAnswers,
      plazo: 'En semanas',
      funciones: [
        'Usuarios y cuentas',
        'Pagos',
        'Notificaciones',
        'Chat o tiempo real',
        'IA o análisis de datos',
      ],
    });
    expect(plan.warnings.length).toBeGreaterThan(0);
  });

  it('propone pasos ordenados que empiezan por validar', () => {
    const plan = service.generate(baseAnswers);
    expect(plan.steps.length).toBeGreaterThanOrEqual(4);
    expect(plan.steps[0].title.toLowerCase()).toContain('valid');
  });
});
