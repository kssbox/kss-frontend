import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../src/components/ui/button'

const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    debounce: {
      control: { type: 'boolean' },
      description: 'Enable/disable debounce. Can be boolean or number (ms)',
    },
    debounceLeading: {
      control: { type: 'boolean' },
      description: 'Leading mode: execute immediately on first click, then debounce subsequent clicks',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Primary Variant
export const Primary: Story = {
  args: {
    children: 'Button',
  },
}

export const PrimaryAllSizes: Story = {
  args: {
    children: 'Button',
  },
  render: args => (
    <div className="flex gap-2 flex-wrap">
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="md">
        md
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="xl">
        xl
      </Button>
    </div>
  ),
}

// Secondary Variant
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
}

export const SecondaryAllSizes: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
  render: args => (
    <div className="flex gap-2 flex-wrap">
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="md">
        md
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="xl">
        xl
      </Button>
    </div>
  ),
}

// Destructive Variant
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Button',
  },
}

export const DestructiveAllSizes: Story = {
  args: {
    variant: 'destructive',
    children: 'Button',
  },
  render: args => (
    <div className="flex gap-2 flex-wrap">
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="md">
        md
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="xl">
        xl
      </Button>
    </div>
  ),
}

// Outline Variant
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
}

export const OutlineAllSizes: Story = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
  render: args => (
    <div className="flex gap-2 flex-wrap">
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="md">
        md
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="xl">
        xl
      </Button>
    </div>
  ),
}

// Ghost Variant
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Button',
  },
}

export const GhostAllSizes: Story = {
  args: {
    variant: 'ghost',
    children: 'Button',
  },
  render: args => (
    <div className="flex gap-2 flex-wrap">
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="md">
        md
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="xl">
        xl
      </Button>
    </div>
  ),
}

// Link Variant
export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Button',
  },
}

export const LinkAllSizes: Story = {
  args: {
    variant: 'link',
    children: 'Button',
  },
  render: args => (
    <div className="flex gap-2 flex-wrap">
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="md">
        md
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="xl">
        xl
      </Button>
    </div>
  ),
}

// ==================== 防抖功能测试 ====================

// 默认防抖按钮 (500ms)
export const DebounceDefault: Story = {
  args: {
    children: '默认防抖按钮 (500ms)',
    debounce: true,
  },
  render: args => {
    const [clickCount, setClickCount] = useState(0)

    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
          {...args}
          onClick={() => {
            const timestamp = new Date().toLocaleTimeString()
            console.log(`✅ 防抖执行 - 点击 #${clickCount + 1} at ${timestamp}`)
            setClickCount(prev => prev + 1)
          }}
        />
        <div className="text-sm text-muted-foreground text-center max-w-md">
          <p className="font-medium">防抖执行次数: {clickCount}</p>
          <p className="text-xs mt-2">
            打开浏览器控制台(F12)，快速连续点击按钮，观察控制台输出
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            你会发现：虽然你点击了很多次，但控制台只显示很少的执行记录
          </p>
        </div>
      </div>
    )
  },
}

// 自定义防抖时间按钮
export const DebounceCustom: Story = {
  args: {
    children: '自定义防抖 (1000ms)',
    debounce: 1000,
  },
  render: args => {
    const [clickCount, setClickCount] = useState(0)

    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
          {...args}
          onClick={() => {
            const timestamp = new Date().toLocaleTimeString()
            console.log(`✅ 防抖执行 - 点击 #${clickCount + 1} at ${timestamp}`)
            setClickCount(prev => prev + 1)
          }}
        />
        <div className="text-sm text-muted-foreground text-center max-w-md">
          <p className="font-medium">防抖执行次数: {clickCount}</p>
          <p className="text-xs mt-2">
            1秒防抖延迟，打开控制台观察输出
          </p>
        </div>
      </div>
    )
  },
}

// 长时间防抖按钮
export const DebounceLong: Story = {
  args: {
    children: '长时间防抖 (2000ms)',
    debounce: 2000,
  },
  render: args => {
    const [clickCount, setClickCount] = useState(0)

    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
          {...args}
          onClick={() => {
            const timestamp = new Date().toLocaleTimeString()
            console.log(`✅ 防抖执行 - 点击 #${clickCount + 1} at ${timestamp}`)
            setClickCount(prev => prev + 1)
          }}
        />
        <div className="text-sm text-muted-foreground text-center max-w-md">
          <p className="font-medium">防抖执行次数: {clickCount}</p>
          <p className="text-xs mt-2">
            2秒防抖延迟，打开控制台观察输出
          </p>
        </div>
      </div>
    )
  },
}

// 关闭防抖按钮
export const DebounceDisabled: Story = {
  args: {
    children: '关闭防抖',
    debounce: false,
  },
  render: args => {
    const [clickCount, setClickCount] = useState(0)

    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
          {...args}
          onClick={() => {
            const timestamp = new Date().toLocaleTimeString()
            console.log(`✅ 无防抖 - 点击 #${clickCount + 1} at ${timestamp}`)
            setClickCount(prev => prev + 1)
          }}
        />
        <div className="text-sm text-muted-foreground text-center max-w-md">
          <p className="font-medium">点击次数: {clickCount}</p>
          <p className="text-xs mt-2">
            每次点击都会立即执行（打开控制台对比）
          </p>
        </div>
      </div>
    )
  },
}

// 防抖对比测试
export const DebounceComparison: Story = {
  render: () => {
    const [noDebounceCount, setNoDebounceCount] = useState(0)
    const [debounceCount, setDebounceCount] = useState(0)

    return (
      <div className="flex flex-col gap-6 items-center">
        <h3 className="text-lg font-semibold">防抖功能对比</h3>
        <div className="flex gap-8 items-start">
          <div className="flex flex-col gap-4 items-center">
            <Button
              variant="destructive"
              debounce={false}
              onClick={() => {
                const timestamp = new Date().toLocaleTimeString()
                console.log(`🔴 无防抖执行 - 点击 #${noDebounceCount + 1} at ${timestamp}`)
                setNoDebounceCount(prev => prev + 1)
              }}
            >
              无防抖
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">执行次数: {noDebounceCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                每次点击立即执行
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Button
              variant="default"
              debounce={500}
              onClick={() => {
                const timestamp = new Date().toLocaleTimeString()
                console.log(`✅ 防抖执行 - 点击 #${debounceCount + 1} at ${timestamp}`)
                setDebounceCount(prev => prev + 1)
              }}
            >
              有防抖
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">执行次数: {debounceCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                500ms 防抖
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          打开浏览器控制台(F12)，快速连续点击两个按钮，观察控制台输出的差异
        </p>
      </div>
    )
  },
}

// 不同防抖时间对比
export const DebounceTimings: Story = {
  render: () => {
    const [count1, setCount1] = useState(0)
    const [count2, setCount2] = useState(0)
    const [count3, setCount3] = useState(0)

    return (
      <div className="flex flex-col gap-6 items-center">
        <h3 className="text-lg font-semibold">不同防抖时间对比</h3>
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-4 items-center">
            <Button
              size="sm"
              debounce={300}
              onClick={() => {
                console.log(`⚡ 300ms 防抖执行 #${count1 + 1}`)
                setCount1(prev => prev + 1)
              }}
            >
              300ms
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">{count1}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Button
              size="sm"
              debounce={500}
              onClick={() => {
                console.log(`⚡ 500ms 防抖执行 #${count2 + 1}`)
                setCount2(prev => prev + 1)
              }}
            >
              500ms
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">{count2}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Button
              size="sm"
              debounce={1000}
              onClick={() => {
                console.log(`⚡ 1000ms 防抖执行 #${count3 + 1}`)
                setCount3(prev => prev + 1)
              }}
            >
              1000ms
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">{count3}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          打开控制台，快速连续点击所有按钮，观察不同防抖时间的差异
        </p>
      </div>
    )
  },
}

// 防抖按钮 + 不同变体
export const DebounceWithVariants: Story = {
  render: () => {
    const [counts, setCounts] = useState({
      default: 0,
      destructive: 0,
      outline: 0,
      secondary: 0,
      ghost: 0,
    })

    return (
      <div className="flex flex-col gap-6 items-center">
        <h3 className="text-lg font-semibold">防抖 + 不同变体</h3>
        <div className="flex flex-col gap-4">
          {[
            { key: 'default' as const, variant: 'default' as const, label: 'Default' },
            { key: 'destructive' as const, variant: 'destructive' as const, label: 'Destructive' },
            { key: 'outline' as const, variant: 'outline' as const, label: 'Outline' },
            { key: 'secondary' as const, variant: 'secondary' as const, label: 'Secondary' },
            { key: 'ghost' as const, variant: 'ghost' as const, label: 'Ghost' },
          ].map(({ key, variant, label }) => (
            <div key={key} className="flex items-center gap-4">
              <Button
                variant={variant}
                debounce={500}
                onClick={() => {
                  console.log(`🎨 ${label} 防抖执行 #${counts[key] + 1}`)
                  setCounts(prev => ({ ...prev, [key]: prev[key] + 1 }))
                }}
                className="w-32"
              >
                {label}
              </Button>
              <span className="text-sm text-muted-foreground">
                {counts[key]} 次
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          所有按钮都启用了500ms防抖
        </p>
      </div>
    )
  },
}

// ==================== 防抖模式测试 ====================

// Leading 模式（默认）- 先执行第一次
export const DebounceLeading: Story = {
  args: {
    children: 'Leading 模式 (先执行)',
    debounce: 1000,
    debounceLeading: true,
  },
  render: args => {
    const [clickCount, setClickCount] = useState(0)
    const [executeTime, setExecuteTime] = useState<string[]>([])

    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
          {...args}
          onClick={() => {
            const now = new Date().toLocaleTimeString()
            console.log(`🚀 Leading 模式执行 #${clickCount + 1} at ${now}`)
            setClickCount(prev => prev + 1)
            setExecuteTime(prev => [...prev, now])
          }}
        />
        <div className="text-sm text-muted-foreground text-center">
          <p className="font-medium">执行次数: {clickCount}</p>
          <p className="text-xs mt-2">
            第一次点击立即执行，后续点击被防抖
          </p>
          {executeTime.length > 0 && (
            <div className="mt-2 text-xs">
              <p>执行时间:</p>
              {executeTime.slice(-3).map((time, index) => (
                <p key={index}>{time}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
}

// Trailing 模式 - 延迟执行
export const DebounceTrailing: Story = {
  args: {
    children: 'Trailing 模式 (延迟执行)',
    debounce: 1000,
    debounceLeading: false,
  },
  render: args => {
    const [clickCount, setClickCount] = useState(0)
    const [executeTime, setExecuteTime] = useState<string[]>([])

    return (
      <div className="flex flex-col gap-4 items-center">
        <Button
          {...args}
          onClick={() => {
            const now = new Date().toLocaleTimeString()
            console.log(`⏳ Trailing 模式执行 #${clickCount + 1} at ${now}`)
            setClickCount(prev => prev + 1)
            setExecuteTime(prev => [...prev, now])
          }}
        />
        <div className="text-sm text-muted-foreground text-center">
          <p className="font-medium">执行次数: {clickCount}</p>
          <p className="text-xs mt-2">
            等待防抖时间结束后才执行
          </p>
          {executeTime.length > 0 && (
            <div className="mt-2 text-xs">
              <p>执行时间:</p>
              {executeTime.slice(-3).map((time, index) => (
                <p key={index}>{time}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
}

// Leading vs Trailing 对比
export const DebounceModeComparison: Story = {
  render: () => {
    const [leadingCount, setLeadingCount] = useState(0)
    const [trailingCount, setTrailingCount] = useState(0)
    const [leadingTimes, setLeadingTimes] = useState<string[]>([])
    const [trailingTimes, setTrailingTimes] = useState<string[]>([])

    return (
      <div className="flex flex-col gap-6 items-center">
        <h3 className="text-lg font-semibold">Leading vs Trailing 模式对比</h3>
        <div className="flex gap-8 items-start">
          <div className="flex flex-col gap-4 items-center">
            <Button
              variant="default"
              debounce={1000}
              debounceLeading={true}
              onClick={() => {
                const now = new Date().toLocaleTimeString()
                console.log(`🚀 Leading 执行 #${leadingCount + 1} at ${now}`)
                setLeadingCount(prev => prev + 1)
                setLeadingTimes(prev => [...prev, now])
              }}
            >
              Leading 模式
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">执行次数: {leadingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                第一次点击立即执行
              </p>
              {leadingTimes.length > 0 && (
                <div className="mt-2 text-xs">
                  <p>最近执行:</p>
                  {leadingTimes.slice(-2).map((time, index) => (
                    <p key={index}>{time}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Button
              variant="secondary"
              debounce={1000}
              debounceLeading={false}
              onClick={() => {
                const now = new Date().toLocaleTimeString()
                console.log(`⏳ Trailing 执行 #${trailingCount + 1} at ${now}`)
                setTrailingCount(prev => prev + 1)
                setTrailingTimes(prev => [...prev, now])
              }}
            >
              Trailing 模式
            </Button>
            <div className="text-sm text-center">
              <p className="font-medium">执行次数: {trailingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                延迟1秒后执行
              </p>
              {trailingTimes.length > 0 && (
                <div className="mt-2 text-xs">
                  <p>最近执行:</p>
                  {trailingTimes.slice(-2).map((time, index) => (
                    <p key={index}>{time}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground text-center max-w-lg">
          <p className="font-medium mb-2">测试说明:</p>
          <ul className="text-xs space-y-1 text-left">
            <li>• Leading 模式：第一次点击立即执行，1秒内的后续点击被忽略</li>
            <li>• Trailing 模式：点击后等待1秒，如果期间没有新点击才执行</li>
            <li>• 打开控制台观察两种模式的执行时机差异</li>
          </ul>
        </div>
      </div>
    )
  },
}

// 防抖模式实际应用场景
export const DebounceRealWorldExample: Story = {
  render: () => {
    const [submitCount, setSubmitCount] = useState(0)
    const [searchCount, setSearchCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    return (
      <div className="flex flex-col gap-6 items-center">
        <h3 className="text-lg font-semibold">实际应用场景</h3>
        <div className="flex flex-col gap-6">
          {/* 表单提交 - Leading 模式 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">表单提交 (Leading 模式)</h4>
            <div className="flex items-center gap-4">
              <Button
                variant="default"
                debounce={2000}
                debounceLeading={true}
                onClick={() => {
                  console.log(`✅ 表单提交 #${submitCount + 1}`)
                  setSubmitCount(prev => prev + 1)
                }}
              >
                提交表单
              </Button>
              <div className="text-sm">
                <p>提交次数: {submitCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  第一次点击立即提交，防止重复提交
                </p>
              </div>
            </div>
          </div>

          {/* 搜索输入 - Trailing 模式 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">搜索建议 (Trailing 模式)</h4>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                debounce={1000}
                debounceLeading={false}
                onClick={() => {
                  console.log(`🔍 搜索请求 #${searchCount + 1}`)
                  setSearchCount(prev => prev + 1)
                  setSearchQuery(`搜索查询 #${searchCount + 1}`)
                }}
              >
                模拟搜索输入
              </Button>
              <div className="text-sm">
                <p>搜索请求次数: {searchCount}</p>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground mt-1">
                    最新查询: {searchQuery}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  等待用户停止输入1秒后才发起搜索请求
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-lg">
          Leading 模式适合需要立即响应的场景（如提交表单），Trailing 模式适合需要等待用户完成操作的场景（如搜索输入）
        </p>
      </div>
    )
  },
}
