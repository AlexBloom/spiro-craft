import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareTrace,animateTrace} from '../trace.mjs';
import {defaults,generate} from '../geometry.mjs';
import {createProject,projectSvg} from '../layers.mjs';

test('progress follows distance along one continuous open stroke',()=>{
 const trace=prepareTrace([[0,0],[9,0],[9,3],[0,0]]);
 const halfwayFirst=(9/2)/trace.length;
 assert.equal(trace.pathAt(0),'M0.000,0.000');
 assert.equal(trace.pathAt(halfwayFirst),'M0.000,0.000L4.500,0.000');
 assert.equal(trace.pathAt(10/trace.length),'M0.000,0.000L9.000,0.000L9.000,1.000');
 for(const progress of [.01,.25,.5,.75,.99]){const d=trace.pathAt(progress);assert.equal((d.match(/M/g)||[]).length,1);assert.doesNotMatch(d,/Z|NaN|Infinity/);}
 assert.match(trace.pathAt(1),/Z$/);
});
test('full traces exactly reproduce generated geometry, including complex freeform curves',()=>{
 for(const state of [defaults,{...defaults,fold:24,winding:11},{...defaults,mode:'free',outer:239,inner:119},{...defaults,offset:0}]){
  const result=generate(state),trace=prepareTrace(result.points);
  assert.equal(trace.pathAt(1),result.path);
  assert.ok(trace.length>0);
  assert.ok(trace.pathAt(.9).length>trace.pathAt(.1).length);
 }
});
function fakePath(original){return {d:original,getAttribute(){return this.d;},setAttribute(name,value){assert.equal(name,'d');this.d=value;}};}
function clock(){let next=0;const frames=new Map();return {requestFrame(fn){const id=++next;frames.set(id,fn);return id;},cancelFrame(id){frames.delete(id);},advance(time){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));}};}
test('all layers start empty and reveal sequentially from one moving endpoint',()=>{
 const points=[[0,0],[10,0]],a=fakePath('first-full'),b=fakePath('second-full'),time=clock();let done=0;const changes=[];
 animateTrace([{path:a,points},{path:b,points}],{duration:1000,...time,onFinish:()=>done++,onLayerChange:(i,n)=>changes.push([i,n])});
 assert.equal(a.d,'M0.000,0.000');assert.equal(b.d,'M0.000,0.000');
 time.advance(0);time.advance(250);assert.equal(a.d,'M0.000,0.000L5.000,0.000');assert.equal(b.d,'M0.000,0.000');
 time.advance(750);assert.equal(a.d,'first-full');assert.equal(b.d,'M0.000,0.000L5.000,0.000');
 time.advance(1000);assert.equal(a.d,'first-full');assert.equal(b.d,'second-full');assert.equal(done,1);assert.deepEqual(changes,[[1,2],[2,2]]);
});
test('stopping playback restores all paths and cancels future frames without completing',()=>{
 const points=[[0,0],[10,0]],a=fakePath('original'),time=clock();let done=0;
 const animation=animateTrace([{path:a,points}],{duration:1000,...time,onFinish:()=>done++});time.advance(0);time.advance(500);animation.cancel();assert.equal(a.d,'original');time.advance(1000);assert.equal(done,0);
});
test('animation does not alter model geometry or exports',()=>{
 const project=createProject(),result=generate(defaults),path=fakePath(result.path),time=clock();
 const before=projectSvg(project,1200,{generate});const animation=animateTrace([{path,points:result.points}],{duration:1000,...time});time.advance(0);time.advance(200);assert.notEqual(path.d,result.path);assert.equal(projectSvg(project,1200,{generate}),before);animation.cancel();
});
