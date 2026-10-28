import test from 'node:test';
import assert from 'node:assert/strict';
test('overlap condition identifies intersecting appointment intervals',()=>{
 const overlaps=(a,b,c,d)=>a<d&&b>c;
 assert.equal(overlaps(600,630,620,650),true);
 assert.equal(overlaps(600,630,630,660),false);
});
