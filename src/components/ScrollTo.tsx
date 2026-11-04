'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** A sideways-scrolling area that opens on the marked element, such as today in the timeline. */
export function ScrollTo({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = ref.current
    const target = box?.querySelector<HTMLElement>('[data-scroll-target]')
    if (!box || !target || box.scrollWidth <= box.clientWidth) return
    const offset = target.getBoundingClientRect().left - box.getBoundingClientRect().left
    box.scrollLeft += offset - box.clientWidth * 0.6
  }, [])

  return (
    <div ref={ref} className={className} tabIndex={0} role="region" aria-label="Scrollable chart">
      {children}
    </div>
  )
}
