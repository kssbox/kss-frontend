/**
 * HTML Block Renderer
 *
 * Handles HTML blocks including HTML tables.
 * Extracted from CanvasRenderer with support for simple tables.
 */

import type { PixelRect, BaseRenderOptions } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import { DEFAULT_RENDERER_CONTEXT, drawWrappedText, withClip, renderDiffBackground } from './rendererTypes'
import type { RangeRenderOptions } from './rendererTypes'

export class HtmlBlockRenderer {
    readonly type = 'html'

    /** Cached textarea for HTML entity decoding (M7 fix) */
    private decoderTextarea: HTMLTextAreaElement | null = null

    render(
        ctx: CanvasRenderingContext2D,
        item: ParseBlock,
        rect: PixelRect,
        _options: BaseRenderOptions,
    ): void {
        const opts = _options as RangeRenderOptions
        renderDiffBackground(ctx, rect, opts.diffState)

        const htmlContent = this.getHtmlContent(item)
        if (!htmlContent) return

        const htmlType = item.attrs?.html_type || 'other'

        if (htmlType === 'table') {
            this.renderHtmlTable(ctx, item, rect, htmlContent)
        } else {
            this.renderGenericHtml(ctx, rect, htmlContent)
        }
    }

    // ---------------------------------------------------------------------------
    // Private
    // ---------------------------------------------------------------------------

    private getHtmlContent(block: ParseBlock): string | null {
        if (typeof block.attrs?.html === 'string' && block.attrs.html) {
            return block.attrs.html
        }
        return block.content || null
    }

    private decodeHtmlEntities(text: string): string {
        if (!this.decoderTextarea) {
            this.decoderTextarea = document.createElement('textarea')
        }
        this.decoderTextarea.innerHTML = text
        let decoded = this.decoderTextarea.value
        decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
            String.fromCharCode(parseInt(code, 16)),
        )
        return decoded
    }

    private parseHtmlTable(
        html: string,
    ): { rows: Array<{ cells: string[]; isHeader: boolean }> } | null {
        try {
            const rows: Array<{ cells: string[]; isHeader: boolean }> = []

            const theadMatch = html.match(/<thead>([\s\S]*?)<\/thead>/)
            const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/)

            if (theadMatch || tbodyMatch) {
                if (theadMatch) {
                    const headerRows = theadMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || []
                    headerRows.forEach((row) => {
                        const cells = Array.from(row.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)).map((m) =>
                            this.decodeHtmlEntities(m[1].trim()),
                        )
                        if (cells.length > 0) {
                            rows.push({ cells, isHeader: true })
                        }
                    })
                }
                if (tbodyMatch) {
                    const bodyRows = tbodyMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || []
                    bodyRows.forEach((row) => {
                        const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)).map((m) =>
                            this.decodeHtmlEntities(m[1].trim()),
                        )
                        if (cells.length > 0) {
                            rows.push({ cells, isHeader: false })
                        }
                    })
                }
            } else {
                const allRows = html.match(/<tr>([\s\S]*?)<\/tr>/g) || []
                allRows.forEach((row, index) => {
                    const thCells = Array.from(row.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g))
                    const tdCells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g))
                    const allCells = [...thCells, ...tdCells].map((m) =>
                        this.decodeHtmlEntities(m[1].trim()),
                    )
                    if (allCells.length > 0) {
                        const isHeader = thCells.length > 0 || (index === 0 && rows.length === 0)
                        rows.push({ cells: allCells, isHeader })
                    }
                })
            }

            if (!rows.length || rows.every((r) => r.cells.length === 0)) return null
            return { rows }
        } catch (e) {
            console.error('Failed to parse HTML table:', e)
            return null
        }
    }

    private renderHtmlTable(
        ctx: CanvasRenderingContext2D,
        _block: ParseBlock,
        rect: PixelRect,
        htmlContent: string,
    ): void {
        const table = this.parseHtmlTable(htmlContent)
        if (!table || table.rows.length === 0) {
            this.renderPlaceholder(ctx, rect, 'Invalid HTML Table')
            return
        }

        const { rows } = table
        const numRows = rows.length
        const numCols = Math.max(...rows.map((r) => r.cells.length))
        const cellWidth = rect.width / numCols
        const cellHeight = rect.height / numRows
        const { fontSize, fontFamily } = DEFAULT_RENDERER_CONTEXT

        withClip(ctx, rect, () => {
            ctx.strokeStyle = '#d1d5db'
            ctx.lineWidth = 1

            rows.forEach((row, rowIndex) => {
                row.cells.forEach((cell, colIndex) => {
                    const cellX = rect.x + colIndex * cellWidth
                    const cellY = rect.y + rowIndex * cellHeight

                    if (row.isHeader) {
                        ctx.fillStyle = '#f3f4f6'
                        ctx.fillRect(cellX, cellY, cellWidth, cellHeight)
                    }

                    ctx.strokeRect(cellX, cellY, cellWidth, cellHeight)

                    ctx.fillStyle = row.isHeader ? '#111827' : '#374151'
                    ctx.font = `${row.isHeader ? 'bold' : 'normal'} ${fontSize}px ${fontFamily}`
                    ctx.textAlign = 'left'
                    ctx.textBaseline = 'top'

                    const padding = 4
                    drawWrappedText(
                        ctx,
                        cell,
                        cellX + padding,
                        cellY + padding,
                        cellWidth - padding * 2,
                        cellHeight - padding * 2,
                        fontSize,
                    )
                })
            })
        })
    }

    private renderGenericHtml(
        ctx: CanvasRenderingContext2D,
        rect: PixelRect,
        htmlContent: string,
    ): void {
        const { fontSize } = DEFAULT_RENDERER_CONTEXT

        ctx.fillStyle = '#374151'
        ctx.font = `${fontSize}px monospace`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        withClip(ctx, rect, () => {
            ctx.fillStyle = '#6b7280'
            ctx.fillText('HTML', rect.x + 4, rect.y + 4)

            const preview = htmlContent.substring(0, 200) + '...'
            drawWrappedText(
                ctx,
                preview,
                rect.x + 4,
                rect.y + 24,
                rect.width - 8,
                rect.height - 28,
                fontSize * 0.9,
            )
        })
    }

    private renderPlaceholder(ctx: CanvasRenderingContext2D, rect: PixelRect, label: string): void {
        withClip(ctx, rect, () => {
            ctx.strokeStyle = '#e0e0e0'
            ctx.lineWidth = 1
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

            ctx.fillStyle = '#888888'
            ctx.font = '12px system-ui, -apple-system, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2)
        })
    }
}
