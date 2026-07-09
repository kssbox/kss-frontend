'use client'

import {
  Children,
  cloneElement,
  isValidElement,
  memo,
  useMemo,
  type FC,
  type ReactNode,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import {
  createMarkdownComponents,
  getMarkdownRootClassName,
  type MarkdownVariant,
} from '../markdown/markdown-components'
import { toCitationPlaceholders, CITATION_PLACEHOLDER_REGEX } from './citation-utils'
import { CitationMark } from './CitationMark'
import type { DocReference, ParsedCitation } from './types'

interface MarkdownWithInlineCitationsProps {
  /** Markdown content that may contain citation patterns */
  content: string
  /** Document references for citation lookup (available after finish event) */
  docs?: DocReference[]
  /** Additional CSS class */
  className?: string
  /** Visual density preset */
  variant?: MarkdownVariant
  /** Show chunk id in citation popover for debugging */
  debug?: boolean
}

/**
 * Recursively process React children to find citation placeholder strings
 * and replace them with inline CitationMark components.
 *
 * This walks the React element tree produced by ReactMarkdown and injects
 * CitationMark components wherever %%CITE:docId:chunkId%% placeholders appear
 * in text nodes.
 */
function injectCitations(
  children: ReactNode,
  docs: DocReference[] | undefined,
  debug: boolean
): ReactNode {
  return Children.map(children, (child) => {
    // Process text nodes: split by placeholder and inject CitationMark
    if (typeof child === 'string') {
      if (!child.includes('%%CITE:')) return child

      const parts: ReactNode[] = []
      let lastIndex = 0
      const regex = new RegExp(CITATION_PLACEHOLDER_REGEX.source, 'g')
      let match: RegExpExecArray | null

      while ((match = regex.exec(child)) !== null) {
        // Add text before the placeholder
        if (match.index > lastIndex) {
          parts.push(child.slice(lastIndex, match.index))
        }

        const citation: ParsedCitation = {
          fullMatch: match[0],
          docPositionId: parseInt(match[1], 10),
          chunkId: match[2],
        }

        parts.push(
          <CitationMark
            key={`cite-${match.index}-${citation.chunkId}`}
            citation={citation}
            docs={docs}
            debug={debug}
          />
        )

        lastIndex = regex.lastIndex
      }

      // Add remaining text after the last placeholder
      if (lastIndex < child.length) {
        parts.push(child.slice(lastIndex))
      }

      return <>{parts}</>
    }

    // Recursively process React elements that have children
    if (isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const childProps = child.props as any
      if (childProps?.children != null) {
        return cloneElement(
          child,
          {},
          injectCitations(childProps.children, docs, debug)
        )
      }
    }

    return child
  })
}

/**
 * Create react-markdown components that inject citation marks into rendered children.
 */
function createCitationComponents(
  docs: DocReference[] | undefined,
  debug: boolean,
  variant: MarkdownVariant
) {
  return createMarkdownComponents({
    variant,
    processChildren: (children) => injectCitations(children, docs, debug),
  })
}

/**
 * Renders markdown content with inline citation support.
 *
 * Unlike the split-and-render approach, this component:
 * 1. Replaces citation patterns with markdown-safe placeholders BEFORE parsing
 * 2. Renders the ENTIRE text through a SINGLE ReactMarkdown pass (preserving document structure)
 * 3. Injects CitationMark components inline within the rendered React tree
 *
 * This ensures citations appear inline with their surrounding text, even within
 * complex markdown structures like ordered lists, blockquotes, or table cells.
 */
export const MarkdownWithInlineCitations: FC<MarkdownWithInlineCitationsProps> = memo(
  ({ content, docs, className, variant = 'default', debug = false }) => {
    // Step 1: Replace 【ID: 1<chunk>】 with %%CITE:1:chunk%% before markdown parsing
    const processedContent = useMemo(() => toCitationPlaceholders(content), [content])

    // Step 2: Create components that inject CitationMark into rendered children
    const components = useMemo(
      () => createCitationComponents(docs, debug, variant),
      [docs, debug, variant]
    )

    return (
      <div className={getMarkdownRootClassName(variant, className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={components}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    )
  }
)

MarkdownWithInlineCitations.displayName = 'MarkdownWithInlineCitations'
