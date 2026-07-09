import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Button } from './button'

test('Button defaults to type="button"', () => {
  const html = renderToStaticMarkup(<Button>Open chat</Button>)

  assert.match(html, /type="button"/)
})

test('Button preserves an explicit submit type', () => {
  const html = renderToStaticMarkup(<Button type="submit">Send</Button>)

  assert.match(html, /type="submit"/)
})
