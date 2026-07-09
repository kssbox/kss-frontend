import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rendererPath = resolve(__dirname, '../src/components/document-preview/RangePreviewRenderer.tsx')
const largeTextRendererPath = resolve(__dirname, '../src/components/document-preview/components/LargeTextRenderer.tsx')

test('generated spreadsheet preview paper surface is transparent', () => {
    const source = readFileSync(rendererPath, 'utf8')
    const match = source.match(/const DOCUMENT_PAPER_STYLE: React\.CSSProperties = \{([\s\S]*?)\n\}/)

    assert.ok(match, 'DOCUMENT_PAPER_STYLE should exist')
    assert.match(match[1], /background:\s*'transparent'/)
    assert.doesNotMatch(match[1], /background:\s*'#fff(?:fff)?'/i)
})

test('generated spreadsheet sheet labels use theme-readable color', () => {
    const source = readFileSync(rendererPath, 'utf8')

    assert.match(source, /const DOCUMENT_SHEET_LABEL_STYLE: React\.CSSProperties = \{[\s\S]*?color:\s*'var\(--surface-foreground/)
    assert.doesNotMatch(source, /style=\{\{\s*color:\s*'#4b5563'\s*\}\}/)
})

test('large text previews keep dark ink on their light paper surface', () => {
    const source = readFileSync(largeTextRendererPath, 'utf8')

    assert.match(source, /backgroundColor:\s*'#fafafa'/)
    assert.match(source, /color:\s*'#111827'/)
})

test('range preview edit textareas are not remapped by dark theme bg-white adapter', () => {
    const source = readFileSync(rendererPath, 'utf8')

    assert.doesNotMatch(source, /className="[^"]*bg-white[^"]*p-3 resize-none/)
})

test('inline markdown editing preserves the rendered block footprint', () => {
    const source = readFileSync(rendererPath, 'utf8')

    assert.match(source, /const INLINE_EDIT_TEXTAREA_CLASS_NAME = 'absolute inset-0/)
    assert.match(source, /visibility: 'hidden'/)
    assert.doesNotMatch(source, /const isLargeBlock =/)
    assert.doesNotMatch(source, /<LargeTextRenderer/)
    assert.doesNotMatch(source, /height: inlineEditTextareaHeight \?\? undefined/)
})

test('starting markdown edit focus does not force the caret to the block end', () => {
    const source = readFileSync(rendererPath, 'utf8')

    assert.match(source, /textarea\.focus\(\{ preventScroll: true \}\)/)
    assert.doesNotMatch(source, /textarea\.setSelectionRange\(length, length\)/)
})

test('canvas markdown overlays remain directly editable in edit mode', () => {
    const source = readFileSync(rendererPath, 'utf8')

    assert.match(source, /pointerEvents: editMode \? 'auto' : 'none'/)
    assert.match(source, /startEditBlock\(displayBlock\)/)
})

test('pdf page markdown blocks edit without replacing the rendered layout with textarea', () => {
    const source = readFileSync(rendererPath, 'utf8')

    assert.match(source, /function shouldUseRenderedMarkdownEditor\(block: ParseBlock\)/)
    assert.match(source, /resolveBlockType\(block\) !== 'image'/)
    assert.match(source, /contentEditable/)
    assert.match(source, /editingBlockId === block\.id\s*&&\s*shouldUseRenderedMarkdownEditor\(block\)/)
    assert.match(source, /renderedMarkdownDirtyBlockIdRef/)
    assert.match(source, /handleRenderedMarkdownBlur\(event, block\)/)
    assert.match(source, /useRenderedMarkdownEditor \? \(/)
})
