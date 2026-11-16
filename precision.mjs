export function adjustmentValue(value,min,max,step){
 if(String(value).trim()==='')return null;
 const number=Number(value);
 if(!Number.isFinite(number))return null;
 return Number(Math.max(min,Math.min(max,min+Math.round((number-min)/step)*step)).toFixed(6));
}
