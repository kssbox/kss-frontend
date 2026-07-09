import type { DocReference, ParsedCitation } from './types'

/** Regex to match 【ID: {doc_position_id}<{chunk_id}>】 patterns */
const CITATION_REGEX = /【ID:\s*(\d+)<([^>]+)>】/g

/**
 * Parse all citations from text content.
 * Returns array of ParsedCitation objects.
 */
export function parseCitations(text: string): ParsedCitation[] {
  const citations: ParsedCitation[] = []
  let match: RegExpExecArray | null

  const regex = new RegExp(CITATION_REGEX.source, 'g')
  while ((match = regex.exec(text)) !== null) {
    citations.push({
      fullMatch: match[0],
      docPositionId: parseInt(match[1], 10),
      chunkId: match[2],
    })
  }

  return citations
}

/**
 * Split text into segments: plain text and citation markers.
 * Returns an array of { type: 'text', value } or { type: 'citation', citation }.
 */
export function splitTextWithCitations(
  text: string
): Array<
  | { type: 'text'; value: string }
  | { type: 'citation'; citation: ParsedCitation }
> {
  const segments: Array<
    | { type: 'text'; value: string }
    | { type: 'citation'; citation: ParsedCitation }
  > = []

  const regex = new RegExp(CITATION_REGEX.source, 'g')
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    // Add the citation
    segments.push({
      type: 'citation',
      citation: {
        fullMatch: match[0],
        docPositionId: parseInt(match[1], 10),
        chunkId: match[2],
      },
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments
}

/**
 * Find the chunk content for a given citation from docs.
 * Looks up the chunkId in the doc's chunkData whose docPositionId matches.
 */
export function findChunkContent(
  citation: ParsedCitation,
  docs: DocReference[] | undefined
): string | undefined {
  if (!docs || !Array.isArray(docs) || docs.length === 0) return undefined
  const doc = docs.find((d) => d.docPositionId === citation.docPositionId)
  if (!doc?.chunkData) return undefined
  return doc.chunkData[citation.chunkId]
}

/**
 * Get unique doc references that are actually cited in the text.
 * Returns deduplicated docs by docPositionId, in order of first appearance.
 */
export function getReferencedDocs(
  text: string,
  docs: DocReference[]
): DocReference[] {
  const citations = parseCitations(text)
  const seen = new Set<number>()
  const result: DocReference[] = []

  for (const citation of citations) {
    if (seen.has(citation.docPositionId)) continue
    seen.add(citation.docPositionId)

    const doc = docs.find((d) => d.docPositionId === citation.docPositionId)
    if (doc) {
      result.push(doc)
    }
  }

  return result
}

/**
 * Regex patterns for detecting partial citation markers during streaming.
 * These match incomplete citation patterns like: 【, 【I, 【ID, 【ID:, 【ID: 1, 【ID: 1<, 【ID: 1<xxx, 【ID: 1<xxx>
 */
const PARTIAL_CITATION_PATTERNS = [
  /【$/,                           // Just opening bracket
  /【I$/,                          // 【I
  /【ID$/,                         // 【ID
  /【ID:$/,                        // 【ID:
  /【ID:\s*$/,                     // 【ID: (with optional space)
  /【ID:\s*\d+$/,                  // 【ID: 123
  /【ID:\s*\d+<$/,                 // 【ID: 123<
  /【ID:\s*\d+<[^>]*$/,            // 【ID: 123<xxx (without closing >)
  /【ID:\s*\d+<[^>]+>$/,           // 【ID: 123<xxx> (without closing 】)
]

/**
 * Extract displayable text and buffer from streaming content.
 * During streaming, if the text ends with a partial citation pattern,
 * we hold that in a buffer and only display the rest.
 * This prevents showing raw citation text like 【ID: 1<xxx>】 before it's converted to an icon.
 * 
 * @returns { displayText: string, buffer: string }
 * - displayText: text safe to display (completed citations will be rendered as icons)
 * - buffer: partial citation pattern to hold until more content arrives
 */
export function extractDisplayableText(text: string): { displayText: string; buffer: string } {
  // Check if text ends with a partial citation pattern
  for (const pattern of PARTIAL_CITATION_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const matchIndex = match.index!
      return {
        displayText: text.slice(0, matchIndex),
        buffer: text.slice(matchIndex)
      }
    }
  }
  
  // No partial pattern found, all text is displayable
  return { displayText: text, buffer: '' }
}

/**
 * Helper function to normalize whitespace around citation patterns.
 * Only removes newlines that appear between text and citation markers.
 * Preserves all punctuation and other characters before/after citations.
 */
export function normalizeTextBeforeCitations(text: string): string {
  // Only remove newlines (not other whitespace) immediately before citation patterns
  // This keeps citations on the same line as preceding text while preserving punctuation
  return text.replace(/[\r\n]+(【ID:\s*\d+<[^>]+>】)/g, '$1')
}

/**
 * Placeholder format used to replace citation patterns before markdown parsing.
 * Uses a format that is safe for markdown (won't be interpreted as HTML tags or markdown syntax).
 * Format: %%CITE:docPositionId:chunkId%%
 */
export const CITATION_PLACEHOLDER_REGEX = /%%CITE:(\d+):([^%]+)%%/g

/**
 * Replace citation patterns with markdown-safe placeholders before markdown parsing.
 * Converts 【ID: 1<810093916899614730>】 → %%CITE:1:810093916899614730%%
 *
 * This allows the full text to be rendered as a single Markdown pass,
 * preserving document structure (lists, paragraphs, etc.) while keeping
 * citation markers inline with surrounding text.
 */
export function toCitationPlaceholders(text: string): string {
  return text.replace(CITATION_REGEX, (_, docId, chunkId) => `%%CITE:${docId}:${chunkId}%%`)
}
