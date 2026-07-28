import { gateReasons } from './app/features/tasks/domain/task-rules';

const raw:any = {
  fase:3,
  f3:{
    iteraciones:[{
      id:'it-1',
      intento:'Primer intento',
      resultado:'Observación inicial',
      ajuste:'Ajuste del flujo',
      criterioIds:[],
      methodVersionId:'method-1',
      objective:'Generar salida válida',
      action:'Ejecutar validación',
      tool:'CLI',
      input:'Datos de prueba',
      result:'Salida esperada',
      evidence:[{id:'ev-1',kind:'note',label:'Hallazgo',value:'Evidencia reproducible'}],
      learning:'La validación requiere entradas consistentes',
      nextAdjustment:'Corregir formato de salida',
      applicableConditions:['Misma versión','Entrada estable'],
      success:true,
      successCriteriaResults:[{criterion:'verificacion',passed:true}],
      createdAt:1,
    }],
    checkCompila:true,
    checkAuditado:true,
  }
};

const origSome = Array.prototype.some;
(Array.prototype as any).some = function(cb:any,thisArg?: any) {
  const iteration = this[0];
  const seen: Array<string> = [];
  const wrapped = new Proxy(iteration, {
    get(target, prop, receiver) {
      seen.push(String(prop));
      const value = Reflect.get(target, prop, receiver);
      return value;
    }
  });

  const value = cb.call(thisArg, wrapped, 0, this);
  console.log('callback value:', value);
  console.log('accesses:', seen);
  console.log('wrapped fields snapshot', {
    intento: iteration.intento,
    resultado: iteration.resultado,
    aprendizaje: (iteration as any).learning,
    ajuste: iteration.ajuste,
  });
  return value;
};

console.log(gateReasons(raw));
(Array.prototype as any).some = origSome;
