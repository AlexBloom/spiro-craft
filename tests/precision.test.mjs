import test from 'node:test';
import assert from 'node:assert/strict';
import {adjustmentValue} from '../precision.mjs';
test('manual adjustments clamp to supported ranges and preserve slider precision',()=>{
 assert.equal(adjustmentValue('2.7',.3,5,.1),2.7);
 assert.equal(adjustmentValue('2.76',.3,5,.1),2.8);
 assert.equal(adjustmentValue('100',.3,5,.1),5);
 assert.equal(adjustmentValue('-3',25,240,1),25);
 assert.equal(adjustmentValue('87',25,240,1),87);
 for(const value of ['', ' ', 'invalid', Infinity])assert.equal(adjustmentValue(value,0,100,1),null);
});
