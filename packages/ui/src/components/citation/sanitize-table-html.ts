/**
 * Sanitizes an untrusted HTML fragment so that only a small allow-list of
 * table-related tags survive and ALL attributes (including event handlers and
 * dangerous hrefs) are stripped. The result is safe to pass to
 * `dangerouslySetInnerHTML` for rendering citation tables.
 *
 * The implementation relies on the browser DOM parser (`<template>`), which
 * parses the markup inertly (scripts are not executed during parsing). When no
 * DOM is available (e.g. SSR) it returns an empty string.
 *
 * A `doc` parameter is accepted purely so the function can be exercised in unit
 * tests with an injected DOM (e.g. jsdom); production callers rely on the
 * global `document`.
 */
const ALLOWED_TAGS = new Set([
  'TABLE',
  'THEAD',
  'TBODY',
  'TFOOT',
  'TR',
  'TH',
  'TD',
  'CAPTION',
  'COLGROUP',
  'COL',
  'BR',
  'P',
  'SPAN',
  'DIV',
])

const BLOCKED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META'])

export const sanitizeTableHtml = (html: string, doc?: Document): string => {
  const ownerDoc = doc ?? (typeof document !== 'undefined' ? document : undefined)
  if (!ownerDoc) return ''

  const template = ownerDoc.createElement('template')
  template.innerHTML = html

  const cleanNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType !== 1 /* Node.ELEMENT_NODE */) continue

      const element = child as HTMLElement
      if (BLOCKED_TAGS.has(element.tagName)) {
        element.remove()
        continue
      }
      if (!ALLOWED_TAGS.has(element.tagName)) {
        // Unwrap unknown tags: drop the element but keep its (sanitized) children.
        element.replaceWith(...Array.from(element.childNodes))
        cleanNode(node)
        continue
      }
      // Strip every attribute (onclick, onerror, href="javascript:...", style, etc.).
      for (const attr of Array.from(element.attributes)) {
        element.removeAttribute(attr.name)
      }
      cleanNode(element)
    }
  }

  cleanNode(template.content)
  return template.innerHTML
}
