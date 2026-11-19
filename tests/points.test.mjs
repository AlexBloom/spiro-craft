import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,generate,validateDesign} from '../geometry.mjs';
import {validatePoints,connectionCount,MAX_CONNECTIONS} from '../point-geometry.mjs';
import {createProject,validateProject,activeLayer,addLayer,projectSvg} from '../layers.mjs';
import {prepareTrace} from '../trace.mjs';
const settings=(pointGeometry)=>validateDesign({...defaults,mode:'points',pointGeometry});
test('star polygons preserve all points and split into gcd cycles without bridge segments',()=>{
 const s=settings({count:12,step:4}),g=generate(s);
 assert.equal(g.p.components,4);assert.equal(g.count,12);
 assert.equal((g.path.match(/M/g)||[]).length,4);assert.equal((g.path.match(/L/g)||[]).length,12);
 assert.equal(prepareTrace(g.points,g.closed).pathAt(1),g.path);
 assert.match(g.p.summary,/4 paths/);
});
test('alternating stars honor inner and outer diameters and offset',()=>{
 const s=settings({kind:'star',count:7,step:2,outerDiameter:100,innerDiameter:30,ringOffset:13}),g=generate(s);
 assert.equal(g.count,14);assert.equal(g.points.length,15);
 assert.ok(Math.abs(Math.hypot(...g.points[0])-410)<1e-8);
 assert.ok(Math.abs(Math.hypot(...g.points[1])-123)<1e-8);
 assert.deepEqual(g.points[0],g.points.at(-1));
});
test('multiple rings count connections correctly for independent point counts and each connection rule',()=>{
 const rings=[{count:6,diameter:100,offset:0},{count:9,diameter:50,offset:15}];
 for(const [connection,expected] of [['within',15],['matching',9],['stepped',9],['all',54]]){
  const s=settings({kind:'rings',rings,connection});const g=generate(s);
  assert.equal(g.count,expected);assert.equal(connectionCount(s.pointGeometry),expected);
  assert.ok(g.points.filter(Boolean).every(p=>p.every(Number.isFinite)&&Math.hypot(...p)<=410.00001));
  assert.equal(prepareTrace(g.points,false).pathAt(1),g.path);
 }
});
test('point documents migrate, round trip, clone independently, and export mixed curves and straight paths',()=>{
 assert.equal(validateDesign({mode:'guided'}).pointGeometry.kind,'polygon');
 const p=createProject(settings({kind:'rings'}));const original=activeLayer(p);const clone=addLayer(p,{duplicate:true});
 clone.settings.pointGeometry.rings[0].count=8;assert.equal(original.settings.pointGeometry.rings[0].count,12);
 addLayer(p);assert.equal(activeLayer(p).settings.mode,'guided');
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(p))),p);
 const svg=projectSvg(p,1200,{generate});assert.equal((svg.match(/<path/g)||[]).length,3);
});
test('malformed point settings and excessive all-to-all density are rejected',()=>{
 for(const data of [null,{count:2},{step:0},{count:5,step:5},{innerDiameter:101},{ringOffset:Infinity},{kind:'bad'},{connection:'bad'},{rings:[]},{rings:[null,null]},{kind:'rings',connection:'all',rings:Array.from({length:6},()=>({count:64,diameter:80,offset:0}))}])assert.throws(()=>validatePoints(data));
 assert.equal(MAX_CONNECTIONS,2048);
});
test('compound tracing measures only ink distance and never draws a connector between separate paths',()=>{
 const trace=prepareTrace([[0,0],[10,0],null,[100,100],[110,100]],false);
 assert.equal(trace.length,20);
 assert.equal(trace.pathAt(.75),'M0.000,0.000L10.000,0.000M100.000,100.000L105.000,100.000');
});
