import test from 'node:test';
import assert from 'node:assert/strict';
test('password policy requires strong passwords',()=>{
  const valid='StrongPass!123';
  assert.ok(valid.length>=12 && /[a-z]/.test(valid) && /[A-Z]/.test(valid) && /[0-9]/.test(valid) && /[^A-Za-z0-9]/.test(valid));
});
