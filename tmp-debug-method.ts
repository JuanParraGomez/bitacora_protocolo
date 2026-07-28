import { repairTask, canAdvance } from './app/features/tasks/domain/task-rules';
const t = repairTask({
  id:'x',
  fase:3,
  f3:{
    iteraciones:[{id:'it-1',intento:'i',resultado:'r',ajuste:'a',criterioIds:[],methodVersionId:'method-1',objective:'o',action:'ac',tool:'tl',input:'in',result:'rs',evidence:[{id:'ev',kind:'note',label:'l',value:'v'}],learning:'l',nextAdjustment:'n',applicableConditions:['c'],createdAt:1}],
    checkCompila:true,checkAuditado:true,
  },
  methodVersions:[{id:'method-1',version:1,parentVersionId:null,status:'draft',changeKind:'initial',preconditions:['p'],steps:[{id:'s1',title:'t',objective:'o',dependencies:[],inputs:['i'],output:'o',tool:'t',risk:'r',successCriterion:'sc',sourceCriterionId:null}],tools:['t'],inputs:['i'],outputs:['o'],controls:['c'],exceptions:[],exceptionsReviewed:true,successCriteria:['sc'],supportingIterationIds:[],createdAt:1}],
});
console.log(canAdvance(t));
