/**
 * Register All Document Preview Renderers
 *
 * Convenience function to register all block renderers with a CanvasEngine.
 */

import type { CanvasEngine } from '../../canvas-engine'
import type { ParseBlock } from '../types'
import { TextBlockRenderer } from './TextBlockRenderer'
import { HeadingBlockRenderer } from './HeadingBlockRenderer'
import { ListBlockRenderer } from './ListBlockRenderer'
import { TableBlockRenderer } from './TableBlockRenderer'
import { ImageBlockRenderer } from './ImageBlockRenderer'
import { FormulaBlockRenderer } from './FormulaBlockRenderer'
import { CodeBlockRenderer } from './CodeBlockRenderer'
import { HtmlBlockRenderer } from './HtmlBlockRenderer'

export interface RegisteredRenderers {
    text: TextBlockRenderer
    heading: HeadingBlockRenderer
    list: ListBlockRenderer
    table: TableBlockRenderer
    image: ImageBlockRenderer
    formula: FormulaBlockRenderer
    code: CodeBlockRenderer
    html: HtmlBlockRenderer
}

/**
 * Register all document-preview block renderers with a CanvasEngine.
 * Returns references to the renderer instances for external configuration
 * (e.g. setting table data map on TableBlockRenderer).
 */
export function registerAllRenderers(engine: CanvasEngine<ParseBlock>): RegisteredRenderers {
    const text = new TextBlockRenderer()
    const heading = new HeadingBlockRenderer()
    const list = new ListBlockRenderer()
    const table = new TableBlockRenderer()
    const image = new ImageBlockRenderer()
    const formula = new FormulaBlockRenderer()
    const code = new CodeBlockRenderer()
    const html = new HtmlBlockRenderer()

    engine.registry.register(text)
    engine.registry.register(heading)
    engine.registry.register(list)
    engine.registry.register(table)
    engine.registry.register(image)
    engine.registry.register(formula)
    engine.registry.register(code)
    engine.registry.register(html)

    return { text, heading, list, table, image, formula, code, html }
}
