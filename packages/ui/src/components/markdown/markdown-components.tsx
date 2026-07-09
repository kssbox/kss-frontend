import { createElement, type ReactNode } from 'react'
import type { Components } from 'react-markdown'

import { cn } from '../../lib/utils'

export type MarkdownVariant = 'default' | 'chat'

type MarkdownElementProps = {
  className?: string
  children?: ReactNode
  node?: unknown
}


type MarkdownComponentOptions = {
  variant?: MarkdownVariant
  processChildren?: (children: ReactNode) => ReactNode
}

type MarkdownClassNames = {
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
  p: string
  a: string
  blockquote: string
  ul: string
  ol: string
  li: string
  hr: string
  tableWrapper: string
  table: string
  th: string
  td: string
  tr: string
  sup: string
  pre: string
  inlineCode: string
}

const defaultClassNames: MarkdownClassNames = {
  h1: 'aui-md-h1 mb-8 scroll-m-20 font-extrabold text-4xl tracking-tight last:mb-0',
  h2: 'aui-md-h2 mt-8 mb-4 scroll-m-20 font-semibold text-3xl tracking-tight first:mt-0 last:mb-0',
  h3: 'aui-md-h3 mt-6 mb-4 scroll-m-20 font-semibold text-2xl tracking-tight first:mt-0 last:mb-0',
  h4: 'aui-md-h4 mt-6 mb-4 scroll-m-20 font-semibold text-xl tracking-tight first:mt-0 last:mb-0',
  h5: 'aui-md-h5 my-4 font-semibold text-lg first:mt-0 last:mb-0',
  h6: 'aui-md-h6 my-4 font-semibold first:mt-0 last:mb-0',
  p: 'aui-md-p mt-5 mb-5 whitespace-pre-wrap leading-7 first:mt-0 last:mb-0',
  a: 'aui-md-a font-medium text-primary underline underline-offset-4',
  blockquote: 'aui-md-blockquote whitespace-pre-wrap border-l-2 pl-6 italic',
  ul: 'aui-md-ul my-5 ml-6 list-disc [&>li]:mt-2',
  ol: 'aui-md-ol my-5 ml-6 list-decimal [&>li]:mt-2',
  li: 'whitespace-pre-wrap',
  hr: 'aui-md-hr my-5 border-b',
  tableWrapper: 'my-5 w-full overflow-x-auto',
  table: 'aui-md-table w-full border-separate border-spacing-0',
  th: 'aui-md-th border-y border-l border-border bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg last:border-r [[align=center]]:text-center [[align=right]]:text-right',
  td: 'aui-md-td border-b border-l px-4 py-2 text-left last:border-r [[align=center]]:text-center [[align=right]]:text-right',
  tr: 'aui-md-tr m-0 p-0 [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
  sup: 'aui-md-sup [&>a]:text-xs [&>a]:no-underline',
  pre: 'aui-md-pre overflow-x-auto rounded-t-none! rounded-b-lg bg-black p-4 text-white',
  inlineCode: 'aui-md-inline-code inline-block rounded border border-border bg-muted px-1.5 py-0.5 align-baseline font-semibold leading-tight',
}

const chatClassNames: MarkdownClassNames = {
  h1: 'aui-md-h1 mt-3 mb-1.5 scroll-m-20 font-semibold text-base leading-6 tracking-normal first:mt-0 last:mb-0',
  h2: 'aui-md-h2 mt-3 mb-1.5 scroll-m-20 font-semibold text-base leading-6 tracking-normal first:mt-0 last:mb-0',
  h3: 'aui-md-h3 mt-3 mb-1.5 scroll-m-20 font-semibold text-base leading-6 tracking-normal first:mt-0 last:mb-0',
  h4: 'aui-md-h4 mt-3 mb-1.5 scroll-m-20 font-semibold text-sm leading-6 tracking-normal first:mt-0 last:mb-0',
  h5: 'aui-md-h5 mt-2.5 mb-1 font-semibold text-sm leading-6 first:mt-0 last:mb-0',
  h6: 'aui-md-h6 mt-2.5 mb-1 font-semibold text-sm leading-6 first:mt-0 last:mb-0',
  p: 'aui-md-p my-2 whitespace-pre-wrap leading-6 first:mt-0 last:mb-0',
  a: defaultClassNames.a,
  blockquote: 'aui-md-blockquote my-2 whitespace-pre-wrap border-l-2 border-border pl-3 not-italic text-muted-foreground',
  ul: 'aui-md-ul my-2 ml-5 list-disc space-y-1',
  ol: 'aui-md-ol my-2 ml-5 list-decimal space-y-1',
  li: 'whitespace-pre-wrap leading-6',
  hr: 'aui-md-hr my-3 border-b border-border',
  tableWrapper: 'my-3 w-full overflow-x-auto',
  table: defaultClassNames.table,
  th: 'aui-md-th border-y border-l border-border bg-muted px-2.5 py-1.5 text-left text-xs font-semibold first:rounded-tl-md last:rounded-tr-md last:border-r [[align=center]]:text-center [[align=right]]:text-right',
  td: 'aui-md-td border-b border-l px-2.5 py-1.5 text-left text-xs last:border-r [[align=center]]:text-center [[align=right]]:text-right',
  tr: 'aui-md-tr m-0 p-0 [&:last-child>td:first-child]:rounded-bl-md [&:last-child>td:last-child]:rounded-br-md',
  sup: defaultClassNames.sup,
  pre: 'aui-md-pre overflow-x-auto rounded-md bg-black p-3 text-white',
  inlineCode: 'aui-md-inline-code inline-block rounded border border-border bg-muted px-1 py-0.5 align-baseline font-medium leading-tight',
}

export function getMarkdownRootClassName(
  variant: MarkdownVariant = 'default',
  className?: string
) {
  return cn('aui-md', variant === 'chat' && 'aui-md-chat', className)
}

export function createMarkdownComponents({
  variant = 'default',
  processChildren,
}: MarkdownComponentOptions = {}): Components {
  const classNames = variant === 'chat' ? chatClassNames : defaultClassNames

  const renderChildren = (children: ReactNode) => (
    processChildren ? processChildren(children) : children
  )

  const textElement = (tagName: string, baseClassName: string) => {
    return function MarkdownTextElement({ className, children, ...props }: MarkdownElementProps) {
      const { node: ignoredNode, ...domProps } = props
      void ignoredNode

      return createElement(
        tagName,
        { ...domProps, className: cn(baseClassName, className) },
        renderChildren(children)
      )
    }
  }

  return {
    h1: textElement('h1', classNames.h1),
    h2: textElement('h2', classNames.h2),
    h3: textElement('h3', classNames.h3),
    h4: textElement('h4', classNames.h4),
    h5: textElement('h5', classNames.h5),
    h6: textElement('h6', classNames.h6),
    p: textElement('p', classNames.p),
    a: textElement('a', classNames.a),
    blockquote: textElement('blockquote', classNames.blockquote),
    ul: textElement('ul', classNames.ul),
    ol: textElement('ol', classNames.ol),
    li: textElement('li', classNames.li),
    hr: ({ className, ...props }: MarkdownElementProps) => {
      const { node: ignoredNode, ...domProps } = props
      void ignoredNode
      return <hr className={cn(classNames.hr, className)} {...domProps} />
    },
    table: ({ className, children, ...props }: MarkdownElementProps) => {
      const { node: ignoredNode, ...domProps } = props
      void ignoredNode
      return (
        <div className={classNames.tableWrapper}>
          <table className={cn(classNames.table, className)} {...domProps}>
            {renderChildren(children)}
          </table>
        </div>
      )
    },
    th: textElement('th', classNames.th),
    td: textElement('td', classNames.td),
    tr: textElement('tr', classNames.tr),
    sup: textElement('sup', classNames.sup),
    pre: textElement('pre', classNames.pre),
    code: ({ className, children, ...props }: MarkdownElementProps) => {
      const { node: ignoredNode, ...domProps } = props
      void ignoredNode

      const hasLanguageClass = className?.includes('language-') ?? false
      const hasNewline = typeof children === 'string' && children.includes('\n')
      const isInline = !hasLanguageClass && !hasNewline

      return (
        <code
          className={cn(isInline && classNames.inlineCode, className)}
          {...domProps}
        >
          {children}
        </code>
      )
    },
  }
}
