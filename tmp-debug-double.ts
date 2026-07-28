import { repairTask, canAdvance } from './app/features/tasks/domain/task-rules';

const raw = {
  fase:3,
  f3:{
    iteraciones:[{id:'it-1',intento:'a',resultado:'b',ajuste:'c',criterioIds:[],methodVersionId:'method-1',objective:'o',action:'ac',tool:'t',input:'i',result:'r',evidence:[{id:'ev-1',kind:'note',label:'l',value:'v'}],learning:'l',nextAdjustment:'n',applicableConditions:['c'],success:true,successCriteriaResults:[{criterion:'x',passed:true}],createdAt:1}],
    checkCompila:true,
    checkAuditado:true,
  },
};

const first = repairTask(raw as any);
const second = repairTask(first);
console.log('first', JSON.stringify(first.f3.iteraciones[0], null, 2));
console.log('second', JSON.stringify(second.f3.iteraciones[0], null, 2));
console.log('equal', JSON.stringify(first.f3.iteraciones[0])===JSON.stringify(second.f3.iteraciones[0]));
console.log('advance first', canAdvance(first));
console.log('advance second', canAdvance(second));
