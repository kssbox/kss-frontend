packages/ui/src/components/
├── canvas-base/                      # 🆕 通用基座
│   ├── [index.ts](http://_vscodecontentref_/44)
│   ├── [types.ts](http://_vscodecontentref_/45)                      # CanvasItem, CoordinateConfig, HitResult...
│   ├── CanvasEngine.ts               # 引擎（clear, pageLayout, clip, hover, debug）
│   ├── CoordinateSystem.ts           # 双向坐标映射
│   ├── HitTestEngine.ts              # 泛型命中测试
│   ├── TextRenderer.ts              # 文本换行 + measureText 缓存
│   ├── TimeSliceScheduler.ts        # 分帧调度 + 竞态保护
│   ├── BlockRendererRegistry.ts     # 渲染器插件注册表
│   ├── hooks/
│   │   ├── useCanvasEngine.ts
│   │   ├── useDprDetection.ts       # 从 range-preview 移入
│   │   ├── useInteraction.ts
│   │   └── useEditOverlay.ts
│   └── components/
│       ├── VirtualPageList.tsx       # 虚拟滚动 + Per-Page Canvas
│       ├── PageCanvas.tsx            # 单页 Canvas
│       └── EditOverlay.tsx           # 编辑 textarea 叠加层
│
├── range-preview/                    # 业务层（重构后）
│   ├── [index.ts](http://_vscodecontentref_/46)                      # 导出不变，Props 100% 兼容
│   ├── [types.ts](http://_vscodecontentref_/47)                      # ParseBlock, VirtualRangeResponse...（不变）
│   ├── [RangePreviewRenderer.tsx](http://_vscodecontentref_/48)      # 主组件（使用 canvas-base）
│   ├── RangeDiffView.tsx             # Diff 视图（零改动）
│   ├── renderers/                    # 🆕 块渲染器插件
│   │   ├── [index.ts](http://_vscodecontentref_/49)
│   │   ├── TextBlockRenderer.ts
│   │   ├── ListBlockRenderer.ts
│   │   ├── TableBlockRenderer.ts
│   │   ├── CodeBlockRenderer.ts
│   │   ├── HtmlBlockRenderer.ts
│   │   ├── ImageBlockRenderer.ts
│   │   ├── FormulaBlockRenderer.ts
│   │   └── DiffRenderer.ts
│   ├── core/                         # 业务核心（不变）
│   │   ├── DiffComputer.ts
│   │   ├── CharDiff.ts
│   │   └── TableLayoutManager.ts
│   ├── hooks/
│   │   └── useRangeData.ts           # 🆕 数据归一化 hook
│   └── components/
│       ├── DebugPanel.tsx
│       ├── MetadataBanner.tsx        # 🆕 从主组件拆出
│       └── MarkdownFallback.tsx      # 🆕 Markdown 降级
