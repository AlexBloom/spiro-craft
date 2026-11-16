import {MenuTitle} from './menu-title.jsx';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from './components/ui/button.jsx';
export function ExportPanel({format,size,transparent,busy,canExport,onChange,onExport,onSave,onLoad}){
 return <section className="export-panel" aria-label="Export artwork">
  <h2><MenuTitle label="Export"/></h2>
  <div className="export-group" aria-label="File format">{['svg','png','jpg'].map(value=><Button key={value} variant="ghost" aria-pressed={format===value} onClick={()=>onChange('format',value)}>{value.toUpperCase()}</Button>)}</div>
  {format!=='svg'&&<div className="export-group export-sizes" aria-label="Image dimensions">{[1200,2400,4800].map(value=><Button key={value} variant="ghost" aria-pressed={size===value} onClick={()=>onChange('size',value)}>{value}×{value}</Button>)}</div>}
  {format==='png'&&<label className="check-label export-transparency"><input type="checkbox" checked={transparent} onChange={e=>onChange('transparent',e.target.checked)}/>Transparency</label>}
  <Button variant="default" className="button export-download" disabled={!canExport||busy} onClick={onExport}>{busy?'Exporting…':`↓ Export ${format.toUpperCase()}`}</Button>
  <div className="design-actions"><Button variant="ghost" onClick={onSave}>Save design ↗</Button><Button variant="ghost" onClick={onLoad}>Open design ↗</Button></div>
 </section>;
}
export function mountExportPanel(){const root=createRoot(document.getElementById('export-panel'));return props=>root.render(<ExportPanel {...props}/>);}
