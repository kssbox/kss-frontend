/**
 * Table Layout Manager for Range Preview
 * Handles HTML table pre-rendering, measurement, and Canvas conversion
 */

import type { ParseBlock } from '../types';

export interface CellLayout {
    row: number;
    col: number;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
}

export interface TableLayoutCache {
    blockId: string;
    htmlWidth: number;
    htmlHeight: number;
    bboxWidth: number;
    bboxHeight: number;
    scaleX: number;
    scaleY: number;
    cellLayouts: CellLayout[];
    rows: number;
    cols: number;
    cacheTime: number;
    imageData: ImageData;
    renderWidth?: number;
    renderHeight?: number;
    /**
     * When true, the canvas TableBlockRenderer skips rendering entirely.
     * Used for HTML table blocks (attrs.html) that are shown as DOM overlays.
     */
    skipCanvas?: boolean;
}

export class TableLayoutManager {
    private cache: Map<string, TableLayoutCache> = new Map();
    private measureContainer: HTMLDivElement | null = null;

    constructor() {
        this.setupMeasureContainer();
    }

    /**
     * Setup hidden measurement container
     */
    private setupMeasureContainer(): void {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.visibility = 'hidden';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.zIndex = '-1';
        document.body.appendChild(container);
        this.measureContainer = container;
    }

    /**
     * Ensure the measurement container is attached to the DOM.
     * In React Strict Mode, the cleanup effect may remove the container
     * while the manager instance is still alive.  Re-create if needed.
     */
    private ensureMeasureContainer(): void {
        if (!this.measureContainer || !this.measureContainer.isConnected) {
            this.setupMeasureContainer();
        }
    }

    /**
     * Measure table dimensions and cell layouts
     */
    private async measureTable(
        html: string,
        maxWidth?: number
    ): Promise<{
        width: number;
        height: number;
        cellLayouts: CellLayout[];
    }> {
        this.ensureMeasureContainer();
        if (!this.measureContainer) {
            throw new Error('Measure container not initialized');
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        if (maxWidth) {
            tempDiv.style.width = `${maxWidth}px`;
            tempDiv.style.maxWidth = `${maxWidth}px`;
        }
        this.measureContainer.appendChild(tempDiv);

        await new Promise(resolve => setTimeout(resolve, 50));

        const table = tempDiv.querySelector('table');
        if (!table) {
            throw new Error('No table found in HTML');
        }

        if (maxWidth) {
            table.style.tableLayout = 'fixed';
            table.style.width = '100%';
            table.style.maxWidth = '100%';

            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                const element = cell as HTMLElement;
                element.style.whiteSpace = 'nowrap';
                element.style.overflow = 'hidden';
                element.style.textOverflow = 'clip';
            });
        }

        const width = table.offsetWidth;
        const height = table.offsetHeight;

        // Collect cell layouts
        const cellLayouts: CellLayout[] = [];
        const rows = table.querySelectorAll('tr');
        rows.forEach((tr, rowIdx) => {
            const cells = tr.querySelectorAll('td, th');
            cells.forEach((cell, colIdx) => {
                const rect = cell.getBoundingClientRect();
                const parentRect = table.getBoundingClientRect();

                cellLayouts.push({
                    row: rowIdx,
                    col: colIdx,
                    x: rect.left - parentRect.left,
                    y: rect.top - parentRect.top,
                    width: rect.width,
                    height: rect.height,
                    text: cell.textContent || '',
                });
            });
        });

        this.measureContainer.removeChild(tempDiv);

        return { width, height, cellLayouts };
    }

    /**
     * Convert table HTML to Canvas ImageData
     */
    async convertTableToCanvas(
        html: string,
        bboxWidth: number,
        _bboxHeight: number,
        showBorder = false
    ): Promise<{
        imageData: ImageData;
        scale: { x: number; y: number };
        renderWidth: number;
        renderHeight: number;
        measurement: { width: number; height: number; cellLayouts: CellLayout[] };
    }> {
        const { width: htmlWidth, height: htmlHeight, cellLayouts } = await this.measureTable(
            html,
            bboxWidth
        );

        // Calculate scale: use width-based scaling to fill bbox width
        // Height adapts proportionally (may be taller or shorter than bbox)
        const scaleX = bboxWidth / htmlWidth;
        const scaleToUse = scaleX;

        // Final render dimensions (fill width, proportional height)
        const renderWidth = bboxWidth;
        const renderHeight = htmlHeight * scaleToUse;

        const safeWidth = Math.max(1, Math.ceil(htmlWidth));
        const safeHeight = Math.max(1, Math.ceil(htmlHeight));

        // Create canvas for table rendering
        const tableCanvas = document.createElement('canvas');
        tableCanvas.width = safeWidth;
        tableCanvas.height = safeHeight;
        const tableCtx = tableCanvas.getContext('2d');

        if (!tableCtx) {
            throw new Error('Failed to get 2D context');
        }

        // Draw white background
        tableCtx.fillStyle = '#ffffff';
        tableCtx.fillRect(0, 0, safeWidth, safeHeight);

        // Draw table content
        this.drawTableContent(tableCtx, cellLayouts, safeWidth, safeHeight, showBorder);

        // Get ImageData
        const imageData = tableCtx.getImageData(0, 0, safeWidth, safeHeight);

        return {
            imageData,
            scale: { x: scaleToUse, y: scaleToUse },
            renderWidth,
            renderHeight,
            measurement: { width: htmlWidth, height: htmlHeight, cellLayouts },
        };
    }

    /**
     * Draw table content on canvas
     */
    private drawTableContent(
        ctx: CanvasRenderingContext2D,
        cellLayouts: CellLayout[],
        tableWidth: number,
        tableHeight: number,
        showBorder: boolean
    ): void {
        const rowCount = cellLayouts.length ? Math.max(...cellLayouts.map(c => c.row)) + 1 : 0;
        const colCount = cellLayouts.length ? Math.max(...cellLayouts.map(c => c.col)) + 1 : 0;

        // Draw border if enabled
        if (showBorder) {
            ctx.strokeStyle = '#d0d0d0';
            ctx.lineWidth = 1;

            // Collect row heights and column widths
            const rowHeights = new Array(rowCount).fill(0);
            const colWidths = new Array(colCount).fill(0);

            cellLayouts.forEach(cell => {
                rowHeights[cell.row] = Math.max(rowHeights[cell.row], cell.height);
                colWidths[cell.col] = Math.max(colWidths[cell.col], cell.width);
            });

            // Horizontal lines
            let currentY = 0;
            for (let i = 0; i <= rowCount; i++) {
                ctx.beginPath();
                ctx.moveTo(0, currentY);
                ctx.lineTo(tableWidth, currentY);
                ctx.stroke();
                if (i < rowCount) currentY += rowHeights[i];
            }

            // Vertical lines
            let currentX = 0;
            for (let i = 0; i <= colCount; i++) {
                ctx.beginPath();
                ctx.moveTo(currentX, 0);
                ctx.lineTo(currentX, tableHeight);
                ctx.stroke();
                if (i < colCount) currentX += colWidths[i];
            }
        }

        // Draw text
        ctx.fillStyle = '#333333';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const cellPaddingX = 4;
        const cellPaddingY = 4;

        cellLayouts.forEach(cell => {
            const clipX = cell.x + cellPaddingX;
            const clipY = cell.y + cellPaddingY;
            const clipWidth = Math.max(0, cell.width - cellPaddingX * 2);
            const clipHeight = Math.max(0, cell.height - cellPaddingY * 2);

            ctx.save();
            ctx.beginPath();
            ctx.rect(clipX, clipY, clipWidth, clipHeight);
            ctx.clip();
            ctx.fillText(cell.text, clipX, clipY);
            ctx.restore();
        });
    }

    /**
     * Get or create table cache
     */
    async getOrCreateTableCache(
        block: ParseBlock,
        bboxWidth: number,
        bboxHeight: number,
        showBorder = false
    ): Promise<TableLayoutCache> {
        const cacheKey = `${block.id}_${showBorder ? 'border' : 'noborder'}`;

        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.cacheTime < 3600000) {
            return cached;
        }

        // Prefer attrs.html (actual HTML) over block.content (which may be
        // markdown-formatted pipe table instead of HTML).
        const html = (block.attrs?.html as string) || block.content;
        if (!html) {
            throw new Error('No HTML content found in table block');
        }

        // If the content doesn't contain any HTML table tag, it's likely markdown.
        // Wrap markdown pipe-table text in a basic HTML structure.
        const isHtml = /<table/i.test(html);
        const finalHtml = isHtml ? html : this.markdownTableToHtml(html);

        const { imageData, scale, renderWidth, renderHeight, measurement } = await this.convertTableToCanvas(
            finalHtml,
            bboxWidth,
            bboxHeight,
            showBorder
        );

        const { cellLayouts, width: htmlWidth, height: htmlHeight } = measurement;

        const cache: TableLayoutCache = {
            blockId: block.id,
            htmlWidth,
            htmlHeight,
            bboxWidth,
            bboxHeight,
            scaleX: scale.x,
            scaleY: scale.y,
            cellLayouts,
            rows: cellLayouts.length ? Math.max(...cellLayouts.map(c => c.row)) + 1 : 0,
            cols: cellLayouts.length ? Math.max(...cellLayouts.map(c => c.col)) + 1 : 0,
            cacheTime: Date.now(),
            imageData,
            renderWidth,
            renderHeight,
        };

        this.cache.set(cacheKey, cache);
        return cache;
    }

    /**
     * Clear cache
     */
    clearCache(blockId?: string): void {
        if (blockId) {
            for (const key of this.cache.keys()) {
                if (key.startsWith(blockId)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    /**
     * Convert markdown pipe-table to basic HTML table.
     * Handles standard markdown table format:
     *   | col1 | col2 |
     *   |------|------|
     *   | val1 | val2 |
     */
    private markdownTableToHtml(markdown: string): string {
        const lines = markdown.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 2) return `<table><tr><td>${markdown}</td></tr></table>`;

        const parseRow = (line: string): string[] => {
            return line
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map(cell => cell.trim());
        };

        // Find separator line (contains only dashes/colons/pipes)
        const separatorIndex = lines.findIndex(line =>
            /^\|?[\s\-:|]+\|?$/.test(line.trim())
        );

        const rows: string[][] = [];
        let headerCells: string[] | null = null;

        for (let i = 0; i < lines.length; i++) {
            if (i === separatorIndex) continue; // skip separator
            const cells = parseRow(lines[i]);
            if (i < separatorIndex || (separatorIndex === -1 && i === 0)) {
                headerCells = cells;
            } else {
                rows.push(cells);
            }
        }

        let html = '<table>';
        if (headerCells) {
            html += '<tr>' + headerCells.map(c => `<th>${this.escapeHtml(c)}</th>`).join('') + '</tr>';
        }
        for (const row of rows) {
            html += '<tr>' + row.map(c => `<td>${this.escapeHtml(c)}</td>`).join('') + '</tr>';
        }
        html += '</table>';
        return html;
    }

    /**
     * Escape HTML special characters.
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Destroy manager
     */
    destroy(): void {
        this.clearCache();
        if (this.measureContainer && this.measureContainer.parentNode) {
            this.measureContainer.parentNode.removeChild(this.measureContainer);
        }
        this.measureContainer = null;
    }
}
