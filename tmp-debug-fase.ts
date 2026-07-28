import { repairTask, canAdvance } from './app/features/tasks/domain/task-rules';
const t = repairTask({fase:3, f3:{iteraciones:[{intento:'a',resultado:'b',ajuste:'c',methodVersionId:'m',objective:'o',action:'a',tool:'t',input:'i',result:'r',evidence:[{kind:'note'} as any],learning:'l',nextAdjustment:'n',applicableConditions:['a']}],checkCompila:true,checkAuditado:true}});
console.log('fase', t.fase, typeof t.fase);
console.log(canAdvance(t));
