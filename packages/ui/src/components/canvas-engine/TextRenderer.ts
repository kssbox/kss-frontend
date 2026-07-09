/**
 * Canvas Engine - Text Renderer
 *
 * Stateless utility for measuring and drawing text on a 2D canvas.
 * Handles word-wrap, line-height, and clipped rendering.
 */

export interface TextStyleConfig {
    fontSize: number
    fontFamily: string
    fontWeight: string
    color: string
    lineHeight: number
}

export const DEFAULT_TEXT_STYLE: TextStyleConfig = {
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: 1.5,
}

export class TextRenderer {
    private style: TextStyleConfig

    constructor(style: Partial<TextStyleConfig> = {}) {
        this.style = { ...DEFAULT_TEXT_STYLE, ...style }
    }

    get fontSize(): number {
        return this.style.fontSize
    }

    get fontFamily(): string {
        return this.style.fontFamily
    }

    get lineHeightPx(): number {
        return this.style.fontSize * this.style.lineHeight
    }

    // ---------------------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------------------

    setFontSize(size: number): void {
        this.style.fontSize = size
    }

    setStyle(partial: Partial<TextStyleConfig>): void {
        Object.assign(this.style, partial)
    }

    // ---------------------------------------------------------------------------
    // Font string helpers
    // ---------------------------------------------------------------------------

    /**
     * Build a CSS font string from current style + overrides.
     */
    fontString(overrides?: { fontWeight?: string; fontSize?: number; fontFamily?: string }): string {
        const weight = overrides?.fontWeight ?? this.style.fontWeight
        const size = overrides?.fontSize ?? this.style.fontSize
        const family = overrides?.fontFamily ?? this.style.fontFamily
        return `${weight} ${size}px ${family}`
    }

    // ---------------------------------------------------------------------------
    // Drawing
    // ---------------------------------------------------------------------------

    /**
     * Draw text with automatic line wrapping, clipped to a region.
     */
    drawWrappedText(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        maxHeight: number,
        fontSize?: number,
    ): void {
        const fs = fontSize ?? this.style.fontSize
        const lineHeight = fs * this.style.lineHeight
        const chars = text.split('')
        let line = ''
        let lineY = y

        for (const char of chars) {
            if (char === '\n') {
                ctx.fillText(line, x, lineY)
                line = ''
                lineY += lineHeight
                if (lineY - y > maxHeight) break
                continue
            }
            const testLine = line + char
            const metrics = ctx.measureText(testLine)

            if (metrics.width > maxWidth && line) {
                ctx.fillText(line, x, lineY)
                line = char
                lineY += lineHeight
                if (lineY - y > maxHeight) break
            } else {
                line = testLine
            }
        }

        if (line && lineY - y <= maxHeight) {
            ctx.fillText(line, x, lineY)
        }
    }

    /**
     * Draw multi-line text (pre-split by \n), no word-wrap.
     */
    drawLines(
        ctx: CanvasRenderingContext2D,
        lines: string[],
        x: number,
        y: number,
        maxHeight: number,
        fontSize?: number,
    ): void {
        const fs = fontSize ?? this.style.fontSize
        const lineHeight = fs * this.style.lineHeight

        for (let i = 0; i < lines.length; i++) {
            const ly = y + i * lineHeight
            if (ly - y > maxHeight) break
            ctx.fillText(lines[i], x, ly)
        }
    }

    /**
     * Apply text style to canvas context.
     */
    applyStyle(
        ctx: CanvasRenderingContext2D,
        overrides?: { color?: string; fontWeight?: string; fontSize?: number; fontFamily?: string },
    ): void {
        ctx.fillStyle = overrides?.color ?? this.style.color
        ctx.font = this.fontString(overrides)
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
    }
}
