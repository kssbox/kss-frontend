import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, it, expect } from 'vitest'
import { useDataTable } from './use-data-table'

function TestComponent({ dataService }: { dataService?: any }) {
   
  // minimal column to satisfy the hook
  const columns: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  useDataTable({ columns, dataService, enablePagination: true })
  return <div />
}

describe('useDataTable - dataService ref de-duplication', () => {
  it('should call underlying dataService only once even if wrapper function reference changes', async () => {
    let callCount = 0
    const underlying = async (_params: any) => {
       
      callCount++
      return { list: [], total: 0 }
    }

    // create two different wrapper functions that call the same underlying
    const wrapper1 = (params: any) => underlying(params) // eslint-disable-line @typescript-eslint/no-explicit-any
    const wrapper2 = (params: any) => underlying(params) // eslint-disable-line @typescript-eslint/no-explicit-any

    const { rerender } = render(<TestComponent dataService={wrapper1} />)

    // Immediately re-render with a different wrapper reference (simulates recreation)
    rerender(<TestComponent dataService={wrapper2} />)

    // wait for a bit for the hook to have a chance to call
    await waitFor(() => {
      expect(callCount).toBe(1)
    })

    // ensure no additional calls happen shortly afterwards
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(callCount).toBe(1)
  })
})
