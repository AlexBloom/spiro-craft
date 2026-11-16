import {createLayerId} from './ids.mjs';
import {defaults,validateDesign} from './geometry.mjs';
import {INKS,inkTextureSvg,BLEND_MODES} from './appearance.mjs';
export const MAX_LAYERS=24;
const freshId=createLayerId;
function validateInkBlend(data={enabled:false,mode:'multiply'}){
 if(!data||typeof data!=='object'||Array.isArray(data)||typeof data.enabled!=='boolean'||!Object.hasOwn(BLEND_MODES,data.mode))throw Error('Invalid ink blend settings.');
 return {enabled:data.enabled,mode:data.mode};
}
function paperSettings(settings=defaults){const {paperGrain,paper,grainAmount}=validateDesign(settings);return {paperGrain,paper,grainAmount};}
export function validateLayerSettings(settings){const {paperGrain,paper,grainAmount,...layer}=validateDesign(settings);return layer;}
export function createProject(settings=defaults){const id=freshId();return {inkBlend:validateInkBlend(),paperSettings:paperSettings(settings),application:'Spiro Craft',version:2,activeLayerId:id,layers:[{id,name:'Layer 1',visible:true,settings:validateLayerSettings(settings)}]};}
export function validateProject(data){
 if(!data||typeof data!=='object')throw Error('Choose a Spiro Craft design file.');
 if(!Object.hasOwn(data,'layers'))return createProject(validateDesign(data));
 if(!Array.isArray(data.layers)||!data.layers.length||data.layers.length>MAX_LAYERS)throw Error('A design must have 1–24 layers.');
 const ids=new Set();
 const layers=data.layers.map((layer,index)=>{
  if(!layer||typeof layer!=='object')throw Error('Invalid layer.');
  const id=typeof layer.id==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(layer.id)?layer.id:freshId();
  if(ids.has(id))throw Error('Duplicate layer ID.');ids.add(id);
  if(layer.visible!==undefined&&typeof layer.visible!=='boolean')throw Error('Invalid layer visibility.');
  return {id,name:typeof layer.name==='string'?layer.name.slice(0,48):`Layer ${index+1}`,visible:layer.visible!==false,settings:validateDesign(layer.settings)};
 });
 const activeLayerId=ids.has(data.activeLayerId)?data.activeLayerId:layers.at(-1).id;
 // Older layered designs stored tooth per layer. Prefer the active textured layer,
 // then the first textured layer, and promote that finish to the whole drawing.
 const active=layers.find(layer=>layer.id===activeLayerId);
 const legacyPaper=(active.settings.paperGrain?active:layers.find(layer=>layer.settings.paperGrain)||active).settings;
 if(data.paperSettings!==undefined&&(!data.paperSettings||typeof data.paperSettings!=='object'||Array.isArray(data.paperSettings)))throw Error('Invalid paper settings.');
 const paper=paperSettings(data.paperSettings===undefined?legacyPaper:data.paperSettings);
 for(const layer of layers)layer.settings=validateLayerSettings(layer.settings);
 return {application:'Spiro Craft',version:2,activeLayerId,paperSettings:paper,inkBlend:validateInkBlend(data.inkBlend),layers};
}
export function activeLayer(project){return project.layers.find(l=>l.id===project.activeLayerId);}
export function addLayer(project,{duplicate=false}={}){
 if(project.layers.length>=MAX_LAYERS)return null;
 const current=activeLayer(project),index=project.layers.indexOf(current),id=freshId();
 let number=1;while(project.layers.some(l=>l.name===`Layer ${number}`))number++;
 const layer={id,name:duplicate?`${current.name} copy`.slice(0,48):`Layer ${number}`,visible:true,settings:duplicate?{...current.settings}:{...validateLayerSettings(defaults),size:Math.max(30,Math.round(current.settings.size*.85)),color:INKS[(INKS.findIndex(ink=>ink.color===current.settings.color)+1)%INKS.length].color}};
 project.layers.splice(index+1,0,layer);project.activeLayerId=id;return layer;
}
export function moveLayer(project,id,direction){const i=project.layers.findIndex(l=>l.id===id),to=i+direction;if(i<0||to<0||to>=project.layers.length)return;[project.layers[i],project.layers[to]]=[project.layers[to],project.layers[i]];}
export function removeLayer(project,id){if(project.layers.length===1)return null;const index=project.layers.findIndex(l=>l.id===id);if(index<0)return null;const [layer]=project.layers.splice(index,1);if(project.activeLayerId===id)project.activeLayerId=project.layers[Math.min(index,project.layers.length-1)].id;return {layer,index};}
export function restoreLayer(project,removed){if(!removed||project.layers.length>=MAX_LAYERS)return false;project.layers.splice(removed.index,0,removed.layer);project.activeLayerId=removed.layer.id;return true;}
export function layerMarkup(layer,result,{active=false,blendMode}={}){
 const s=layer.settings;
 return `<g${blendMode?` style="mix-blend-mode:${blendMode}"`: ''}${layer.visible?'':' display="none"'} opacity="${s.opacity/100}" transform="rotate(${s.rotation})"><path${active?' id="geometry"':''} d="${result.path}" fill="none" stroke="${s.color}" stroke-width="${s.stroke*2}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
export function projectSvg(project,pixels,{transparent=false,generate}={}){
 const texture=inkTextureSvg(project.paperSettings,{prefix:'drawing'});
 const bg=transparent?'':'<rect x="-500" y="-500" width="1000" height="1000" fill="#f8f7f2"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="-500 -500 1000 1000"><title>Spiro Craft — layered drawing</title>${texture?'<defs>'+texture+'</defs>':''}${bg}<g style="isolation:isolate"${texture?' filter="url(#drawing-tooth)"':''}>${project.layers.filter(l=>l.visible).map(l=>layerMarkup(l,generate(l.settings),{blendMode:project.inkBlend?.enabled?project.inkBlend.mode:undefined})).join('')}</g></svg>`;
}
