/**
 * Code Block Renderer
 */

import type { PixelRect, BaseRenderOptions } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import { calculateAdaptiveFontSize, withClip, renderDiffBackground } from './rendererTypes'
import type { RangeRenderOptions } from './rendererTypes'

export class CodeBlockRenderer {
    readonly type = 'code'

    render(
        ctx: CanvasRenderingContext2D,
        item: ParseBlock,
        rect: PixelRect,
        _options: BaseRenderOptions,
    ): void {
        if (!item.content) return

        const opts = _options as RangeRenderOptions
        const { fontSize, lineHeight } = calculateAdaptiveFontSize(rect.width, rect.height, item.content)

        // Code background first, then diff overlay on top so diff color is visible
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
        renderDiffBackground(ctx, rect, opts.diffState)

        // Code text
        ctx.fillStyle = '#1f2937'
        ctx.font = `${fontSize}px 'Courier New', monospace`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        withClip(ctx, rect, () => {
            const lines = item.content.split('\n')
            const lh = fontSize * lineHeight
            lines.forEach((line: string, index: number) => {
                const y = rect.y + index * lh + 4
                if (y < rect.y + rect.height) {
                    ctx.fillText(line, rect.x + 8, y)
                }
            })
        })
    }
}
