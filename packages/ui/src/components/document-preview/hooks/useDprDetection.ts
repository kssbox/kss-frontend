import { useState, useEffect } from 'react'

/**
 * 检测设备DPR（Device Pixel Ratio）的Hook
 * 用于高DPI屏幕的Canvas清晰度优化
 */
export function useDprDetection(): number {
    const [dpr, setDpr] = useState<number>(() => {
        if (typeof window === 'undefined') return 1
        return window.devicePixelRatio || 1
    })

    useEffect(() => {
        if (typeof window === 'undefined') return

        // 监听DPR变化（例如用户将窗口拖动到不同DPI的显示器）
        const handleDprChange = () => {
            setDpr(window.devicePixelRatio || 1)
        }

        // 某些浏览器支持 change 事件
        const mediaQueryList = window.matchMedia(
            `(resolution: ${window.devicePixelRatio}dppx)`
        )

        // 使用新的 addEventListener API（兼容旧的 addListener）
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', handleDprChange)
        } else if ((mediaQueryList as MediaQueryList).addListener) {
            ; (mediaQueryList as MediaQueryList).addListener(handleDprChange)
        }

        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener('change', handleDprChange)
            } else if ((mediaQueryList as MediaQueryList).removeListener) {
                ; (mediaQueryList as MediaQueryList).removeListener(handleDprChange)
            }
        }
    }, [])

    return dpr
}
