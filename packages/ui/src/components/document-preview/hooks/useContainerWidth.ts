import { useRef, useState, useEffect, type RefObject } from 'react'

/**
 * Track the width of a container element via ResizeObserver.
 * Optionally accepts an external ref to observe instead of creating its own.
 */
export function useContainerWidth(externalRef?: RefObject<HTMLDivElement | null>) {
    const internalRef = useRef<HTMLDivElement>(null)
    const containerRef = externalRef ?? internalRef
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width
                if (w > 0) {
                    setContainerWidth(w)
                }
            }
        })
        observer.observe(container)

        // Initial measurement
        const w = container.getBoundingClientRect().width
        if (w > 0) setContainerWidth(w)

        return () => observer.disconnect()
    }, [])

    return { containerRef, containerWidth }
}
