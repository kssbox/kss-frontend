# RangePreview 性能优化计划（更新版）

## 背景

RangePreview 组件在渲染大量数据（220 blocks，20 页）时会出现卡顿、界面消失再出现的问题。

**数据规模**：
- 页数：20 页
- Blocks 总数：220 个
- 表格数量：1 个
- Canvas 物理高度：40,760px（DPR=2）

**根本原因分析**：
1. **没有虚拟滚动** - 整个文档一次性渲染到单个 Canvas，Canvas 高度可达 4万+ 像素（接近浏览器 GPU 纹理限制）
2. **同步渲染所有 blocks** - 220 个 blocks 在同一个渲染循环中处理，阻塞主线程 1-2 秒
3. **表格预渲染阻塞** - 表格 HTML → ImageData 转换虽然有缓存，但首次加载会阻塞
4. **没有渲染节流** - hover 状态变化也会触发 220 个 blocks 完整重绘

## 目标

- 显著减少首屏渲染时间（目标：从 ~2s → ~500ms → ~200ms）
- 消除界面卡顿和闪烁
- 保持现有功能不变（编辑模式、diff 模式等）
- 保持向后兼容

## 优化方案（分层实施）

### 阶段 1：快速见效优化（立即实施，预计 2-3 小时）

**预期效果**：首屏时间从 2s → 500ms

#### 1.1 添加加载状态 UI
**文件**: `RangePreviewRenderer.tsx`

```typescript
const [isRendering, setIsRendering] = useState(true);

// 渲染开始
setIsRendering(true);
await renderBlocksInChunks();
setIsRendering(false);

// JSX
{isRendering && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="text-sm text-gray-600">渲染中...</div>
    </div>
)}
```

#### 1.2 分帧渲染 + 优先级队列
**文件**: `RangePreviewRenderer.tsx`

```typescript
const renderBlocksInChunks = async () => {
    const CHUNK_SIZE = 50;
    
    // 按类型优先级排序：文本/标题优先，图片延后
    const priority = { text: 0, heading: 0, list: 1, table: 1, image: 2 };
    const sortedBlocks = [...blocksWithDiff].sort((a, b) => 
        (priority[a.block.type] || 3) - (priority[b.block.type] || 3)
    );
    
    for (let i = 0; i < sortedBlocks.length; i += CHUNK_SIZE) {
        const chunk = sortedBlocks.slice(i, i + CHUNK_SIZE);
        chunk.forEach(({ block, options }) => {
            canvasRenderer.render(block, options);
        });
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
};
```

#### 1.3 表格异步加载（非阻塞）
**文件**: `RangePreviewRenderer.tsx`

```typescript
// 先渲染其他 blocks，表格显示占位符
const renderBlocks = useCallback(async () => {
    canvas.clear();
    canvas.renderPageLayout(totalPages, containerWidth);
    
    // 1. 立即渲染非表格 blocks
    const nonTableBlocks = blocksWithDiff.filter(b => b.block.type !== 'table');
    await renderBlocksInChunks(nonTableBlocks);
    
    // 2. 异步加载表格（不阻塞）
    const tableBlocks = blocksWithDiff.filter(b => b.block.type === 'table');
    Promise.all(
        tableBlocks.map(async ({ block }) => {
            const cache = await table.getOrCreateTableCache(block, ...);
            tableDataMap.set(block.id, cache);
        })
    ).then(() => {
        tableBlocks.forEach(({ block, options }) => {
            canvas.render(block, options);
        });
    });
}, [blocks, ...]);
```

#### 1.4 Hover 防抖
**文件**: `RangePreviewRenderer.tsx`

```typescript
// 自实现简单 debounce
const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const debouncedSetHovered = useMemo(
    () => debounce((blockId: string | null) => {
        setHoveredBlockId(blockId);
    }, 100),
    []
);
```

### 阶段 2：核心优化 - 视口渲染（预计 4-5 小时）

**预期效果**：首屏时间从 500ms → 200ms

**⚠️ 风险提示**：需要适配编辑模式和 diff 模式的坐标系统

#### 2.1 滚动监听 + 视口检测

```typescript
const [visiblePageRange, setVisiblePageRange] = useState([0, 2]); // [start, end]

useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = debounce(() => {
        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const pageHeight = displayWidth;
        const pageGap = 20;
        const pageUnit = pageHeight + pageGap;
        
        const startPage = Math.max(0, Math.floor(scrollTop / pageUnit) - 1);
        const endPage = Math.min(
            totalPages - 1,
            Math.ceil((scrollTop + viewportHeight) / pageUnit) + 1
        );
        
        setVisiblePageRange([startPage, endPage]);
    }, 50);
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
}, [displayWidth, totalPages]);
```

#### 2.2 过滤可见 blocks

```typescript
const visibleBlocks = useMemo(() => {
    const [startPage, endPage] = visiblePageRange;
    
    return blocksWithDiff.filter(({ block }) => {
        // 编辑中的 block 始终渲染
        if (editingBlockId && block.id === editingBlockId) {
            return true;
        }
        return block.page >= startPage && block.page <= endPage;
    });
}, [blocksWithDiff, visiblePageRange, editingBlockId]);
```

## 风险评估与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| **编辑模式定位错误** | 高 | 编辑中的 block 强制渲染（不受视口过滤影响） |
| **Diff 模式滚动不同步** | 中 | 两侧滚动事件绑定同步逻辑 |
| **小文档性能退化** | 低 | < 5 页文档跳过虚拟滚动，直接全量渲染 |

## 实施计划

### 第一批：阶段 1 优化（当前执行）
✅ **目标**：消除卡顿感知，首屏时间从 2s → 500ms

1. 添加渲染状态追踪和加载 UI
2. 实现分帧渲染 + 优先级队列
3. 表格异步加载（占位符 → 实际内容）
4. 添加 hover 防抖（100ms）

**验证点**：
- 首屏无空白闪烁
- 渲染过程中显示加载状态
- Hover 时无卡顿重绘
- 功能完整性（编辑、diff、hover）

### 第二批：阶段 2 优化（视效果决定）
1. 实现滚动监听 + 视口检测
2. 过滤可见 blocks（+/- 1 页缓冲）
3. 适配编辑模式
4. 测试 diff 模式滚动同步

## 性能监控

```typescript
const renderBlocks = useCallback(async () => {
    performance.mark('render-start');
    // 渲染逻辑...
    performance.mark('render-end');
    performance.measure('render-duration', 'render-start', 'render-end');
    const measure = performance.getEntriesByName('render-duration')[0];
    console.log(`渲染耗时: ${measure.duration.toFixed(2)}ms`);
}, []);
```

## MCP 测试流程

### 1. 启动 Storybook
```bash
pnpm --filter ui run storybook
```

### 2. Chrome DevTools MCP 测试
- 打开 RangePreview story
- 加载 real-range.json（220 blocks）
- 观察：首屏加载状态、卡顿、控制台日志、Performance 录制

### 3. 交互测试
- 滚动文档（检查流畅度）
- Hover blocks（检查防抖效果）
- 编辑模式选中 block
- Diff 模式两侧滚动

## 测试清单

### 性能测试
- [ ] 首屏渲染时间 < 500ms（阶段1）
- [ ] 滚动帧率 > 30fps
- [ ] 无明显卡顿和闪烁

### 功能测试
- [ ] 编辑模式正常
- [ ] Diff 模式正常
- [ ] Hover 状态正确
- [ ] 表格渲染正确
