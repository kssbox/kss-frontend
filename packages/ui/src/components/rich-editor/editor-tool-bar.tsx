import { useEffect, useRef, useState } from 'react'
import { useSlate } from 'slate-react'
import { Editor, Transforms, Element as SlateElement } from 'slate'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from 'lucide-react'

export const EditorToolbar = () => {
  const editor = useSlate()
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!linkDialogOpen) {
      return
    }

    linkInputRef.current?.focus()
  }, [linkDialogOpen])

  const toggleBold = () => {
    const marks = Editor.marks(editor)
    const isActive = marks ? marks.bold === true : false
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  }

  const toggleItalic = () => {
    const marks = Editor.marks(editor)
    const isActive = marks ? marks.italic === true : false
    if (isActive) {
      Editor.removeMark(editor, 'italic')
    } else {
      Editor.addMark(editor, 'italic', true)
    }
  }

  const toggleList = (format: 'bulleted-list' | 'numbered-list') => {
    const isActive = isBlockActive(editor, format)

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === 'bulleted-list' || n.type === 'numbered-list'),
      split: true,
    })

    const newProperties: Partial<SlateElement> = {
      type: isActive ? 'paragraph' : 'list-item',
    }

    Transforms.setNodes(editor, newProperties)

    if (!isActive) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  }

  const insertLink = () => {
    setLinkUrl('')
    setLinkDialogOpen(true)
  }

  const handleInsertLink = () => {
    if (!linkUrl) return
    setLinkDialogOpen(false)

    const { selection } = editor
    const isCollapsed =
      selection && selection.anchor.offset === selection.focus.offset

    if (isCollapsed) {
      const link = {
        type: 'link' as const,
        url: linkUrl,
        children: [{ text: linkUrl }],
      }
      Transforms.insertNodes(editor, link)
    } else {
      Transforms.wrapNodes(
        editor,
        {
          type: 'link' as const,
          url: linkUrl,
          children: [],
        },
        { split: true }
      )
    }
  }

  const isBoldActive = () => {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  }

  const isItalicActive = () => {
    const marks = Editor.marks(editor)
    return marks ? marks.italic === true : false
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
      <Button
        variant="ghost"
        size="sm"
        onMouseDown={e => {
          e.preventDefault()
          toggleBold()
        }}
        className={`h-8 w-8 p-0 ${isBoldActive() ? 'bg-gray-200' : ''}`}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={e => {
          e.preventDefault()
          toggleItalic()
        }}
        className={`h-8 w-8 p-0 ${isItalicActive() ? 'bg-gray-200' : ''}`}
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={e => {
          e.preventDefault()
          insertLink()
        }}
        className="h-8 w-8 p-0"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={e => {
          e.preventDefault()
          toggleList('bulleted-list')
        }}
        className={`h-8 w-8 p-0 ${isBlockActive(editor, 'bulleted-list') ? 'bg-gray-200' : ''}`}
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onMouseDown={e => {
          e.preventDefault()
          toggleList('numbered-list')
        }}
        className={`h-8 w-8 p-0 ${isBlockActive(editor, 'numbered-list') ? 'bg-gray-200' : ''}`}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>插入链接</DialogTitle>
          </DialogHeader>
          <Input
            ref={linkInputRef}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="输入链接URL"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInsertLink() } }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>取消</Button>
            <Button disabled={!linkUrl.trim()} onClick={handleInsertLink}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 辅助函数：检查块级元素是否激活
const isBlockActive = (editor: Editor, format: string) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  )

  return !!match
}
