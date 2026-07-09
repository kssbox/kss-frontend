export interface PdfViewerFeatures {
  /** Page navigation controls (default: true) */
  pagination?: boolean
  /** Zoom in/out controls (default: true) */
  zoom?: boolean
  /** Jump to specific page number (default: true) */
  pageJump?: boolean
  /** Enable text selection & copy (default: true) */
  textSelection?: boolean
  /** Keyword search panel (default: false) */
  search?: boolean
  /** Thumbnail sidebar navigation (default: false) */
  thumbnails?: boolean
}

export interface PdfPageHighlight {
  page: number
  bbox: [number, number, number, number]
  key?: string
}

export interface PdfViewerProps {
  /** URL of the PDF file (should support Range requests for best performance) */
  url: string
  /** Optional HTTP headers to include in requests (e.g., Authorization) */
  httpHeaders?: Record<string, string>
  /** Initial page to display (1-based, default: 1) */
  initialPage?: number
  /** Feature toggles */
  features?: PdfViewerFeatures
  /** Additional CSS class */
  className?: string
  /** Called when document loads successfully */
  onLoadSuccess?: (info: { numPages: number }) => void
  /** Called when document fails to load */
  onLoadError?: (error: Error) => void
  /** Called when the viewer is closed / requests close */
  onClose?: () => void
  /** Whether to show the toolbar (default: true) */
  showToolbar?: boolean
  /** Controlled page number (1-based). When provided, viewer navigates to it. */
  controlledPage?: number
  /** Called when the active page changes. */
  onPageChange?: (page: number) => void
  /** Highlight a normalized bbox on the specified page. */
  highlight?: PdfPageHighlight | null
}

export const DEFAULT_FEATURES: Required<PdfViewerFeatures> = {
  pagination: true,
  zoom: true,
  pageJump: true,
  textSelection: true,
  search: false,
  thumbnails: false,
}

export const MIN_SCALE = 0.25
export const MAX_SCALE = 5
export const SCALE_STEP = 0.25
export const DEFAULT_SCALE = 1.0
