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
    const item = this[0];
    console.log('callback source:', cb.toString());
    console.log('callback(this)', cb.call(thisArg ?? null, item, 0, this));
    console.log('manual cond', (item.intento.trim().length>0
      && item.resultado.trim().length>0
      && item.ajuste.trim().length>0
      && item.objective.trim().length>0
      && item.action.trim().length>0
      && item.tool.trim().length>0
      && item.input.trim().length>0
      && item.result.trim().length>0
      && item.learning.trim().length>0
      && item.nextAdjustment.trim().length>0
      && Array.isArray(item.evidence)
      && item.evidence.length>=1
      && Array.isArray(item.criterioIds)
      && Array.isArray(item.applicableConditions)
      && item.applicableConditions.length>=1
      && !!item.methodVersionId
    ));
    return cb.call(thisArg,item,0,this);
  }
  return (origSome as any).call(this, cb, thisArg);
};

console.log(gateReasons(raw));
(Array.prototype as any).some = origSome;
