import {mountExportPanel} from './export-panel.jsx';
import {mountMobileEditor} from './mobile-editor.jsx';
import {animateTrace} from './trace.mjs';
import {createProject,validateProject,validateLayerSettings,activeLayer,addLayer,moveLayer,removeLayer,restoreLayer,layerMarkup,projectSvg} from './layers.mjs';
import {mountLayerPanel} from './layers-panel.jsx';
import {INKS,inkTextureSvg} from './appearance.mjs';
import {mountControls} from './controls.jsx';
mountControls();
import {defaults,generate,parameters,validWindings} from './geometry.mjs';
const $=id=>document.getElementById(id);
let project=createProject(),state=activeLayer(project).settings,zoom=1,result,animation,animating=false,toastTimer,removedLayer,rasterBusy=false,exportFormat='svg',exportSize=2400,exportTransparent=true;
const geometryCache=new Map();
function layerResult(layer){const key=JSON.stringify(layer.settings),cached=geometryCache.get(layer.id);if(cached?.key===key)return cached.result;const result=generate(layer.settings);geometryCache.set(layer.id,{key,result});return result;}
const renderLayers=mountLayerPanel(layerAction);
const renderMobile=mountMobileEditor({onChange:mobileChange,onAction:id=>$(id).click(),onLayerAction:layerAction});
const renderExport=mountExportPanel();
function syncMobile(){const exportProps={format:exportFormat,size:exportSize,transparent:exportTransparent,busy:rasterBusy,canExport:project.layers.some(layer=>layer.visible),onChange:exportChange,onExport:exportArtwork,onSave:saveDesign,onLoad:()=>$('load-file').click()};renderExport(exportProps);renderMobile({project,state:{...state,...project.paperSettings},p:result.p,canUndo:Boolean(removedLayer),exportProps});}
function exportChange(key,value){if(key==='format')exportFormat=value;if(key==='size')exportSize=value;if(key==='transparent')exportTransparent=value;syncMobile();}
function mobileChange(key,value){
 if(key==='mode'){document.querySelector(`[data-mode="${value}"]`).click();return;}
 if(key==='fold'){document.querySelector(`[data-fold="${value}"]`).click();return;}
 const id=key==='color'?'custom-color':key;
 const input=$(id);if(input.type==='checkbox')input.checked=value;else input.value=value;
 input.dispatchEvent(new Event(input.type==='range'||input.type==='color'?'input':'change',{bubbles:true}));
}
$('drawing').parentElement.addEventListener('click',()=>document.dispatchEvent(new Event('spiro:dismiss-mobile')));
try{const saved=localStorage.getItem('spiro-craft');if(saved){const data=JSON.parse(saved);const oldInks={'#df633f':'#c92e32','#282e32':'#202124','#537c68':'#167447','#5877ac':'#2356b2','#9a6b9e':'#c92e32'};if(oldInks[data.color])data.color=oldInks[data.color];project=validateProject(data);state=activeLayer(project).settings;}}catch{}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
function stopTrace(){if(animation)animation.cancel();animation=null;animating=false;$('animate').textContent='▷ Trace the pattern';const n=project.layers.filter(l=>l.visible).length;$('pattern-status').textContent=n+' visible '+(n===1?'layer':'layers');}
function update(){
 stopTrace();activeLayer(project).settings=state;result=layerResult(activeLayer(project));const {p,scale}=result;
 const texture=inkTextureSvg(project.paperSettings,{prefix:'drawing'});
 $('ink-texture').innerHTML=texture;
 if(texture)$('layer-art').setAttribute('filter','url(#drawing-tooth)');else $('layer-art').removeAttribute('filter');
 $('layer-art').innerHTML=project.layers.map((layer,i)=>layerMarkup(layer,layerResult(layer),{active:layer.id===project.activeLayerId})).join('');
 renderLayers(project,Boolean(removedLayer));
 $('art').setAttribute('transform',`scale(${zoom})`);
 document.querySelectorAll('[data-mode]').forEach(el=>{const active=el.dataset.mode===state.mode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});
 $('guided-controls').hidden=state.mode!=='guided';$('free-controls').hidden=state.mode!=='free';
 document.querySelectorAll('[data-fold]').forEach(el=>{const active=+el.dataset.fold===state.fold;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});
 $('winding').max=state.fold-1;
 for(const key of ['winding','outer','inner','offset','size','stroke','grainAmount','rotation','opacity']){
  const value=key==='grainAmount'?project.paperSettings.grainAmount:state[key];
  const el=$(key);el.value=value;el.style.setProperty('--progress',`${(value-Number(el.min))/(Number(el.max)-Number(el.min))*100}%`);
  $(key+'-value').textContent=['offset','grainAmount','opacity'].includes(key)?value+'%':key==='size'?value+'%':key==='stroke'?value.toFixed(1)+' pt':key==='rotation'?value+'°':value;
 }
 $('paperGrain').checked=project.paperSettings.paperGrain;$('paper').value=project.paperSettings.paper;$('paper-options').hidden=!project.paperSettings.paperGrain;
 $('curve').value=state.curve;$('guides').checked=state.guides;$('custom-color').value=state.color;
 document.querySelectorAll('[data-color]').forEach(el=>{const active=el.dataset.color===state.color;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});
 $('ratio-r').textContent=p.numerator;$('ratio-s').textContent=p.denominator;$('ratio-track').style.width=`${p.R/(p.R+p.r)*100}%`;
 $('fold-stat').textContent=p.fold===Infinity?'∞':p.fold;$('turn-stat').textContent=p.turns;
 $('fold-label').textContent=p.fold===Infinity?'circular symmetry':'fold symmetry';
 $('fold-copy').textContent=p.fold===Infinity?'A centered pen traces a simple circle.':'Repeating lobes.';
 const visible=project.layers.filter(l=>l.visible),count=visible.reduce((sum,l)=>sum+layerResult(l).count,0);
 $('pattern-status').textContent=visible.length+' visible '+(visible.length===1?'layer':'layers');
 $('animate').disabled=!visible.some(l=>l.settings.opacity>0);
 $('point-count').textContent=count.toLocaleString()+' points';$('design-code').textContent=String(p.numerator).padStart(3,'0')+' / '+String(p.denominator).padStart(3,'0');
 $('drawing').setAttribute('aria-label',`${visible.length} visible layers. Selected: ${p.fold===Infinity?'Circular':p.fold+'-fold'} Spirograph pattern, gear ratio ${p.numerator} to ${p.denominator}`);
 $('explanation').textContent=p.d===0?'A centered pen traces a circle.':`${state.mode==='guided'&&p.fold!==state.fold?state.fold+':'+state.winding+' → ':''}${p.numerator}:${p.denominator}. ${p.fold} lobes, ${p.turns} ${p.turns===1?'turn':'turns'} to close.${state.mode==='guided'&&p.fold!==state.fold?' Shared factors simplify the symmetry.':''}`;
 $('guide-layer').innerHTML=state.guides?`<g fill="none" stroke="#a3a897" stroke-width="1" stroke-dasharray="5 6"><circle r="${p.R*scale}"/><circle cx="0" cy="${-p.base*scale}" r="${p.r*scale}"/><path d="M -500 0 H 500 M 0 -500 V 500" opacity=".4"/><path d="M 0 ${-p.base*scale} V ${-(p.base+p.d)*scale}"/></g><circle cx="0" cy="${-(p.base+p.d)*scale}" r="4" fill="${state.color}"/>`:'';
 $('guide-layer').setAttribute('transform',`rotate(${state.rotation})`);
 syncMobile();
 document.dispatchEvent(new Event('spiro:update'));
 try{localStorage.setItem('spiro-craft',JSON.stringify(project));}catch{}
}
function layerAction(action,value){
 stopTrace();
 if(action==='select')project.activeLayerId=value;
 if(action==='add'||action==='duplicate')addLayer(project,{duplicate:action==='duplicate'});
 if(action==='visibility'){const layer=project.layers.find(l=>l.id===value);layer.visible=!layer.visible;}
 if(action==='rename')activeLayer(project).name=value;
 if(action==='up'||action==='down')moveLayer(project,project.activeLayerId,action==='up'?1:-1);
 if(action==='delete'){removedLayer=removeLayer(project,project.activeLayerId);if(removedLayer)geometryCache.delete(removedLayer.layer.id);}
 if(action==='undo'&&restoreLayer(project,removedLayer))removedLayer=null;
 state=activeLayer(project).settings;update();
}
for(const el of document.querySelectorAll('[data-mode]'))el.addEventListener('click',()=>{
 if(el.dataset.mode==='free'&&state.mode!=='free'){const p=parameters(state);state.outer=p.R;state.inner=Math.min(120,p.r);}
 state.mode=el.dataset.mode;if(state.mode==='free'&&state.curve==='inside')state.inner=Math.min(state.inner,state.outer-1);update();
});
for(const el of document.querySelectorAll('[data-fold]'))el.addEventListener('click',()=>{const proportion=state.winding/state.fold;state.fold=+el.dataset.fold;state.winding=validWindings(state.fold).reduce((a,b)=>Math.abs(b/state.fold-proportion)<Math.abs(a/state.fold-proportion)?b:a);update();});
for(const key of ['winding','outer','inner','offset','size','stroke','grainAmount','rotation','opacity'])$(key).addEventListener('input',e=>{
 let n=Number(e.target.value);
 if(key==='grainAmount')project.paperSettings.grainAmount=n;else state[key]=n;
 if(state.mode==='free'&&state.curve==='inside'&&state.inner>=state.outer){if(key==='inner')state.inner=state.outer-1;else state.inner=state.outer-1;}
 update();
});
$('curve').addEventListener('change',e=>{state.curve=e.target.value;if(state.curve==='inside')state.inner=Math.min(state.inner,state.outer-1);update();});
for(const el of document.querySelectorAll('[data-color]'))el.addEventListener('click',()=>{state.color=el.dataset.color;update();});
$('custom-color').addEventListener('input',e=>{state.color=e.target.value;update();});
$('guides').addEventListener('change',e=>{state.guides=e.target.checked;update();});
$('paperGrain').addEventListener('change',e=>{project.paperSettings.paperGrain=e.target.checked;update();});
$('paper').addEventListener('change',e=>{project.paperSettings.paper=e.target.value;update();});
$('reset').addEventListener('click',()=>{state=validateLayerSettings(defaults);zoom=1;$('zoom-reset').textContent='100%';update();toast('Layer reset.');});
$('randomize').addEventListener('click',()=>{state.stroke=Math.min(state.stroke,2.9);const folds=[6,12,24];state.fold=folds[Math.floor(Math.random()*3)];const choices=validWindings(state.fold);state.winding=choices[Math.floor(Math.random()*choices.length)];state.offset=40+Math.floor(Math.random()*140);if(state.mode==='free'){state.outer=25+Math.floor(Math.random()*216);state.inner=5+Math.floor(Math.random()*Math.min(115,state.outer-5));state.curve=Math.random()>.5?'inside':'outside';}state.color=INKS[Math.floor(Math.random()*INKS.length)].color;update();toast('A little serendipity.');});
function setZoom(n){zoom=Math.max(.5,Math.min(2,n));$('art').setAttribute('transform',`scale(${zoom})`);$('zoom-reset').textContent=Math.round(zoom*100)+'%';}
$('zoom-in').addEventListener('click',()=>setZoom(zoom+.1));$('zoom-out').addEventListener('click',()=>setZoom(zoom-.1));$('zoom-reset').addEventListener('click',()=>setZoom(1));
$('animate').addEventListener('click',()=>{
 if(animating){stopTrace();return;}
 const paths=Array.from($('layer-art').querySelectorAll('path'));
 const visible=project.layers.map((layer,i)=>({layer,path:paths[i],result:layerResult(layer)})).filter(({layer})=>layer.visible&&layer.settings.opacity>0);
 if(!visible.length)return;
 animating=true;$('animate').textContent='Ⅱ Stop tracing';
 animation=animateTrace(visible.map(({path,result})=>({path,points:result.points})),{
  duration:Math.min(30000,Math.max(4500,visible.reduce((n,{result})=>n+result.p.turns,0)*1100)),
  onLayerChange:(index,total)=>{$('pattern-status').textContent=`Tracing layer ${index} of ${total}`;},
  onFinish:stopTrace,
 });
});
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function name(ext){return `spiro-craft-${result.p.numerator}-${result.p.denominator}.${ext}`;}
function svgSource(pixels,transparent=false){return projectSvg(project,pixels,{transparent,generate});}
async function exportArtwork(){
 if(rasterBusy||!project.layers.some(layer=>layer.visible))return;
 const format=exportFormat,pixels=exportSize,filename=name(format);
 if(format==='svg'){download(new Blob([svgSource(1000)],{type:'image/svg+xml'}),filename);toast('Your vector drawing is ready.');return;}
 rasterBusy=true;syncMobile();
 const source=URL.createObjectURL(new Blob([svgSource(pixels,format==='png'&&exportTransparent)],{type:'image/svg+xml'}));
 try{
  const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=source;});
  const canvas=document.createElement('canvas');canvas.width=pixels;canvas.height=pixels;canvas.getContext('2d').drawImage(img,0,0);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,format==='jpg'?'image/jpeg':'image/png',.95));
  if(!blob)throw Error();download(blob,filename);toast(`Your high-resolution ${format.toUpperCase()} is ready.`);
 }catch{toast('Could not export this drawing. Try SVG instead.');}
 finally{URL.revokeObjectURL(source);rasterBusy=false;syncMobile();}
}
function saveDesign(){download(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),name('json'));toast('Design saved. Open it here anytime.');}
$('mobile-randomize').addEventListener('click',()=>$('randomize').click());
$('load-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('This file is too large to be a design.');const loaded=validateProject(JSON.parse(await file.text()));project=loaded;state=activeLayer(project).settings;removedLayer=null;geometryCache.clear();update();toast('Welcome back to your design.');}catch(err){toast(err instanceof SyntaxError?'Choose a valid Spiro Craft JSON file.':err.message);}e.target.value='';});
for(const el of document.querySelectorAll('[data-mini]')){const s={...defaults,fold:+el.dataset.mini,winding:+el.dataset.mini===6?1:5,size:90};const g=generate(s);el.innerHTML=`<path d="${g.path}" transform="scale(.2)"/>`;}
update();
