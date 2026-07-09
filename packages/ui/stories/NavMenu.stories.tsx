import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
    Home,
    Inbox,
    Calendar,
    Search,
    Settings,
    BarChart3,
    FileText,
    BotMessageSquare,
    Globe,
    CircleHelp,
    MessageCircle,
    ThumbsDown,
    CheckCircle,
    Ban,
    Zap,
    Sparkles,
    GraduationCap,
    History,
    TrendingUp,
    ClipboardList,
    User,
    CreditCard,
    Bell,
} from 'lucide-react'
import { NavMenu } from '../src/components/nav-menu/nav-menu'
import type { NavMenuSection } from '../src/components/nav-menu/nav-menu'

const defaultMetaSections: NavMenuSection[] = []

const meta = {
    title: 'Components/NavMenu',
    component: NavMenu,
    args: {
        sections: defaultMetaSections,
    },
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        collapsible: {
            control: 'boolean',
            description: '是否可折叠',
        },
        defaultCollapsed: {
            control: 'boolean',
            description: '默认是否折叠',
        },
        expandedWidth: {
            control: { type: 'number', min: 150, max: 300 },
            description: '展开时宽度',
        },
        collapsedWidth: {
            control: { type: 'number', min: 48, max: 80 },
            description: '折叠时宽度',
        },
        variant: {
            control: 'select',
            options: ['default', 'primary'],
            description: '视觉变体：default（子菜单）或 primary（主侧边栏）',
        },
    },
} satisfies Meta<typeof NavMenu>

export default meta
type Story = StoryObj<typeof meta>

// ── Basic Example ──────────────────────────────────────

const basicSections: NavMenuSection[] = [
    {
        items: [
            { id: 'home', label: '首页', icon: <Home className="size-4" /> },
            { id: 'inbox', label: '收件箱', icon: <Inbox className="size-4" />, count: 12 },
            { id: 'calendar', label: '日历', icon: <Calendar className="size-4" /> },
            { id: 'search', label: '搜索', icon: <Search className="size-4" /> },
            { id: 'settings', label: '设置', icon: <Settings className="size-4" /> },
        ],
    },
]

export const Default: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        return (
            <div className="h-[500px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="应用导航"
                    sections={basicSections}
                    activeId={activeId}
                    onItemClick={(item) => setActiveId(item.id)}
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── Multi-section Example (Train Hub style) ─────────────

const trainSections: NavMenuSection[] = [
    {
        items: [
            { id: 'kb-answer', label: '资料库回答问题', icon: <BotMessageSquare className="size-4" /> },
            { id: 'online-answer', label: '联网回答问题', icon: <Globe className="size-4" /> },
            { id: 'untrained', label: 'AI未命中问题', icon: <CircleHelp className="size-4" /> },
            { id: 'casual', label: '闲聊问题', icon: <MessageCircle className="size-4" /> },
            { id: 'disliked', label: '被踩问题', icon: <ThumbsDown className="size-4" />, dividerBefore: true },
        ],
    },
    {
        items: [
            { id: 'trained', label: '已纠正问题', icon: <CheckCircle className="size-4" /> },
            { id: 'blacklist', label: '黑名单问题', icon: <Ban className="size-4" /> },
        ],
    },
]

export const TrainHub: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('kb-answer')
        return (
            <div className="h-[600px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="答案纠正"
                    sections={trainSections}
                    activeId={activeId}
                    onItemClick={(item) => setActiveId(item.id)}
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── With Count Badges ──────────────────────────────────

const countSections: NavMenuSection[] = [
    {
        items: [
            { id: 'all', label: '全部消息', icon: <Inbox className="size-4" />, count: 128 },
            { id: 'unread', label: '未读消息', icon: <FileText className="size-4" />, count: 5 },
            { id: 'starred', label: '已标记', icon: <BarChart3 className="size-4" />, count: 23 },
        ],
    },
    {
        items: [
            { id: 'archive', label: '归档', icon: <FileText className="size-4" />, count: 0 },
        ],
    },
]

export const WithCounts: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('all')
        return (
            <div className="h-[400px] border rounded-lg overflow-hidden">
                <NavMenu
                    sections={countSections}
                    activeId={activeId}
                    onItemClick={(item) => setActiveId(item.id)}
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── Collapsed by Default ───────────────────────────────

export const CollapsedByDefault: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        return (
            <div className="h-[500px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="应用导航"
                    sections={basicSections}
                    activeId={activeId}
                    defaultCollapsed={true}
                    onItemClick={(item) => setActiveId(item.id)}
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── Not Collapsible ────────────────────────────────────

export const NotCollapsible: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        return (
            <div className="h-[400px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="固定菜单"
                    sections={basicSections}
                    activeId={activeId}
                    collapsible={false}
                    onItemClick={(item) => setActiveId(item.id)}
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── Horizontal Bottom Layout ───────────────────────────

const horizontalSections: NavMenuSection[] = [
    {
        items: [
            { id: 'kb-answer', label: '资料库回答问题', icon: <BotMessageSquare className="size-4" /> },
            { id: 'online-answer', label: '联网回答问题', icon: <Globe className="size-4" /> },
            { id: 'untrained', label: 'AI未命中问题', icon: <CircleHelp className="size-4" /> },
        ],
    },
    {
        items: [
            { id: 'trained', label: '已纠正问题', icon: <CheckCircle className="size-4" /> },
            { id: 'blacklist', label: '黑名单问题', icon: <Ban className="size-4" /> },
        ],
        layout: 'horizontal',
    },
]

export const HorizontalBottomSection: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('kb-answer')
        return (
            <div className="h-[500px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="水平底部布局"
                    sections={horizontalSections}
                    activeId={activeId}
                    onItemClick={(item) => setActiveId(item.id)}
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── Controlled Collapse ────────────────────────────────

export const ControlledCollapse: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        const [collapsed, setCollapsed] = useState(false)
        return (
            <div className="h-[500px]">
                <div className="mb-4 p-4 flex items-center gap-4">
                    <button
                        className="px-3 py-1.5 text-sm rounded-md border"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? '展开菜单' : '折叠菜单'}
                    </button>
                    <span className="text-sm text-muted-foreground">
                        当前状态: {collapsed ? '已折叠' : '已展开'}
                    </span>
                </div>
                <div className="h-[400px] border rounded-lg overflow-hidden">
                    <NavMenu
                        title="受控折叠"
                        sections={basicSections}
                        activeId={activeId}
                        collapsed={collapsed}
                        onCollapsedChange={setCollapsed}
                        onItemClick={(item) => setActiveId(item.id)}
                    >
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            当前选中: <strong className="ml-1">{activeId}</strong>
                        </div>
                    </NavMenu>
                </div>
            </div>
        )
    },
}

// ── Without Content Area ───────────────────────────────

export const MenuOnly: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        return (
            <div className="h-[400px] w-[200px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="独立菜单"
                    sections={basicSections}
                    activeId={activeId}
                    collapsible={false}
                    onItemClick={(item) => setActiveId(item.id)}
                />
            </div>
        )
    },
}

// ── Primary Sidebar Variant ────────────────────────────

const primarySections: NavMenuSection[] = [
    {
        items: [
            { id: 'home', label: 'AI助理', icon: <Zap className="size-5" /> },
            { id: 'skills', label: '技能大厅', icon: <Sparkles className="size-5" /> },
            { id: 'train-hub', label: '答案纠正', icon: <GraduationCap className="size-5" /> },
            { id: 'chat-history', label: '对话历史', icon: <History className="size-5" /> },
            { id: 'statistics', label: '统计分析', icon: <TrendingUp className="size-5" /> },
            { id: 'tickets', label: '工单管理', icon: <ClipboardList className="size-5" /> },
            { id: 'team', label: '团队管理', icon: <User className="size-5" /> },
        ],
    },
    {
        items: [
            { id: 'billing', label: '订阅与用量', icon: <CreditCard className="size-5" /> },
            { id: 'audit', label: '审计日志', icon: <FileText className="size-5" /> },
        ],
    },
]

export const PrimarySidebar: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        return (
            <div className="h-[700px] border rounded-lg overflow-hidden">
                <NavMenu
                    variant="primary"
                    sections={primarySections}
                    activeId={activeId}
                    expandedWidth={200}
                    collapsedWidth={56}
                    onItemClick={(item) => setActiveId(item.id)}
                    header={
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
                        </div>
                    }
                    footer={
                        <div className="flex flex-col gap-1">
                            <button className="flex items-center gap-2.5 w-full px-3 h-10 rounded-xl text-sm text-[var(--sidebar-icon-fg)] hover:bg-[var(--sidebar-icon-hover-bg)] !transition-[background-color,color,border-color,box-shadow]">
                                <span className="shrink-0 flex items-center justify-center w-5"><Bell className="size-5" /></span>
                                <span className="truncate whitespace-nowrap">通知</span>
                            </button>
                            <button className="flex items-center gap-2.5 w-full px-3 h-10 rounded-xl text-sm text-[var(--sidebar-icon-fg)] hover:bg-[var(--sidebar-icon-hover-bg)] !transition-[background-color,color,border-color,box-shadow]">
                                <span className="shrink-0 flex items-center justify-center w-5"><Settings className="size-5" /></span>
                                <span className="truncate whitespace-nowrap">设置</span>
                            </button>
                        </div>
                    }
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
                        主内容区 — 当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}

// ── With Header & Footer Slots ─────────────────────────

export const WithHeaderFooter: Story = {
    render: () => {
        const [activeId, setActiveId] = useState('home')
        return (
            <div className="h-[500px] border rounded-lg overflow-hidden">
                <NavMenu
                    title="导航菜单"
                    sections={basicSections}
                    activeId={activeId}
                    onItemClick={(item) => setActiveId(item.id)}
                    header={
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">N</div>
                            <span className="text-sm font-semibold text-foreground">NavApp</span>
                        </div>
                    }
                    footer={
                        <div className="px-1 py-2 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                    <User className="size-3" />
                                </div>
                                <span>user@example.com</span>
                            </div>
                        </div>
                    }
                >
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        当前选中: <strong className="ml-1">{activeId}</strong>
                    </div>
                </NavMenu>
            </div>
        )
    },
}
