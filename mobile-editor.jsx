import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from './components/ui/button.jsx';
import {Slider} from './components/ui/slider.jsx';
import {Switch} from './components/ui/switch.jsx';
import {ExportPanel} from './export-panel.jsx';
import {LayerPanel} from './layers-panel.jsx';
import {INKS,PAPERS} from './appearance.mjs';
import {defaults} from './geometry.mjs';

const tools=[['geometry','Geometry'],['ink','Ink'],['transform','Transform'],['paper','Paper'],['layers','Layers'],['export','Export']];
const adjustments={
 winding:{label:'Winding',min:1,max:23,step:1},
 outer:{label:'Fixed gear',min:25,max:240,step:1},
 inner:{label:'Rolling gear',min:5,max:120,step:1},
 offset:{label:'Pen offset',min:0,max:220,step:1,unit:'%'},
 stroke:{label:'Line weight',min:.3,max:5,step:.1,unit:' pt'},
 opacity:{label:'Opacity',min:0,max:100,step:1,unit:'%'},
 size:{label:'Drawing size',min:30,max:94,step:1,unit:'%'},
 rotation:{label:'Rotation',min:0,max:360,step:1,unit:'°'},
 grainAmount:{label:'Grain strength',min:0,max:100,step:1,unit:'%'},
};
function ToolIcon({name}){
 const paths={
  geometry:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
  ink:<><path d="m15 3 6 6-10 11-7 1 1-7ZM14 5l5 5M4 21l7-7"/><circle cx="12" cy="13" r="1.5"/></>,
  transform:<><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8Z"/></>,
  paper:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 8 1-1m5 1 1-1m-6 6 1-1m5 1 1-1m-7 6 1-1m5 1 1-1"/></>,
  layers:<><path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
  export:<><path d="M12 16V3m-5 5 5-5 5 5M4 14v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"/></>,
 };
 return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function OptionBar({options,value,onChange}){
 return <div className="mobile-options" aria-label="Tool options">{options.map(([key,label])=><Button key={key} variant="ghost" className={'mobile-option'+(value===key?' active':'')} aria-pressed={value===key} onClick={()=>onChange(key)}>{label}</Button>)}</div>;
}
function Adjustment({setting,state,onChange,disabled=false}){
 const config={...adjustments[setting]};
 if(setting==='winding')config.max=state.fold-1;
 if(setting==='inner'&&state.curve==='inside')config.max=Math.min(config.max,state.outer-1);
 const value=state[setting],display=setting==='stroke'?value.toFixed(1):value;
 return <div className="mobile-adjustment">
  <div className="mobile-adjustment-title"><label htmlFor={'mobile-'+setting}>{config.label}</label><output>{display}{config.unit||''}</output><Button variant="ghost" className="mobile-reset-control" aria-label={'Reset '+config.label.toLowerCase()} title="Reset adjustment" onClick={()=>onChange(setting,defaults[setting])}>↺</Button></div>
  <Slider thumbId={'mobile-'+setting} aria-label={config.label} min={config.min} max={config.max} step={config.step} value={[value]} disabled={disabled} onValueChange={([value])=>onChange(setting,value)}/>
  <div className="mobile-range-labels"><span>{config.min}{config.unit||''}</span><span>{config.max}{config.unit||''}</span></div>
 </div>;
}
function MobileEditor({project,state,p,canUndo,exportProps,onChange,onAction,onLayerAction}){
 const [tool,setTool]=useState(null);
 const [options,setOptions]=useState({geometry:'fold',ink:'color',transform:'size'});
 const triggerRef=useRef(null);
 const active=project.layers.find(layer=>layer.id===project.activeLayerId);
 const close=()=>setTool(null);
 useEffect(()=>{
  const escape=e=>{if(e.key==='Escape'){setTool(null);triggerRef.current?.focus({preventScroll:true});}};
  const resize=()=>document.documentElement.style.setProperty('--editor-viewport',`${window.visualViewport?.height||window.innerHeight}px`);
  document.addEventListener('keydown',escape);
  document.addEventListener('spiro:dismiss-mobile',close);
  window.visualViewport?.addEventListener('resize',resize);window.addEventListener('resize',resize);resize();
  return ()=>{document.removeEventListener('keydown',escape);document.removeEventListener('spiro:dismiss-mobile',close);window.visualViewport?.removeEventListener('resize',resize);window.removeEventListener('resize',resize);};
 },[]);
 const choose=(key)=>setOptions(previous=>({...previous,[tool]:key}));
 const geometryOptions=state.mode==='guided'?[['fold','Symmetry'],['winding','Winding'],['offset','Pen offset'],['guides','Guides']]:[['outer','Fixed gear'],['inner','Rolling gear'],['offset','Pen offset'],['direction','Direction'],['guides','Guides']];
 const selected=tool==='geometry'?(geometryOptions.some(([key])=>key===options.geometry)?options.geometry:geometryOptions[0][0]):options[tool];
 return <div className={'mobile-editor'+(tool?' editing':'')}>
  {tool&&<section id="mobile-tool-panel" className="mobile-tool-panel" role="region" aria-label={tools.find(([key])=>key===tool)[1]+' controls'}>
   <div className="mobile-panel-heading"><div><h2>{tools.find(([key])=>key===tool)[1]}</h2><span><i style={{background:state.color}}/>{active.name||'Untitled layer'}</span></div><Button variant="ghost" className="mobile-done" aria-label="Dismiss controls" onClick={close}>Done <span aria-hidden="true">⌄</span></Button></div>
   {tool==='geometry'&&<>
    <div className="mobile-mode" aria-label="Geometry mode"><Button variant="ghost" aria-pressed={state.mode==='guided'} onClick={()=>onChange('mode','guided')}>Symmetry</Button><Button variant="ghost" aria-pressed={state.mode==='free'} onClick={()=>onChange('mode','free')}>Freeform</Button></div>
    <OptionBar options={geometryOptions} value={selected} onChange={choose}/>
    {selected==='fold'?<div className="mobile-folds">{[[6,'Simple'],[12,'Balanced'],[24,'Intricate']].map(([fold,name])=><Button key={fold} variant="ghost" aria-label={fold+'-fold symmetry'} aria-pressed={state.fold===fold} onClick={()=>onChange('fold',fold)}><b>{fold}</b><span>{name}</span></Button>)}</div>:selected==='guides'?<div className="mobile-paper-toggle"><label htmlFor="mobile-guides">Construction guides</label><Switch id="mobile-guides" checked={state.guides} onCheckedChange={value=>onChange('guides',value)}/></div>:selected==='direction'?<div className="mobile-choice-row"><Button variant="ghost" aria-pressed={state.curve==='inside'} onClick={()=>onChange('curve','inside')}>Inside</Button><Button variant="ghost" aria-pressed={state.curve==='outside'} onClick={()=>onChange('curve','outside')}>Outside</Button></div>:<Adjustment setting={selected} state={state} onChange={onChange}/>}
    <div className="mobile-geometry-foot"><span>{p.numerator}:{p.denominator} <span>·</span> {p.fold===Infinity?'Circular':p.fold+'-fold'} <span>·</span> {p.turns} {p.turns===1?'turn':'turns'}</span><Button variant="ghost" onClick={()=>onAction('reset')}>Reset layer</Button></div>
   </>}
   {tool==='ink'&&<><OptionBar options={[['color','Color'],['stroke','Weight'],['opacity','Opacity']]} value={selected} onChange={choose}/>{selected==='color'?<div className="mobile-colors">{INKS.map(({name,color})=><Button key={color} variant="ghost" aria-label={name+' ink'} aria-pressed={state.color===color} className="mobile-ink-swatch" style={{'--swatch':color}} onClick={()=>onChange('color',color)}/>) }<label className="mobile-custom-color" title="Custom ink">+<input type="color" value={state.color} aria-label="Custom mobile ink color" onChange={e=>onChange('color',e.target.value)}/></label></div>:<Adjustment setting={selected} state={state} onChange={onChange}/>}</>}
   {tool==='transform'&&<><OptionBar options={[['size','Size'],['rotation','Rotate']]} value={selected} onChange={choose}/><Adjustment setting={selected} state={state} onChange={onChange}/></>}
   {tool==='paper'&&<><div className="mobile-paper-toggle"><label htmlFor="mobile-paper-tooth">Paper tooth</label><Switch id="mobile-paper-tooth" checked={state.paperGrain} onCheckedChange={value=>onChange('paperGrain',value)}/></div><div className="mobile-papers">{Object.entries(PAPERS).map(([key,paper])=><Button key={key} variant="ghost" aria-pressed={state.paper===key} onClick={()=>onChange('paper',key)}><b>{paper.name}</b><span>{paper.texture}</span></Button>)}</div><Adjustment setting="grainAmount" state={state} onChange={onChange} disabled={!state.paperGrain}/></>}
   {tool==='layers'&&<LayerPanel project={project} canUndo={canUndo} onAction={onLayerAction} compact/>}
   {tool==='export'&&<ExportPanel {...exportProps}/>}
  </section>}
  <nav className="mobile-tool-bar" aria-label="Editing tools">{tools.map(([key,label])=><Button key={key} id={'mobile-tool-'+key} variant="ghost" className={'mobile-tool'+(tool===key?' active':'')} aria-label={label+' tools'} aria-expanded={tool===key} aria-controls={tool===key?'mobile-tool-panel':undefined} onClick={event=>{triggerRef.current=event.currentTarget;setTool(current=>current===key?null:key);}}><ToolIcon name={key}/><span>{label}</span>{key==='layers'&&project.layers.length>1&&<i className="mobile-layer-badge">{project.layers.length}</i>}</Button>)}</nav>
 </div>;
}
export function mountMobileEditor(callbacks){
 const root=createRoot(document.getElementById('mobile-editor'));
 return props=>root.render(<MobileEditor {...props} {...callbacks}/>);
}
