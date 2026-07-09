/**
 * Text Block Renderer
 */

import type { PixelRect, BaseRenderOptions } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import {
    type RangeRenderOptions,
    DEFAULT_RENDERER_CONTEXT,
    calculateAdaptiveFontSize,
    drawWrappedText,
    drawDiffText,
    withClip,
    renderDiffBackground,
} from './rendererTypes'

export class TextBlockRenderer {
    readonly type = 'text'

    render(
        ctx: CanvasRenderingContext2D,
        item: ParseBlock,
        rect: PixelRect,
        options: BaseRenderOptions,
    ): void {
        if (!item.content) return

        const opts = options as RangeRenderOptions
        const { fontFamily } = DEFAULT_RENDERER_CONTEXT
        const { fontSize, lineHeight } = calculateAdaptiveFontSize(rect.width, rect.height, item.content)

        renderDiffBackground(ctx, rect, opts.diffState)

        ctx.fillStyle = opts.highlight ? '#1e40af' : '#000000'
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        withClip(ctx, rect, () => {
            if (opts.contentDiff && opts.contentDiff.length > 0) {
                drawDiffText(ctx, opts.contentDiff, rect.x, rect.y, rect.width, rect.height, fontSize, lineHeight, opts.diffSide)
            } else {
                drawWrappedText(ctx, item.content, rect.x, rect.y, rect.width, rect.height, fontSize, lineHeight)
            }
        })
    }
}
