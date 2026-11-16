import React,{useEffect,useRef,useState} from 'react';
import {adjustmentValue} from './precision.mjs';
export function PrecisionInput({label,value,min,max,step=1,unit='',disabled=false,onChange}){
 const cancelBlur=useRef(false);
 const [draft,setDraft]=useState(String(value)),[editing,setEditing]=useState(false);
 useEffect(()=>{if(!editing)setDraft(String(value));},[value,editing]);
 const commit=()=>{if(cancelBlur.current){cancelBlur.current=false;setEditing(false);setDraft(String(value));return;}const next=adjustmentValue(draft,min,max,step);setEditing(false);setDraft(String(next??value));if(next!==null&&next!==value)onChange(next);};
 return <span className="precision-control"><input type="number" inputMode={step<1?'decimal':'numeric'} aria-label={label+' value'} min={min} max={max} step={step} value={draft} disabled={disabled} onFocus={e=>{setEditing(true);e.target.select();}} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cancelBlur.current=true;e.currentTarget.blur();}}}/>{unit&&<span>{unit}</span>}</span>;
}
