import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DraggableResizableWindow } from '../src/components/draggable-resizable-window'
import { Button } from '../src/components/ui/button'
import { MessageCircleIcon, XIcon } from 'lucide-react'
import { cn } from '../src/lib/utils'

const meta = {
  title: 'Components/DraggableResizableWindow',
  component: DraggableResizableWindow,
  args: {
    children: null,
  },
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DraggableResizableWindow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">DraggableResizableWindow 示例</h1>
          <p className="mb-4 text-muted-foreground">
            可拖拽和调整大小的浮窗组件
          </p>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow>
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none",
                "cursor-move"
              )}
              style={{ cursor: "move" }}
            >
              <div className="font-medium text-sm">DraggableResizableWindow</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">窗口内容</h2>
              <p className="text-muted-foreground">
                这是一个可拖拽和可调整大小的浮窗组件。
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• 拖拽标题栏可以移动窗口</li>
                <li>• 拖拽边框和角落可以调整大小</li>
                <li>• 点击右上角 X 按钮关闭窗口</li>
              </ul>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}

export const MobileSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">移动端大小</h1>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow
            defaultWidth={375}
            defaultHeight={600}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none",
                "cursor-move"
              )}
              style={{ cursor: "move" }}
            >
              <div className="font-medium text-sm">移动端聊天窗口</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium">用户消息</h3>
                <p className="text-sm text-muted-foreground">这是一条用户消息</p>
              </div>
              <div className="rounded-lg bg-accent p-4">
                <h3 className="font-medium">AI 回复</h3>
                <p className="text-sm text-muted-foreground">这是 AI 的回复内容</p>
              </div>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}

export const CustomHeader: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">自定义标题栏</h1>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow>
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none",
                "cursor-move"
              )}
              style={{ cursor: "move" }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleIcon className="h-4 w-4" />
                <span className="font-medium text-sm">自定义标题栏</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p>这是带自定义标题栏的窗口内容</p>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}

export const WithoutResize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">不可调整大小</h1>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow
            enableResize={false}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none",
                "cursor-move"
              )}
              style={{ cursor: "move" }}
            >
              <div className="font-medium text-sm">固定大小窗口</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground">
                这个窗口只能拖拽移动，不能调整大小。
              </p>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}

export const WithoutDrag: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">不可拖拽</h1>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow
            enableDrag={false}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none"
              )}
            >
              <div className="font-medium text-sm">固定位置窗口</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground">
                这个窗口只能调整大小，不能拖拽移动。
              </p>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}

export const SizeConstraints: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">大小约束</h1>
          <p className="mb-4 text-muted-foreground">
            最小 400x500，最大 600x800
          </p>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow
            defaultWidth={500}
            defaultHeight={600}
            minWidth={400}
            minHeight={500}
            maxWidth={600}
            maxHeight={800}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none",
                "cursor-move"
              )}
              style={{ cursor: "move" }}
            >
              <div className="font-medium text-sm">有大小约束的窗口</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground">
                尝试调整窗口大小，你会发现它有最小和最大尺寸限制。
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• 最小宽度: 400px</li>
                <li>• 最小高度: 500px</li>
                <li>• 最大宽度: 600px</li>
                <li>• 最大高度: 800px</li>
              </ul>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}

export const ChatExample: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    const [messages, setMessages] = useState([
      { role: 'assistant', content: '你好！有什么我可以帮助你的吗？' }
    ])
    const [input, setInput] = useState('')

    const handleSend = () => {
      if (!input.trim()) return
      setMessages(prev => [...prev, { role: 'user', content: input }])
      setInput('')
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '我收到了你的消息！'
        }])
      }, 500)
    }

    return (
      <>
        <div className="p-8">
          <h1 className="mb-4 text-2xl font-bold">聊天示例</h1>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'} 聊天窗口
          </Button>
        </div>

        {isOpen && (
          <DraggableResizableWindow
            defaultWidth={375}
            defaultHeight={600}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b bg-muted/50 select-none",
                "cursor-move"
              )}
              style={{ cursor: "move" }}
            >
              <div className="flex items-center gap-2">
                <MessageCircleIcon className="h-4 w-4" />
                <span className="font-medium text-sm">Window Title</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex h-full flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                        }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="输入消息..."
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <Button size="sm" onClick={handleSend}>
                    发送
                  </Button>
                </div>
              </div>
            </div>
          </DraggableResizableWindow>
        )}
      </>
    )
  },
}
