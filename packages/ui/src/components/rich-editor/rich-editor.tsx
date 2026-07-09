import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import {
  createEditor,
  Descendant,
  Node,
  Range,
  Editor,
  Transforms,
} from 'slate'
import type { BaseEditor } from 'slate'
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps,
  ReactEditor,
} from 'slate-react'
import { withHistory } from 'slate-history'
import type { HistoryEditor } from 'slate-history'
import { EditorToolbar } from './editor-tool-bar'
import { cn } from '../../lib/utils'
export * from 'slate'

// 定义自定义类型
type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
}

type HeadingElement = {
  type: 'heading'
  children: CustomText[]
}

type ListItemElement = {
  type: 'list-item'
  children: CustomText[]
}

type BulletedListElement = {
  type: 'bulleted-list'
  children: ListItemElement[]
}

type NumberedListElement = {
  type: 'numbered-list'
  children: ListItemElement[]
}

type LinkElement = {
  type: 'link'
  url: string
  children: CustomText[]
}

type CustomElement =
  | ParagraphElement
  | HeadingElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement
  | LinkElement

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export interface SlateEditorProps {
  /**
   * Controlled value for the editor. When provided the editor becomes controlled.
   */
  value?: Descendant[]
  /**
   * Default value used for uncontrolled usage and for rehydrating existing content.
   */
  defaultValue?: Descendant[]
  /**
   * Placeholder text displayed when the editor is empty.
   */
  placeholder?: string
  /**
   * Additional CSS class names to apply to the editor container.
   */
  className?: string
  /**
   * Additional CSS class names to apply to the editable content area.
   */
  contentClassName?: string
  /**
   * Maximum number of characters allowed. When set, displays character count.
   */
  maxLength?: number
  /**
   * Whether to show character count. Defaults to true when maxLength is set.
   */
  showCharacterCount?: boolean
  /**
   * Emits the latest value on every change.
   */
  onChange?: (content: Descendant[]) => void
  onSave?: (content: Descendant[]) => void
  /**
   * Callback fired when the editor loses focus.
   */
  onBlur?: (content: Descendant[]) => void
}

export const SlateEditor = ({
  value,
  defaultValue,
  placeholder = '输入回复',
  className,
  contentClassName,
  maxLength,
  showCharacterCount,
  onChange,
  onSave,
  onBlur,
}: SlateEditorProps) => {
  const maxLengthRef = useRef(maxLength)
  const isComposingRef = useRef(false)
  const compositionStartLengthRef = useRef(0)

  // 更新 maxLength 引用
  useEffect(() => {
    maxLengthRef.current = maxLength
  }, [maxLength])

  const [editor] = useState(() => {
    const baseEditor = withHistory(withReact(createEditor()))

    // 使用闭包捕获 maxLengthRef
    const { insertText, insertData, insertFragment } = baseEditor

    baseEditor.insertText = text => {
      const currentMaxLength = maxLengthRef.current
      // 如果正在输入法输入，允许临时超出（会在 compositionEnd 时处理）
      if (currentMaxLength !== undefined && !isComposingRef.current) {
        const currentLength = baseEditor.children
          .map(node => Node.string(node))
          .join('').length

        if (currentLength >= currentMaxLength) {
          return
        }

        const availableLength = currentMaxLength - currentLength
        if (text.length > availableLength) {
          insertText.call(baseEditor, text.slice(0, availableLength))
          return
        }
      }

      insertText.call(baseEditor, text)
    }

    baseEditor.insertData = data => {
      const currentMaxLength = maxLengthRef.current
      if (currentMaxLength !== undefined) {
        const currentLength = baseEditor.children
          .map(node => Node.string(node))
          .join('').length

        if (currentLength >= currentMaxLength) {
          return
        }

        const text = data.getData('text/plain')
        const availableLength = currentMaxLength - currentLength

        if (text && text.length > availableLength) {
          baseEditor.insertText(text.slice(0, availableLength))
          return
        }
      }

      insertData.call(baseEditor, data)
    }

    baseEditor.insertFragment = fragment => {
      const currentMaxLength = maxLengthRef.current
      if (currentMaxLength !== undefined) {
        const currentLength = baseEditor.children
          .map(node => Node.string(node))
          .join('').length

        if (currentLength >= currentMaxLength) {
          return
        }

        const fragmentText = fragment.map(node => Node.string(node)).join('')

        const availableLength = currentMaxLength - currentLength

        if (fragmentText.length > availableLength) {
          baseEditor.insertText(fragmentText.slice(0, availableLength))
          return
        }
      }

      insertFragment.call(baseEditor, fragment)
    }

    return baseEditor
  })
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState<Descendant[]>(
    () => value ?? defaultValue ?? initialValue
  )
  const lastControlledValueRef = useRef<Descendant[] | undefined>(value)
  const lastDefaultValueRef = useRef<Descendant[] | undefined>(defaultValue)
  const editorValue = isControlled ? (value ?? initialValue) : internalValue

  // 计算当前字符数
  const characterCount = useMemo(() => {
    return editorValue.map(node => Node.string(node)).join('').length
  }, [editorValue])

  // 是否显示字符统计
  const shouldShowCount = showCharacterCount ?? maxLength !== undefined

  // 是否超出限制
  const isOverLimit = maxLength !== undefined && characterCount > maxLength

  const renderElement = useCallback((props: RenderElementProps) => {
    return <Element {...props} />
  }, [])

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // 如果没有设置 maxLength，不做任何限制
      if (maxLength === undefined) {
        return
      }

      // 如果正在输入法输入过程中，不拦截（让 compositionend 处理）
      if (isComposingRef.current) {
        return
      }

      // 获取当前字符数
      const currentLength = editorValue
        .map(node => Node.string(node))
        .join('').length

      // 如果已达到限制
      if (currentLength >= maxLength) {
        // 允许的按键：删除、退格、方向键、选择等不会增加内容的操作
        const allowedKeys = [
          'Backspace',
          'Delete',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
          'Tab',
          'Escape',
          // 注意：移除了 Enter，达到限制后不允许换行
        ]

        // 允许带修饰键的操作（如 Ctrl+C, Ctrl+V 会被 insertData 拦截）
        const hasModifier = event.ctrlKey || event.metaKey || event.altKey

        // 如果是允许的按键或带修饰键，不拦截
        if (allowedKeys.includes(event.key) || hasModifier) {
          return
        }

        // 如果有选中内容，允许输入（会替换选中内容）
        const { selection } = editor
        if (selection && !Range.isCollapsed(selection)) {
          return
        }

        // 其他情况（普通字符输入）阻止事件
        event.preventDefault()
      }
    },
    [editor, editorValue, maxLength]
  )

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
    // 记录开始输入时的字符数
    compositionStartLengthRef.current = editorValue
      .map(node => Node.string(node))
      .join('').length
  }, [editorValue])

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false

    // 如果没有设置 maxLength，不做任何限制
    if (maxLength === undefined) {
      return
    }

    // 在 composition 结束后，检查是否超出限制
    // 使用 setTimeout 确保 composition 完全结束
    setTimeout(() => {
      const currentText = editor.children
        .map(node => Node.string(node))
        .join('')
      const currentLength = currentText.length
      const startLength = compositionStartLengthRef.current

      // 如果超出限制
      if (currentLength > maxLength) {
        // 计算这次输入增加的字符数
        const addedLength = currentLength - startLength
        // 计算允许增加的字符数
        const allowedAddLength = Math.max(0, maxLength - startLength)

        if (addedLength > allowedAddLength) {
          // 需要删除多余的字符
          const excessLength = addedLength - allowedAddLength

          // 将光标移到末尾
          try {
            const lastChild = editor.children[editor.children.length - 1]
            const lastChildText = Node.string(lastChild)
            const lastPoint = {
              path: [editor.children.length - 1, 0],
              offset: lastChildText.length,
            }

            editor.selection = { anchor: lastPoint, focus: lastPoint }

            // 从后往前删除超出的字符
            for (let i = 0; i < excessLength; i++) {
              editor.deleteBackward('character')
            }
          } catch {
            // 静默处理错误
          }
        }
      }
    }, 10) // 增加延迟时间确保更新完成
  }, [editor, maxLength])

  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur(editorValue)
    }
  }, [onBlur, editorValue])

  const handleChange = (newValue: Descendant[]) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
    onSave?.(newValue)
  }

  // 点击编辑器容器时聚焦到编辑器
  const handleContainerMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // 如果点击的是 Editable 内部，让 Slate 自己处理
      const target = e.target as HTMLElement
      if (
        target.closest('[data-slate-editor="true"]') ||
        target.hasAttribute('data-slate-editor')
      ) {
        return
      }

      // 阻止默认行为，避免失去焦点
      e.preventDefault()

      try {
        // 聚焦到编辑器
        ReactEditor.focus(editor)

        // 如果没有选区，将光标移到末尾
        if (!editor.selection) {
          const end = Editor.end(editor, [])
          Transforms.select(editor, end)
        }
      } catch {
        // 静默处理错误
      }
    },
    [editor]
  )

  useEffect(() => {
    if (!isControlled) {
      lastControlledValueRef.current = undefined
      return
    }
    if (value === undefined) return
    if (lastControlledValueRef.current === value) return
    lastControlledValueRef.current = value
    editor.children = value
    editor.onChange()
  }, [editor, isControlled, value])

  useEffect(() => {
    if (isControlled) return
    if (defaultValue === undefined) {
      lastDefaultValueRef.current = undefined
      return
    }
    if (lastDefaultValueRef.current === defaultValue) return
    lastDefaultValueRef.current = defaultValue
    setInternalValue(defaultValue)
    editor.children = defaultValue
    editor.onChange()
  }, [defaultValue, editor, isControlled])

  return (
    <div className={cn('min-w-0 max-w-full overflow-auto rounded-lg border border-gray-200', className)}>
      <Slate editor={editor} initialValue={editorValue} onChange={handleChange}>
        <EditorToolbar />
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={cn('min-h-[120px] cursor-text overflow-hidden bg-white p-4', contentClassName)}
          onMouseDown={handleContainerMouseDown}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            className="outline-none w-full break-words overflow-wrap-anywhere"
            spellCheck={false}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onBlur={handleBlur}
          />
        </div>
        {shouldShowCount && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-right">
            <span
              className={`text-sm ${
                isOverLimit
                  ? 'text-red-600 font-medium'
                  : characterCount / (maxLength || Infinity) > 0.9
                    ? 'text-orange-600'
                    : 'text-gray-500'
              }`}
            >
              {characterCount}
              {maxLength !== undefined && ` / ${maxLength}`}
            </span>
          </div>
        )}
      </Slate>
    </div>
  )
}

// 渲染元素组件
const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'bulleted-list':
      return (
        <ul {...attributes} className="list-disc pl-6 my-2">
          {children}
        </ul>
      )
    case 'numbered-list':
      return (
        <ol {...attributes} className="list-decimal pl-6 my-2">
          {children}
        </ol>
      )
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'link':
      return (
        <a
          {...attributes}
          href={(element as LinkElement).url}
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    default:
      return <p {...attributes}>{children}</p>
  }
}

// 渲染叶子节点组件
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let element = children

  if (leaf.bold) {
    element = <strong>{element}</strong>
  }

  if (leaf.italic) {
    element = <em>{element}</em>
  }

  if (leaf.underline) {
    element = <u>{element}</u>
  }

  return <span {...attributes}>{element}</span>
}
