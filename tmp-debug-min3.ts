const obj = {
  f3:{
    iteraciones:[{
      intento:'x',resultado:'x',ajuste:'x',objective:'x',action:'x',tool:'x',input:'x',result:'x',evidence:[{kind:'note',label:'x',value:'x',id:'e'}],learning:'x',nextAdjustment:'x',applicableConditions:['x'],methodVersionId:'x',criterioIds:[],
    }],
    checkCompila:true,
    checkAuditado:true,
  }
};

const filled=(v:unknown)=>typeof v==='string'?v.trim().length>0:Boolean(v);
const iteration = (obj as any).f3.iteraciones[0];
console.log([
  filled(iteration.intento),filled(iteration.resultado),filled(iteration.ajuste),filled(iteration.objective),filled(iteration.action),filled(iteration.tool),filled(iteration.input),filled(iteration.result),filled(iteration.learning),filled(iteration.nextAdjustment),Array.isArray(iteration.evidence), iteration.evidence.length>=1, Array.isArray(iteration.criterioIds), Array.isArray(iteration.applicableConditions), iteration.applicableConditions.length>=1, filled(iteration.methodVersionId)
]);
console.log((
  filled(iteration.intento)
        && filled(iteration.resultado)
        && filled(iteration.ajuste)
        && filled(iteration.objective)
        && filled(iteration.action)
        && filled(iteration.tool)
        && filled(iteration.input)
        && filled(iteration.result)
        && filled(iteration.learning)
        && filled(iteration.nextAdjustment)
        && Array.isArray(iteration.evidence)
        && iteration.evidence.length >= 1
        && Array.isArray(iteration.criterioIds)
        && Array.isArray(iteration.applicableConditions)
        && iteration.applicableConditions.length >= 1
        && filled(iteration.methodVersionId))
);
