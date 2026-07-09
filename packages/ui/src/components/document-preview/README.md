# Range Preview Components

React components for displaying and editing document ranges with `UnifiedParseResult` data structure from the RAG backend.

## Overview

This module provides Canvas-based rendering of document ranges (segments of parsed documents) with support for:

- **Multiple block types**: text, heading, list, table, image, formula, code
- **Copy-on-Write editing**: Display original or edited versions of ranges
- **Diff visualization**: Side-by-side comparison of changes
- **High performance**: Pure Canvas rendering, no DOM overlay
- **DPI-aware**: Proper scaling on high-resolution displays

## Architecture

Based on EDIT-SYSTEM.md API specification:

```
VirtualRangeResponse
├── parse_result (original, always present)
└── edited_parse_result (null if not edited)

UnifiedParseResult
├── metadata (parser info, page count, etc.)
├── blocks[] (ParseBlock array)
├── pages[] (page dimensions)
└── assets{} (MinIO file references)

ParseBlock
├── id (Snowflake ID, for diff matching)
├── type (text|heading|list|table|image|formula|code)
├── content (text content)
├── bbox (0-1000 coordinate system)
└── attrs (type-specific attributes)
```

## API Endpoints

This component consumes data from:

- **GET** `/knowledge_bases/{kb_id}/documents/{doc_id}/ranges`
  - Returns array of `VirtualRangeResponse`
  - Contains both `parse_result` (original) and `edited_parse_result` (if edited)

- **POST** `/knowledge_bases/{kb_id}/documents/{doc_id}/ranges/{range_id}/edit`
  - Submit block edits: `{edits: [{block_id, operation, new_content}]}`
  - Returns updated `VirtualRangeResponse` with new `edited_parse_result`

## Components

### RangePreviewRenderer

Main component for displaying a single range.

```tsx
import { RangePreviewRenderer } from '@/components/document-preview';

<RangePreviewRenderer
  rangeData={virtualRangeResponse}
  mode="auto" // 'original' | 'edited' | 'auto'
  zoom={1.0}
  debug={false}
  onBlockClick={(block) => console.log('Clicked:', block)}
/>
```

**Props:**
- `rangeData`: `VirtualRangeResponse` from API
- `mode`: Which version to display
  - `'auto'`: Show edited if available, else original (default)
  - `'original'`: Always show parse_result  - `'edited'`: Always show edited_parse_result
- `zoom`: Scale factor (1.0 = 100%)
- `debug`: Show bounding boxes and debug info
- `onBlockClick`: Handler for block clicks

**Features:**
- Displays metadata banner (parser, page count, char count)
- Shows "Edited" badge when `edited_parse_result` exists
- Handles all processing states (PENDING-EMBEDDED)
- Canvas-based rendering with hover effects

## Data Structures

### VirtualRangeResponse

```typescript
{
  range_id: string;              // Snowflake ID
  doc_id: string;
  processing_status: number;      // 0-4
  parse_result: UnifiedParseResult | null;
  edited_parse_result: UnifiedParseResult | null;
  created_at: number;
  updated_at: number;
}
```

### UnifiedParseResult

```typescript
{
  doc_id?: string;
  metadata?: {
    parser: string;              // "VLMParser", "LangchainParser"
    mime_type?: string;
    page_count?: number;
    char_count?: number;
  };
  blocks?: ParseBlock[];
  pages?: PageMetadata[];
  assets?: Record<string, AssetInfo>;
}
```

### ParseBlock

```typescript
{
  id: string;                    // Snowflake ID (for diff matching)
  type: BlockType;               // 'text' | 'heading' | ...
  content: string;
  page?: number;                 // 0-indexed
  bbox?: number[];              // [x1, y1, x2, y2] in 0-1000 coords
  confidence?: number;
  attrs?: {
    level?: number;              // Heading level
    list_type?: 'ordered' | 'unordered';
    list_items?: Array<{text: string}>;
    // ... other type-specific attrs
  };
}
```

## Block Types

| Type | Description | Rendering |
|------|-------------|-----------|
| `text` | Plain paragraph text | Black sans-serif, wrapped |
| `heading` | Section heading | Bold, scaled by level |
| `list` | Bulleted/numbered list | Bullets/numbers + items |
| `table` | HTML table | Pre-rendered to Canvas ImageData |
| `image` | Image reference | Placeholder (asset loading TODO) |
| `formula` | LaTeX formula | Monospace italic (KaTeX TODO) |
| `code` | Code snippet | Monospace on gray background |

## Coordinate System

- **Input**: `bbox` values in range `[0, 1000]` (normalized)
- **Rendering**: Scaled to container width
- **Formula**: `pixelX = (bbox[0] / 1000) * containerWidth * zoom`

Example:
```typescript
bbox: [100, 200, 900, 400]
// → In 1000px container at 100% zoom:
// → Renders at x=100px, y=200px, width=800px, height=200px
```

## Editing Workflow

1. **Fetch range**: `GET /ranges` → Get `VirtualRangeResponse`
2. **Display**: Use `RangePreviewRenderer` with `mode="auto"`
3. **User edits**: Collect `BlockEdit[]` operations
4. **Submit**: `POST /ranges/{id}/edit` with `{edits: [...]}`
5. **Refetch**: Get updated `VirtualRangeResponse` with new `edited_parse_result`
6. **Display**: Component automatically shows edited version

## Diff Matching

Blocks are matched by `id` field (Snowflake ID) across original and edited versions:

```typescript
// Original
{id: "1001", content: "Hello"}

// Edited
{id: "1001", content: "Hello World"}  // ← Same ID = UPDATE
{id: "1002", content: "New block"}   // ← New ID = ADD

// Missing "1003" from original = DELETE
```

## Copy-on-Write Behavior

- **parse_result**: Always contains original parsing (never modified)
- **edited_parse_result**: Only exists when edits are made
- **Frontend**: Compares blocks by ID to show diffs
- **Revert**: Delete `edited_parse_result` → automatic fallback to original

## Processing Status

| Value | Label | Description |
|-------|-------|-------------|
| 0 | Pending | Queued for parsing |
| 1 | Parsing | Currently parsing |
| 2 | Parsed | Parsing complete, awaiting embedding |
| 3 | Embedding | Generating vectors |
| 4 | Ready | Fully processed |

Component shows loading state for status < 4.

## Migration from OJSON Components

| Old (OJSON) | New (Range Preview) | Changes |
|-------------|---------------------|---------|
| `OJsonCanvasRenderer` | `RangePreviewRenderer` | Uses `VirtualRangeResponse` |
| `block.element_id` | `block.id` | Field renamed |
| `block.text` | `block.content` | Field renamed |
| `type: 'paragraph'` | `type: 'text'` | Type renamed |
| Single data structure | COW: original + edited | Dual version support |

## Storybook Stories

Located in `stories/range-preview/`:

- **Default**: Basic rendering
- **DebugMode**: With bounding boxes
- **ZoomedIn/Out**: Different zoom levels
- **WithEdits**: Demonstrating edited_parse_result
- **ShowingOriginal/Edited**: Explicit mode selection
- **ProcessingPending**: Non-ready states

Run: `pnpm storybook` in ui package

## Performance Considerations

- **Canvas vs DOM**: Pure Canvas rendering avoids layout thrashing
- **Table caching**: HTML tables pre-rendered to ImageData, cached 1 hour
- **DPR scaling**: Automatic high-DPI detection and scaling
- **Incremental rendering**: Only re-render on hover/edit state changes

## Development

```bash
# In ui directory
cd chatbot/frontend/packages/ui

# Install dependencies
pnpm install

# Run Storybook
pnpm storybook

# Build package
pnpm build

# Type check
pnpm typecheck
```

## File Structure

```
src/components/document-preview/
├── types.ts                     # TypeScript interfaces
├── RangePreviewRenderer.tsx     # Main component
├── core/
│   ├── CanvasRenderer.ts        # Canvas drawing engine
│   ├── InteractionManager.ts   # Mouse events, hit detection
│   ├── TableLayoutManager.ts   # HTML → Canvas conversion
│   └── DiffComputer.ts          # Block diff logic
└── index.ts                     # Public exports

stories/range-preview/
├── RangePreview.stories.tsx     # Storybook stories
└── mock-data/
    ├── simple-range.json        # Basic test data
    └── edited-range.json        # With edits applied
```

## TODO

- [ ] RangeEditor component (inline editing UI)
- [ ] RangePreviewDiffView component (side-by-side diff)
- [ ] Asset loading for images (from MinIO)
- [ ] KaTeX rendering for formula blocks
- [ ] Syntax highlighting for code blocks
- [ ] Table cell-level diff highlighting
- [ ] Keyboard navigation support
- [ ] Accessibility improvements (ARIA labels)

## Related Documentation

- [EDIT-SYSTEM.md](../../../rag/docs/EDIT-SYSTEM.md) - Backend API specification
- [ES-SCHEMA.md](../../../rag/docs/ES-SCHEMA.md) - Elasticsearch schema (for search context)
- [API.md](../../../rag/docs/API.md) - Full API reference

## License

See root LICENSE file.
