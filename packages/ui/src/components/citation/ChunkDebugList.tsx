'use client'

import { memo, useState, type FC } from 'react'
import type { DocReference } from './types'

interface ChunkDebugListProps {
  /** Document references containing chunk data */
  docs: DocReference[]
}

/**
 * Renders a debug list of all chunks from the document references.
 * Shows chunk ID and chunk content for each chunk in the docs.
 * Collapsed by default, can be expanded by clicking the header.
 * Useful for debugging RAG retrieval results.
 */
export const ChunkDebugList: FC<ChunkDebugListProps> = memo(({ docs }) => {
  const [expanded, setExpanded] = useState(false)

  if (!docs || docs.length === 0) return null

  // Collect all chunks from all docs
  const allChunks: Array<{ docPositionId: number; chunkId: string; content: string; dataName?: string }> = []
  
  for (const doc of docs) {
    if (doc.chunkData) {
      for (const [chunkId, content] of Object.entries(doc.chunkData)) {
        allChunks.push({
          docPositionId: doc.docPositionId ?? 0,
          chunkId,
          content,
          dataName: doc.dataName,
        })
      }
    }
  }

  if (allChunks.length === 0) return null

  return (
    <div className="mt-4 border border-dashed border-yellow-400 rounded-lg p-3 bg-yellow-50/50">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-xs font-medium text-yellow-700 flex items-center gap-1.5 cursor-pointer select-none hover:text-yellow-800 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        Debug: Chunks ({allChunks.length})
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-auto transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="space-y-2 max-h-96 overflow-y-auto mt-2">
          {allChunks.map((chunk, idx) => (
            <div
              key={`${chunk.docPositionId}-${chunk.chunkId}-${idx}`}
              className="rounded border border-yellow-200 bg-white p-2 text-xs"
            >
              <div className="flex items-center gap-2 mb-1 text-yellow-600 font-mono">
                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded">
                  {chunk.docPositionId}
                </span>
                <span className="text-gray-500">chunk_id:</span>
                <span className="font-medium text-gray-700 break-all">{chunk.chunkId}</span>
                {chunk.dataName && (
                  <>
                    <span className="text-gray-400 ml-2">|</span>
                    <span className="text-gray-500 truncate max-w-[200px]" title={chunk.dataName}>
                      {chunk.dataName}
                    </span>
                  </>
                )}
              </div>
              <div className="text-gray-600 whitespace-pre-wrap break-words leading-relaxed border-t border-yellow-100 pt-1.5 mt-1.5">
                {chunk.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

ChunkDebugList.displayName = 'ChunkDebugList'
