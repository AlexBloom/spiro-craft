import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,gcd,generate,parameters,pointAt,validWindings,validateDesign} from '../geometry.mjs';
test('every guided winding reduces correctly and closes after the predicted turns',()=>{
 for(const fold of [6,12,24])for(const winding of validWindings(fold)){
  const s={...defaults,fold,winding};const p=parameters(s);const divisor=gcd(fold,winding);assert.equal(p.fold,fold/divisor);assert.equal(p.turns,winding/divisor);
  const first=pointAt(p,0),last=pointAt(p,2*Math.PI*p.turns);assert.ok(Math.hypot(last[0]-first[0],last[1]-first[1])<1e-7);
  // A 1/fold rotation corresponds to an integer gear phase, so the entire curve repeats.
  const phase=Array.from({length:p.denominator},(_,k)=>(1+p.numerator*k)/p.denominator).find(Number.isInteger);
  const t=.317;const q=pointAt(p,t+2*Math.PI*phase/p.numerator),a=pointAt(p,t),angle=2*Math.PI*phase/p.numerator;
  assert.ok(Math.hypot(q[0]-(a[0]*Math.cos(angle)-a[1]*Math.sin(angle)),q[1]-(a[0]*Math.sin(angle)+a[1]*Math.cos(angle)))<1e-7);
 }
});
test('freeform reduces ratios for inside and outside curves and closes',()=>{for(const curve of ['inside','outside']){const s={...defaults,mode:'free',outer:150,inner:60,curve};const p=parameters(s);assert.equal(p.numerator,5);assert.equal(p.denominator,2);const a=pointAt(p,0),b=pointAt(p,Math.PI*2*p.turns);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7);}});
test('drawing respects chosen size and stays finite at extreme settings',()=>{for(const s of [defaults,{...defaults,mode:'free',outer:239,inner:119,offset:220},{...defaults,offset:0},{...defaults,mode:'free',outer:25,inner:120,curve:'outside'}]){const g=generate(s);assert.ok(g.points.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&Math.hypot(x,y)<=s.size*5+.0001));assert.ok(g.count<=60000);assert.ok(g.path.endsWith('Z'));}});
test('saved designs validate and reject malformed or unsafe settings',()=>{assert.deepEqual(validateDesign(defaults),defaults);for(const s of [{color:'red" onload="bad'},{outer:NaN},{fold:7},{winding:12},{mode:'free',outer:25,inner:100},{stroke:-1},{outer:25.3}])assert.throws(()=>validateDesign(s));});

test('winding includes every integer step and line weights cap at 5 pt while older saves still open',()=>{
 for(const fold of [6,12,24])assert.deepEqual(validWindings(fold),Array.from({length:fold-1},(_,i)=>i+1));
 for(const winding of [2,3,4])assert.equal(validateDesign({...defaults,fold:6,winding,stroke:10}).winding,winding);
 assert.equal(validateDesign({...defaults,stroke:5}).stroke,5);
 assert.equal(validateDesign({...defaults,stroke:10}).stroke,5);
 assert.throws(()=>validateDesign({...defaults,stroke:10.1}));
});
