import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { type FC, memo, type ReactNode } from "react";

import {
  createMarkdownComponents,
  getMarkdownRootClassName,
  type MarkdownVariant,
} from "./markdown-components";

export type MarkdownProps = {
  /** Markdown content to render - use either content prop or children */
  content?: string;
  /** Children as alternative to content prop */
  children?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Visual density preset */
  variant?: MarkdownVariant;
};

/**
 * Markdown component that renders markdown content with styled components.
 * Supports GFM (GitHub Flavored Markdown) including tables, strikethrough, etc.
 * Also supports math formulas via KaTeX.
 *
 * @example
 * // Using content prop (recommended)
 * <Markdown content="# Hello" />
 *
 * @example
 * // Using children (for backward compatibility)
 * <Markdown># Hello</Markdown>
 */
const defaultComponents = createMarkdownComponents();
const chatComponents = createMarkdownComponents({ variant: 'chat' });

export const Markdown: FC<MarkdownProps> = memo(({ content, children, className, variant = 'default' }) => {
  const markdownContent = content ?? (typeof children === 'string' ? children : '');
  return (
    <div className={getMarkdownRootClassName(variant, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={variant === 'chat' ? chatComponents : defaultComponents}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
});

Markdown.displayName = "Markdown";

export type { MarkdownVariant } from './markdown-components';
