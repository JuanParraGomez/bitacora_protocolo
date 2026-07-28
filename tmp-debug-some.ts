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
(Array.prototype as any).some = function(cb: any,thisArg?: any) {
  if ((this as any).length > 0 && typeof cb === 'function' && (this as any).constructor === Array) {
    let c=0;
    for (const v of this) {
      const res = cb.call(thisArg,v,c,this);
      console.log('some item', c, res, v.id, v.methodVersionId, v.nextAdjustment);
      if (res) return true;
      c++;
    }
    return false;
  }
  return (origSome as any).call(this, cb, thisArg);
};

console.log(gateReasons(raw));
(Array.prototype as any).some = origSome;
