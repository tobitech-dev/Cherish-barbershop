import test from 'node:test';
import assert from 'node:assert/strict';
test('half-open intervals allow back-to-back appointments',()=>{
 const overlaps=(start,end,nextStart,nextEnd)=>start<nextEnd&&end>nextStart;
 assert.equal(overlaps(540,570,570,600),false);
});
