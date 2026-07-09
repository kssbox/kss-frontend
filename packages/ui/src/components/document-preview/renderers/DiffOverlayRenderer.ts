/**
 * Diff Overlay Renderer
 *
 * Renders diff-state highlighting (added/deleted/updated/moved) as background overlays.
 * This is not a block-type renderer but a decoration layer.
 */

import type { PixelRect } from '../../canvas-engine'
import { DIFF_OVERLAY_COLORS } from '../core/diffColors'

export class DiffOverlayRenderer {
    /**
     * Render a diff overlay on a block rect.
     */
    render(ctx: CanvasRenderingContext2D, rect: PixelRect, diffState: string): void {
        if (!diffState || diffState === 'unchanged') return

        const color = DIFF_OVERLAY_COLORS[diffState] ?? DIFF_OVERLAY_COLORS.unchanged

        if (color.bg !== 'transparent') {
            ctx.fillStyle = color.bg
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
        }

        if (color.border !== 'transparent') {
            ctx.strokeStyle = color.border
            ctx.lineWidth = 2
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
        }
    }
}
