import test from 'node:test'
import assert from 'node:assert/strict'
import { hasValidSupabaseConfig } from './supabase-config.js'

test('accepts valid Supabase config', () => {
  assert.equal(
    hasValidSupabaseConfig('https://demo.supabase.co', 'sb_publishable_abcdefghijklmnopqrstuvwxyz1234567890'),
    true,
  )
})

test('rejects placeholder credentials', () => {
  assert.equal(hasValidSupabaseConfig('https://your-project.supabase.co', 'your-anon-key'), false)
})

test('rejects missing or fake values', () => {
  assert.equal(hasValidSupabaseConfig('', 'abc'), false)
  assert.equal(hasValidSupabaseConfig('https://example.com', 'not-a-real-key'), false)
})
