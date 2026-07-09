import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pdfViewerDir = resolve(__dirname, '../src/components/pdf-viewer')

for (const filename of ['PdfToolbar.tsx', 'PdfSearchPanel.tsx', 'PdfThumbnailSidebar.tsx', 'PdfViewer.tsx']) {
    test(`${filename} avoids fixed light hover colors in dark theme`, () => {
        const source = readFileSync(resolve(pdfViewerDir, filename), 'utf8')

        assert.doesNotMatch(source, /hover:bg-gray-(?:100|200)/)
        assert.doesNotMatch(source, /bg-gray-50/)
        if (filename !== 'PdfViewer.tsx') {
            assert.match(source, /hover:bg-accent/)
        }
    })
}

test('PdfViewer keeps zoomed pages horizontally scrollable from the left edge', () => {
    const source = readFileSync(resolve(pdfViewerDir, 'PdfViewer.tsx'), 'utf8')

    assert.match(source, /w-fit/)
    assert.match(source, /min-w-full/)
    assert.match(source, /justify-center/)
})

test('RangePreviewRenderer turns form-feed markdown into page anchors', () => {
    const source = readFileSync(resolve(__dirname, '../src/components/document-preview/RangePreviewRenderer.tsx'), 'utf8')
    const typesSource = readFileSync(resolve(__dirname, '../src/components/document-preview/types.ts'), 'utf8')

    assert.match(source, /content\.matchAll\(\/\\f\/g\)/)
    assert.match(source, /id: `\$\{block\.id\}::page:\$\{range\.pageOffset\}`/)
    assert.match(source, /data-page-wrapper=\{\(Number\.isFinite\(block\.page\) \? block\.page : 0\) \+ 1\}/)
    assert.match(typesSource, /height <= DEFAULT_PAGE_HEIGHT - DEFAULT_MARGIN && yStart \+ height > DEFAULT_PAGE_HEIGHT - DEFAULT_MARGIN/)
})
