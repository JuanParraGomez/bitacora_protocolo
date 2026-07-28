import { gateReasons } from './app/features/tasks/domain/task-rules';
const task:any={
  fase:3,
  f3:{
    iteraciones:[{
      intento:'x',resultado:'x',ajuste:'x',objective:'x',action:'x',tool:'x',input:'x',result:'x',evidence:[{kind:'note',label:'x',value:'x',id:'e'}],learning:'x',nextAdjustment:'x',applicableConditions:['x'],methodVersionId:'x',criterioIds:[],
    }],
    checkCompila:true,
    checkAuditado:true,
  }
};
console.log(gateReasons(task));
