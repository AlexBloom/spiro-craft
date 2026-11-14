import test from 'node:test';
import assert from 'node:assert/strict';
import {createLayerId} from '../ids.mjs';
import {createProject,addLayer,validateProject} from '../layers.mjs';
test('layer IDs work on LAN HTTP without secure-context randomUUID',()=>{
 const source={getRandomValues(bytes){for(let i=0;i<bytes.length;i++)bytes[i]=i;return bytes;}};
 assert.equal(createLayerId(source),'00010203-0405-4607-8809-0a0b0c0d0e0f');
 const original=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 try{Object.defineProperty(globalThis,'crypto',{configurable:true,value:source});const p=createProject();assert.equal(p.layers.length,1);assert.doesNotThrow(()=>validateProject(p));source.getRandomValues=bytes=>{bytes.fill(12);return bytes;};addLayer(p);assert.equal(p.layers.length,2);assert.notEqual(p.layers[0].id,p.layers[1].id);assert.doesNotThrow(()=>validateProject(p));}
 finally{if(original)Object.defineProperty(globalThis,'crypto',original);else delete globalThis.crypto;}
});
test('layer IDs also have a valid unique fallback when crypto is absent',()=>{const ids=Array.from({length:100},()=>createLayerId(null));assert.equal(new Set(ids).size,100);assert.ok(ids.every(id=>/^[a-zA-Z0-9-]{1,64}$/.test(id)));});
