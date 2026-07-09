/**
 * List Block Renderer
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

export class ListBlockRenderer {
    readonly type = 'list'

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
        const rawItems = item.attrs?.list_items || item.attrs?.items
        const items = rawItems ? rawItems : [{ text: item.content }]
        const ordered = item.attrs?.list_type === 'ordered'

        // For ordered lists, use indent to accommodate number + "."
        const indentWidth = ordered ? 30 : 0

        ctx.fillStyle = opts.highlight ? '#1e40af' : '#333333'
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        withClip(ctx, rect, () => {
            const bulletX = rect.x
            const textX = bulletX + indentWidth

            if (opts.contentDiff && opts.contentDiff.length > 0) {
                const lhDiff = fontSize * lineHeight
                const lines = item.content.split('\n')
                lines.forEach((_, index) => {
                    const y = rect.y + index * lhDiff
                    if (ordered) {
                        ctx.fillText(`${index + 1}.`, bulletX, y)
                    }
                })

                drawDiffText(
                    ctx,
                    opts.contentDiff,
                    textX,
                    rect.y,
                    rect.width - (textX - rect.x),
                    rect.height,
                    fontSize,
                    lineHeight,
                    opts.diffSide,
                )
                return
            }

            const lh = fontSize * lineHeight
            let currentY = rect.y
            items.forEach((listItem: string | { text: string }, index: number) => {
                if (currentY >= rect.y + rect.height) return

                if (ordered) {
                    ctx.fillText(`${index + 1}.`, bulletX, currentY)
                }

                const itemText = typeof listItem === 'string' ? listItem : listItem.text
                const remainingHeight = rect.height - (currentY - rect.y)
                const usedHeight = drawWrappedText(ctx, itemText, textX, currentY, rect.width - (textX - rect.x), remainingHeight, fontSize, lineHeight)
                currentY += Math.max(usedHeight, lh)
            })
        })
    }
}
