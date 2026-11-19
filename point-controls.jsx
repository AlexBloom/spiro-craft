import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from './components/ui/button.jsx';
import {Slider} from './components/ui/slider.jsx';
import {PrecisionInput} from './precision-input.jsx';
import {connectionCount,MAX_RINGS,MAX_CONNECTIONS} from './point-geometry.mjs';
export function PointControls({value,onChange,summary}){
 const [selected,setSelected]=useState(0),[option,setOption]=useState('count');
 const ringIndex=Math.min(selected,value.rings.length-1),ring=value.rings[ringIndex];
 const patch=values=>onChange({...value,...values});
 const ringPatch=values=>patch({rings:value.rings.map((r,i)=>i===ringIndex?{...r,...values}:r)});
 const ringMode=value.kind==='rings';
 const options=ringMode?[['count','Points'],...(['within','stepped'].includes(value.connection)?[['step','Connect every']]:[]),['diameter','Ring diameter'],['offset','Ring offset'],['outerDiameter','Outer diameter']]:[['count','Points'],...(value.kind==='polygon'?[['step','Connect every']]:[]),['outerDiameter','Outer diameter'],...(value.kind==='star'?[['innerDiameter','Inner diameter'],['ringOffset','Ring offset']]:[])];
 const current=options.some(([key])=>key===option)?option:options[0][0];
 let ringMax=64;
 if(ringMode&&value.connection==='all')while(ringMax>ring.count&&connectionCount({...value,rings:value.rings.map((r,i)=>i===ringIndex?{...r,count:ringMax}:r)})>MAX_CONNECTIONS)ringMax--;
 const config={count:{label:'Point count',min:3,max:ringMode?ringMax:64,step:1},step:{label:'Connect every',min:1,max:ringMode?63:value.count-1,step:1},outerDiameter:{label:'Outer diameter',min:10,max:100,step:1,unit:'%'},innerDiameter:{label:'Inner diameter',min:0,max:value.outerDiameter,step:1,unit:'%'},ringOffset:{label:'Ring offset',min:0,max:360,step:1,unit:'°'},diameter:{label:'Ring diameter',min:1,max:100,step:1,unit:'%'},offset:{label:'Ring offset',min:0,max:360,step:1,unit:'°'}}[current];
 const number=ringMode&&['count','diameter','offset'].includes(current)?ring[current]:value[current];
 const change=number=>{if(ringMode&&['count','diameter','offset'].includes(current))ringPatch({[current]:number});else patch({[current]:number,...(current==='count'?{step:Math.min(value.step,number-1)}:{}),...(current==='outerDiameter'?{innerDiameter:Math.min(value.innerDiameter,number)}:{})});};
 const extra=[...value.rings,{count:12,diameter:Math.max(5,100-value.rings.length*15),offset:0}];
 return <div className="point-controls">
  <label className="point-select-label">Construction<select aria-label="Point construction" value={value.kind} onChange={e=>patch({kind:e.target.value,step:e.target.value==='rings'?value.step:Math.min(value.step,value.count-1)})}><option value="polygon">Polygon / star polygon</option><option value="star">Alternating star</option><option value="rings">Multiple rings</option></select></label>
  {ringMode&&<><div className="ring-toolbar"><label>Ring<select aria-label="Selected ring" value={ringIndex} onChange={e=>setSelected(Number(e.target.value))}>{value.rings.map((r,i)=><option key={i} value={i}>Ring {i+1} · {r.count}</option>)}</select></label><Button variant="ghost" aria-label="Add ring" disabled={value.rings.length>=MAX_RINGS||connectionCount({...value,rings:extra})>MAX_CONNECTIONS} onClick={()=>{patch({rings:extra});setSelected(extra.length-1);}}>+</Button><Button variant="ghost" aria-label="Remove ring" disabled={value.rings.length<=2} onClick={()=>{patch({rings:value.rings.filter((_,i)=>i!==ringIndex)});setSelected(Math.max(0,ringIndex-1));}}>−</Button></div><label className="point-select-label">Connections<select aria-label="Ring connections" value={value.connection} onChange={e=>patch({connection:e.target.value})}>{[['within','Within each ring'],['matching','Matching points'],['stepped','Stepped connections'],['all','All-to-all']].map(([key,label])=><option key={key} value={key} disabled={connectionCount({...value,connection:key})>MAX_CONNECTIONS}>{label}{connectionCount({...value,connection:key})>MAX_CONNECTIONS?' · too dense':''}</option>)}</select></label></>}
  <div className="point-options" aria-label="Point adjustments">{options.map(([key,label])=><Button key={key} variant="ghost" aria-pressed={current===key} onClick={()=>setOption(key)}>{label}</Button>)}</div>
  <div className="control-title"><label>{config.label}</label><PrecisionInput key={value.kind+current+ringIndex} label={config.label} value={number} {...config} onChange={change}/></div>
  <Slider key={value.kind+current+ringIndex} aria-label={config.label} min={config.min} max={config.max} step={config.step} value={[number]} onValueChange={([number])=>change(number)}/>
  <p className="point-summary" role="status">{summary}</p>
  {ringMode&&<p className="point-limit">{connectionCount(value).toLocaleString()} / {MAX_CONNECTIONS.toLocaleString()} connections</p>}
 </div>;
}
export function mountPointControls(){const root=createRoot(document.getElementById('point-controls'));return props=>root.render(<PointControls {...props}/>);}
