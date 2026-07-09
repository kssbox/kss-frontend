/**
 * Formula Block Renderer
 */

import type { PixelRect, BaseRenderOptions } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import { calculateAdaptiveFontSize, drawWrappedText, withClip, renderDiffBackground } from './rendererTypes'
import type { RangeRenderOptions } from './rendererTypes'

export class FormulaBlockRenderer {
    readonly type = 'formula'

    render(
        ctx: CanvasRenderingContext2D,
        item: ParseBlock,
        rect: PixelRect,
        _options: BaseRenderOptions,
    ): void {
        if (!item.content) return

        const opts = _options as RangeRenderOptions
        const { fontSize, lineHeight } = calculateAdaptiveFontSize(rect.width, rect.height, item.content)

        renderDiffBackground(ctx, rect, opts.diffState)

        ctx.fillStyle = '#4b5563'
        ctx.font = `italic ${fontSize}px 'Courier New', monospace`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        withClip(ctx, rect, () => {
            drawWrappedText(ctx, item.content, rect.x, rect.y, rect.width, rect.height, fontSize, lineHeight)
        })
    }
}
