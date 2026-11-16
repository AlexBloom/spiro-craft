import React from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from './components/ui/button.jsx';
import {MAX_LAYERS} from './layers.mjs';
export function LayerPanel({project,canUndo,onAction,compact=false}){
  const active=project.layers.find(l=>l.id===project.activeLayerId),index=project.layers.indexOf(active);
  return <section className="layers-panel" aria-label="Layers">
   <div className="section-heading"><h2>{compact?'Pattern layers':'Layers'} <span className="layer-count">{project.layers.length}</span></h2><Button variant="ghost" className="layer-add" disabled={project.layers.length>=MAX_LAYERS} onClick={()=>onAction('add')} aria-label="Add layer">+ Add</Button></div>
   <div className="layer-list" role="list" aria-label="Pattern layers, topmost first">{[...project.layers].reverse().map(layer=><div role="listitem" key={layer.id} className={'layer-row'+(layer.id===active.id?' selected':'')}>
    <Button variant="ghost" className="layer-select" aria-label={'Select '+layer.name} aria-pressed={layer.id===active.id} onClick={()=>onAction('select',layer.id)}><span className="layer-ink" style={{background:layer.settings.color}}/><span>{layer.name||'Untitled'}</span></Button>
    <Button variant="ghost" className="layer-icon" aria-label={(layer.visible?'Hide ':'Show ')+layer.name} title={layer.visible?'Hide layer':'Show layer'} onClick={()=>onAction('visibility',layer.id)}>{layer.visible?'◉':'○'}</Button>
   </div>)}</div>
   <input className="layer-name" aria-label="Layer name" value={active.name} maxLength={48} onChange={e=>onAction('rename',e.target.value)}/>
   <div className="layer-actions"><Button variant="ghost" className="layer-tool" onClick={()=>onAction('duplicate')} disabled={project.layers.length>=MAX_LAYERS}>Duplicate</Button><Button variant="ghost" className="layer-icon" aria-label="Move layer up" title="Move up" disabled={index===project.layers.length-1} onClick={()=>onAction('up')}>↑</Button><Button variant="ghost" className="layer-icon" aria-label="Move layer down" title="Move down" disabled={index===0} onClick={()=>onAction('down')}>↓</Button><Button variant="ghost" className="layer-icon" aria-label="Delete layer" title="Delete layer" disabled={project.layers.length===1} onClick={()=>onAction('delete')}>×</Button></div>
   {canUndo&&<Button variant="ghost" className="layer-undo" onClick={()=>onAction('undo')}>↶ Undo delete</Button>}
  </section>;
}
export function mountLayerPanel(onAction){
 const root=createRoot(document.getElementById('layers-panel'));
 return (project,canUndo)=>root.render(<LayerPanel project={project} canUndo={canUndo} onAction={onAction}/>);
}
