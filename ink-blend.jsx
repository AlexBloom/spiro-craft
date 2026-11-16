import React from 'react';
import {createRoot} from 'react-dom/client';
import {Switch} from './components/ui/switch.jsx';
import {BLEND_MODES} from './appearance.mjs';
export function InkBlend({enabled,mode,onChange,id='ink-blend'}){
 return <div className="ink-blend"><div className="toggle-row"><label htmlFor={id}>Ink blend <span className="paper-scope">All layers</span></label><Switch id={id} aria-label="Ink blend" checked={enabled} onCheckedChange={value=>onChange('enabled',value)}/></div>{enabled&&<label className="blend-mode-label">Blend mode<select value={mode} onChange={e=>onChange('mode',e.target.value)}>{Object.entries(BLEND_MODES).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>}</div>;
}
export function mountInkBlend(){const root=createRoot(document.getElementById('ink-blend-panel'));return props=>root.render(<InkBlend {...props}/>);}
