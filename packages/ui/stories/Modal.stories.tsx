import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Modal } from '../src/components/ui/modal'
import { Button } from '../src/components/ui/button'
import { Input } from '../src/components/ui/input'
import { Label } from '../src/components/ui/label'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>打开 Modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="基础 Modal"
          description="这是一个简单的 Modal 示例，默认有确定和取消按钮"
          onOk={() => {
            console.log('确定')
          }}
          onCancel={() => {
            console.log('取消')
          }}
        >
          <p>这是 Modal 的内容部分</p>
        </Modal>
      </>
    )
  },
}

export const WithoutOnOpenChange: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>仅通过回调控制</Button>
        <Modal
          open={open}
          title="依赖 onCancel/onOk 关闭"
          description="此示例没有传递 onOpenChange，顶部关闭按钮和底部按钮都会通过 onCancel 收起弹窗"
          onCancel={() => setOpen(false)}
          onOk={() => setOpen(false)}
          okText="提交"
        >
          <p>点击右上角或底部任一按钮，都应该立即关闭。</p>
        </Modal>
      </>
    )
  },
}

export const WithAsyncAction: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    const handleOk = async () => {
      console.log('开始异步操作...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('异步操作完成')
    }

    return (
      <>
        <Button onClick={() => setOpen(true)}>异步操作</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="异步操作示例"
          description="点击确定按钮会模拟 2 秒的异步操作"
          onOk={handleOk}
          onCancel={() => console.log('取消')}
        >
          <p>异步操作完成后会自动关闭 Modal</p>
        </Modal>
      </>
    )
  },
}

export const CustomFooter: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>自定义底部</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="自定义底部"
          description="可以完全自定义底部内容"
          footer={
            <div className="flex gap-2 justify-between w-full">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                稍后处理
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setOpen(false)}>保存</Button>
                <Button variant="destructive" onClick={() => setOpen(false)}>
                  删除
                </Button>
              </div>
            </div>
          }
        >
          <p>自定义的底部按钮布局</p>
        </Modal>
      </>
    )
  },
}

export const NoFooter: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>无底部</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="无底部 Modal"
          description="footer 设置为 null 时不显示底部"
          footer={null}
        >
          <div className="space-y-4">
            <p>这个 Modal 没有底部按钮</p>
            <Button onClick={() => setOpen(false)} className="w-full">
              关闭
            </Button>
          </div>
        </Modal>
      </>
    )
  },
}

export const OnlyOkButton: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>只有确定按钮</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="提示"
          description="只有确定按钮的 Modal"
          onOk={() => console.log('确定')}
        >
          <p>操作已成功完成！</p>
        </Modal>
      </>
    )
  },
}

export const TableActionExample: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const [selectedItem, setSelectedItem] = React.useState<{
      id: number
      name: string
      status: string
    } | null>(null)

    const items = [
      { id: 1, name: 'Item 1', status: 'Active' },
      { id: 2, name: 'Item 2', status: 'Pending' },
      { id: 3, name: 'Item 3', status: 'Inactive' },
    ]

    const handleView = (item: { id: number; name: string; status: string }) => {
      setSelectedItem(item)
      setOpen(true)
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.id}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.status}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(item)}
                    >
                      查看详情
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          open={open}
          onOpenChange={setOpen}
          title="项目详情"
          onOk={() => console.log('编辑', selectedItem)}
          onCancel={() => console.log('关闭')}
          okText="编辑"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-sm">{selectedItem.id}</p>
              </div>
              <div>
                <Label>名称</Label>
                <p className="text-sm">{selectedItem.name}</p>
              </div>
              <div>
                <Label>状态</Label>
                <p className="text-sm">{selectedItem.status}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    )
  },
}

export const FormExample: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const [formData, setFormData] = React.useState({
      username: '',
      email: '',
    })

    const handleSubmit = async () => {
      console.log('提交表单:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setFormData({ username: '', email: '' })
    }

    return (
      <>
        <Button onClick={() => setOpen(true)}>添加用户</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="添加用户"
          description="填写用户信息"
          onOk={handleSubmit}
          onCancel={() => {
            setFormData({ username: '', email: '' })
          }}
          okText="提交"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={e =>
                  setFormData(prev => ({ ...prev, username: e.target.value }))
                }
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="请输入邮箱"
              />
            </div>
          </div>
        </Modal>
      </>
    )
  },
}

export const ImperativeConfirm: Story = {
  render: () => {
    const showConfirm = () => {
      Modal.confirm({
        title: '确认删除？',
        content: '删除后无法恢复，请谨慎操作',
        onOk: async () => {
          console.log('删除中...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('已删除')
        },
        onCancel: () => {
          console.log('取消删除')
        },
        okText: '删除',
        okButtonProps: { variant: 'destructive' },
      })
    }

    return <Button onClick={showConfirm}>Modal.confirm()</Button>
  },
}

export const ImperativeInfo: Story = {
  render: () => {
    const showInfo = () => {
      Modal.info({
        title: '提示信息',
        content: (
          <div>
            <p>这是一条提示信息</p>
            <p className="text-sm text-muted-foreground mt-2">
              Info 类型的 Modal 只有一个确定按钮
            </p>
          </div>
        ),
      })
    }

    return <Button onClick={showInfo}>Modal.info()</Button>
  },
}

export const ImperativeSuccess: Story = {
  render: () => {
    const showSuccess = () => {
      Modal.success({
        title: '操作成功',
        content: '您的操作已经成功完成！',
      })
    }

    return <Button onClick={showSuccess}>Modal.success()</Button>
  },
}

export const ImperativeError: Story = {
  render: () => {
    const showError = () => {
      Modal.error({
        title: '操作失败',
        content: (
          <div>
            <p>操作失败，请重试</p>
            <p className="text-sm text-muted-foreground mt-2">
              错误代码: 500
            </p>
          </div>
        ),
      })
    }

    return <Button onClick={showError}>Modal.error()</Button>
  },
}

export const ImperativeWarning: Story = {
  render: () => {
    const showWarning = () => {
      Modal.warning({
        title: '警告',
        content: '您即将执行一个危险操作，是否继续？',
        onOk: () => {
          console.log('继续操作')
        },
        onCancel: () => {
          console.log('取消操作')
        },
      })
    }

    return <Button onClick={showWarning}>Modal.warning()</Button>
  },
}

export const CustomButtonText: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>自定义按钮文本</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="自定义按钮"
          onOk={() => console.log('提交')}
          onCancel={() => console.log('放弃')}
          okText={
            <span>
              提交 <span className="ml-1">→</span>
            </span>
          }
          cancelText="放弃"
        >
          <p>按钮文本可以是 ReactNode</p>
        </Modal>
      </>
    )
  },
}
