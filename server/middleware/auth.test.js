import test from 'node:test'
import assert from 'node:assert/strict'
import { timingEqual } from './auth.js'

test('timingEqual returns false for different-length values without throwing', () => {
  assert.equal(timingEqual('abc', 'abcd'), false)
})

test('timingEqual returns true for identical values', () => {
  assert.equal(timingEqual('secret', 'secret'), true)
})
