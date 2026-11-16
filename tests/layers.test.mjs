import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,generate} from '../geometry.mjs';
import {MAX_LAYERS,createProject,validateProject,activeLayer,addLayer,moveLayer,removeLayer,restoreLayer,projectSvg} from '../layers.mjs';
test('legacy designs upgrade to a one-layer project and new projects round trip',()=>{const p=validateProject({...defaults,stroke:4});assert.equal(p.layers.length,1);assert.equal(activeLayer(p).settings.stroke,4);addLayer(p);p.layers[0].visible=false;activeLayer(p).settings.rotation=60;activeLayer(p).settings.opacity=30;assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);});
test('new and duplicated layers edit independently without losing the original',()=>{const p=createProject({...defaults,paperGrain:true,rotation:27,opacity:65});const original=activeLayer(p);const second=addLayer(p);assert.notEqual(original.settings.color,second.settings.color);assert.ok(second.settings.size<original.settings.size);const clone=addLayer(p,{duplicate:true});clone.settings.offset=120;assert.notEqual(second.settings.offset,clone.settings.offset);assert.equal(original.settings.rotation,27);assert.equal(original.settings.opacity,65);});
test('layer stacking, deletion, undo, and minimum one layer behave predictably',()=>{const p=createProject();const bottom=activeLayer(p);const top=addLayer(p);moveLayer(p,top.id,-1);assert.equal(p.layers[0].id,top.id);moveLayer(p,top.id,-1);assert.equal(p.layers[0].id,top.id);const removed=removeLayer(p,top.id);assert.equal(p.activeLayerId,bottom.id);assert.equal(removeLayer(p,bottom.id),null);assert.ok(restoreLayer(p,removed));assert.equal(p.activeLayerId,top.id);assert.equal(p.layers[0].id,top.id);});
test('exports include visible layers in draw order, with shared drawing tooth and independent transformations',()=>{const p=createProject({...defaults,paperGrain:true,rotation:30,opacity:45});const bottom=activeLayer(p);const top=addLayer(p);let svg=projectSvg(p,2400,{transparent:true,generate});assert.equal((svg.match(/<path/g)||[]).length,2);assert.ok(svg.indexOf(bottom.settings.color)<svg.indexOf(top.settings.color));assert.match(svg,/opacity="0.45" transform="rotate\(30\)"/);assert.equal((svg.match(/<filter/g)||[]).length,1);assert.match(svg,/<g filter="url\(#drawing-tooth\)"><g opacity="0.45" transform="rotate\(30\)"/);assert.doesNotMatch(svg,/<path[^>]*filter=/);assert.doesNotMatch(svg,/<rect/);bottom.visible=false;svg=projectSvg(p,2400,{generate});assert.equal((svg.match(/<path/g)||[]).length,1);assert.ok(!svg.includes(bottom.settings.color));assert.match(svg,/feTurbulence/);p.paperSettings.paperGrain=false;assert.doesNotMatch(projectSvg(p,2400,{generate}),/feTurbulence|filter=/);});
test('layer limits and malformed projects are rejected without damaging a valid project',()=>{const p=createProject();while(p.layers.length<MAX_LAYERS)addLayer(p);assert.equal(addLayer(p),null);assert.equal(p.layers.length,MAX_LAYERS);for(const data of [{layers:[]},{layers:'bad'},{layers:[null]},{layers:[{settings:{...defaults,opacity:101}}]},{layers:[{settings:{...defaults,rotation:361}}]},{layers:[{id:'same',settings:defaults},{id:'same',settings:defaults}]}])assert.throws(()=>validateProject(data));});

test('paper finish belongs to the drawing and survives layer changes and saved-design round trips',()=>{
 const p=createProject({...defaults,paperGrain:true,paper:'rough',grainAmount:80});
 const paper={...p.paperSettings};const added=addLayer(p);addLayer(p,{duplicate:true});
 assert.deepEqual(p.paperSettings,paper);
 for(const layer of p.layers)for(const key of ['paperGrain','paper','grainAmount'])assert.equal(Object.hasOwn(layer.settings,key),false);
 removeLayer(p,added.id);assert.deepEqual(p.paperSettings,paper);
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
});
test('legacy per-layer finishes migrate to one shared finish with explicit global settings taking precedence',()=>{
 const a={id:'a',name:'A',settings:{...defaults,paperGrain:true,paper:'rough',grainAmount:80}};
 const b={id:'b',name:'B',settings:{...defaults,paperGrain:true,paper:'hot-press',grainAmount:25}};
 const legacy={activeLayerId:'b',layers:[a,b]};
 assert.deepEqual(validateProject(legacy).paperSettings,{paperGrain:true,paper:'hot-press',grainAmount:25});
 b.settings.paperGrain=false;
 assert.equal(validateProject(legacy).paperSettings.paper,'rough');
 const global={paperGrain:false,paper:'cold-press',grainAmount:45};
 assert.deepEqual(validateProject({...legacy,paperSettings:global}).paperSettings,global);
 for(const paperSettings of [null,[],{paper:'invalid'},{grainAmount:101},{paperGrain:'false'}])assert.throws(()=>validateProject({...legacy,paperSettings}));
});
