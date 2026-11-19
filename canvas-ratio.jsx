import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
function CanvasRatio({p}){
 const [open,setOpen]=useState(null),ref=useRef(null);
 useEffect(()=>{const close=e=>{if(!ref.current?.contains(e.target))setOpen(null);};const escape=e=>{if(e.key==='Escape')setOpen(null);};document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};},[]);
 useEffect(()=>setOpen(null),[p.numerator,p.denominator,p.R,p.r,p.turns,p.fold]);
 const tips=p.pointGeometry?[
  {number:p.numerator,title:p.kind==='rings'?'Rings':'Points',gear:p.numerator,detail:'Separate paths',value:p.components},
  {number:p.denominator,title:p.kind==='rings'?'Connections':p.kind==='star'?'Radii':'Connection step',gear:p.denominator,detail:p.kind==='star'?'Inner diameter':'Construction',value:p.kind==='star'?p.r+'%':p.kind==='rings'?'Across concentric rings':'Connect every '+p.denominator}
 ]:[{number:p.numerator,title:'Fixed gear',gear:p.R,detail:'Repeating lobes',value:p.fold===Infinity?'Circular':p.fold},{number:p.denominator,title:'Rolling gear',gear:p.r,detail:'Revolutions to close',value:p.turns}];
 return <div className="canvas-ratio" ref={ref} aria-label="Pattern ratio" onClick={e=>e.stopPropagation()}>{tips.map((tip,i)=><React.Fragment key={i}>{i>0&&<span className="ratio-divider">:</span>}<span className={'ratio-part'+(open===i?' open':'')}><button aria-label={`${tip.number}: ${tip.title} information`} onKeyDown={e=>{if(e.key==='Escape'){setOpen(null);e.currentTarget.blur();}}} aria-expanded={open===i} aria-describedby={'ratio-tip-'+i} onClick={()=>setOpen(open===i?null:i)}>{tip.number}</button><span className="ratio-tip" id={'ratio-tip-'+i} role="tooltip"><span>{tip.title}<b>{tip.gear}</b></span><span>{tip.detail}<b>{tip.value}</b></span></span></span></React.Fragment>)}</div>;
}
export function mountCanvasRatio(){const root=createRoot(document.getElementById('canvas-ratio'));return p=>root.render(<CanvasRatio p={p}/>);}
