'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { PanelLeftClose } from 'lucide-react'
import {
    Separator,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui'
import { cn } from '../../lib/utils'

// ── Types ──────────────────────────────────────────────

export interface NavMenuItem {
    /** Unique identifier for the item */
    id: string
    /** Display label */
    label: string
    /** Icon element */
    icon?: ReactNode
    /** Optional count badge */
    count?: number
    /** Show a divider before this item */
    dividerBefore?: boolean
}

export interface NavMenuSection {
    /** Items in this section */
    items: NavMenuItem[]
    /** Layout mode for this section (only applies when expanded) */
    layout?: 'vertical' | 'horizontal'
}

export type NavMenuVariant = 'default' | 'primary'

export interface NavMenuProps {
    /** Visual variant. 'primary' uses --sidebar-icon-* CSS variables (main sidebar), 'default' uses shadcn tokens (sub-menus) */
    variant?: NavMenuVariant
    /** Optional title displayed at top when expanded */
    title?: string
    /** Array of sections, separated by dividers */
    sections: NavMenuSection[]
    /** Currently active item id */
    activeId?: string
    /** Callback when an item is clicked */
    onItemClick?: (item: NavMenuItem) => void
    /** Whether the menu is collapsible */
    collapsible?: boolean
    /** Controlled collapsed state */
    collapsed?: boolean
    /** Default collapsed state (uncontrolled) */
    defaultCollapsed?: boolean
    /** Callback when collapsed state changes */
    onCollapsedChange?: (collapsed: boolean) => void
    /** Width when expanded (default: 200) */
    expandedWidth?: number
    /** Width when collapsed (default: 56 for primary, 64 for default) */
    collapsedWidth?: number
    /** Content rendered above the nav sections (e.g. logo) */
    header?: ReactNode
    /** Content rendered below the nav sections (e.g. settings, notifications) */
    footer?: ReactNode
    /** Content rendered to the right of the menu */
    children?: ReactNode
    /** Additional className for the root container */
    className?: string
    /** Breakpoint (px) below which horizontal layouts fall back to vertical (default: 1200) */
    responsiveBreakpoint?: number
}

// ── Variant Style Maps ──────────────────────────────────

const variantStyles = {
    default: {
        container: 'bg-background border-r border-border',
        toggle: 'border-border bg-background hover:bg-muted',
        toggleIcon: 'text-muted-foreground',
        title: 'text-sidebar-foreground',
        itemActive:
            'bg-[var(--sidebar-icon-active-bg)] text-[var(--sidebar-icon-active-fg)] font-medium shadow-sm border border-[var(--sidebar-icon-active-border)]',
        itemInactive:
            'bg-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent',
        itemIconActive: 'text-[var(--sidebar-icon-active-fg)]',
        itemIconInactive: 'text-muted-foreground',
        itemTransition: '!transition-[background-color,color,border-color,box-shadow]',
    },
    primary: {
        container: 'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]',
        toggle: 'border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-icon-hover-bg)]',
        toggleIcon: 'text-[var(--sidebar-icon-fg)]',
        title: 'text-[var(--sidebar-icon-fg)]',
        itemActive:
            'bg-[var(--sidebar-icon-active-bg)] text-[var(--sidebar-icon-active-fg)] shadow-sm border border-[var(--sidebar-icon-active-border)]',
        itemInactive:
            'bg-transparent text-[var(--sidebar-icon-fg)] hover:bg-[var(--sidebar-icon-hover-bg)] hover:text-[var(--sidebar-icon-hover-fg)] border border-transparent',
        itemIconActive: 'text-[var(--sidebar-icon-active-fg)]',
        itemIconInactive: 'text-[var(--sidebar-icon-fg)]',
        itemTransition: '!transition-[background-color,color,border-color,box-shadow]',
    },
}

// ── Component ──────────────────────────────────────────

export function NavMenu({
    variant = 'default',
    title,
    sections,
    activeId,
    onItemClick,
    collapsible = true,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    expandedWidth = 200,
    collapsedWidth,
    header,
    footer,
    children,
    className,
    responsiveBreakpoint = 1200,
}: NavMenuProps) {
    const resolvedCollapsedWidth = collapsedWidth ?? (variant === 'primary' ? 56 : 64)
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
    const [windowWidth, setWindowWidth] = useState(0)
    const isControlled = controlledCollapsed !== undefined
    const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed
    const showText = !isCollapsed
    const menuWidth = isCollapsed ? resolvedCollapsedWidth : expandedWidth
    const isNarrow = windowWidth > 0 && windowWidth < responsiveBreakpoint
    const styles = variantStyles[variant]

    useEffect(() => {
        const update = () => setWindowWidth(window.innerWidth)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    const toggleCollapsed = useCallback(() => {
        const next = !isCollapsed
        if (!isControlled) {
            setInternalCollapsed(next)
        }
        onCollapsedChange?.(next)
    }, [isCollapsed, isControlled, onCollapsedChange])

    return (
        <div className={cn('flex h-full', className)}>
            <div
                className="relative"
                style={{ width: menuWidth, flexShrink: 0 }}
            >
                {/* Collapse Toggle — only visible when expanded */}
                {collapsible && !isCollapsed && (
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        aria-label="收起侧边栏"
                        title="收起侧边栏"
                        className={cn(
                            'absolute right-2 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-xl border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            styles.toggle,
                        )}
                    >
                        <PanelLeftClose className={cn('h-4 w-4', styles.toggleIcon)} />
                    </button>
                )}

                <div
                    className={cn(
                        'transition-all duration-300 flex flex-col h-full overflow-hidden',
                        styles.container,
                    )}
                >
                    <TooltipProvider delayDuration={300}>
                        <div className="h-full py-4 px-2 flex flex-col overflow-hidden">
                            {/* Header slot — clickable to expand when collapsed */}
                            {header && (
                                isCollapsed && collapsible ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={toggleCollapsed}
                                                className="px-1 mb-4 shrink-0 cursor-pointer rounded-lg hover:bg-[var(--sidebar-icon-hover-bg)] transition-colors"
                                                aria-label="展开菜单"
                                            >
                                                {header}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>展开菜单</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <div className="px-1 mb-4 shrink-0">{header}</div>
                                )
                            )}

                            {/* Title */}
                            {showText && title && (
                                <h2 className={cn('text-sm font-semibold mb-3 text-left truncate px-1', styles.title)}>
                                    {title}
                                </h2>
                            )}

                            {/* Sections */}
                            <div className="flex-1 flex flex-col min-h-0">
                                {sections.map((section, sectionIdx) => {
                                    const isFirst = sectionIdx === 0
                                    const effectiveLayout = section.layout === 'horizontal' && showText && !isNarrow ? 'horizontal' : 'vertical'

                                    return (
                                        <div key={sectionIdx} className={isFirst ? 'flex-1' : ''}>
                                            {sectionIdx > 0 && <Separator className="my-2" />}
                                            <NavMenuSectionRenderer
                                                section={section}
                                                layout={effectiveLayout}
                                                activeId={activeId}
                                                showText={showText}
                                                isCollapsed={isCollapsed}
                                                styles={styles}
                                                onItemClick={onItemClick}
                                            />
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer slot */}
                            {footer && <div className="shrink-0 mt-2">{footer}</div>}
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            {/* Content area */}
            {children !== undefined && (
                <div className="flex-1 min-w-0 overflow-hidden h-full relative">
                    {children}
                </div>
            )}
        </div>
    )
}

// ── Section Renderer ──────────────────────────────────

interface VariantStyleSet {
    itemActive: string
    itemInactive: string
    itemIconActive: string
    itemIconInactive: string
    itemTransition: string
}

function NavMenuSectionRenderer({
    section,
    layout,
    activeId,
    showText,
    isCollapsed,
    styles,
    onItemClick,
}: {
    section: NavMenuSection
    layout: 'vertical' | 'horizontal'
    activeId?: string
    showText: boolean
    isCollapsed: boolean
    styles: VariantStyleSet
    onItemClick?: (item: NavMenuItem) => void
}) {
    return (
        <nav
            className={
                layout === 'horizontal'
                    ? 'grid grid-cols-2 gap-2'
                    : 'flex flex-col gap-1'
            }
        >
            {section.items.map((item) => (
                <NavMenuItemRenderer
                    key={item.id}
                    item={item}
                    isActive={activeId === item.id}
                    showText={showText}
                    isCollapsed={isCollapsed}
                    isHorizontal={layout === 'horizontal'}
                    styles={styles}
                    onClick={() => onItemClick?.(item)}
                />
            ))}
        </nav>
    )
}

// ── Item Renderer ──────────────────────────────────────

function NavMenuItemRenderer({
    item,
    isActive,
    showText,
    isCollapsed,
    isHorizontal,
    styles,
    onClick,
}: {
    item: NavMenuItem
    isActive: boolean
    showText: boolean
    isCollapsed: boolean
    isHorizontal: boolean
    styles: VariantStyleSet
    onClick: () => void
}) {
    const btn = (
        <button
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'flex items-center rounded-xl text-sm cursor-pointer overflow-hidden',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                styles.itemTransition,
                isHorizontal && showText ? 'flex-1' : 'w-full',
                showText ? 'px-3 h-10 justify-between' : 'h-10 justify-center',
                isActive ? styles.itemActive : styles.itemInactive,
            )}
            onClick={onClick}
        >
            <div
                className={cn(
                    'flex items-center flex-1 min-w-0',
                    showText ? 'gap-2.5' : 'justify-center',
                )}
            >
                <span
                    className={cn(
                        'shrink-0 flex items-center justify-center',
                        showText ? 'w-5' : 'w-10 h-10',
                        isActive ? styles.itemIconActive : styles.itemIconInactive,
                    )}
                >
                    {item.icon}
                </span>
                {showText && <span className="truncate whitespace-nowrap">{item.label}</span>}
            </div>
            {showText && item.count !== undefined && (
                <span
                    className={cn(
                        'shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                        isActive
                            ? 'bg-background border border-border text-muted-foreground shadow-sm'
                            : 'text-muted-foreground opacity-60',
                    )}
                >
                    {item.count}
                </span>
            )}
        </button>
    )

    return (
        <div>
            {item.dividerBefore && <Separator className="my-2" />}
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{item.label}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                btn
            )}
        </div>
    )
}
