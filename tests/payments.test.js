import test from 'node:test';
import assert from 'node:assert/strict';
test('deposit is smaller than full amount for normal service prices',()=>{
 const amount=500000,deposit=Math.max(100000,Math.round(amount*.3));
 assert.equal(deposit,150000);
 assert.ok(deposit<amount);
});
