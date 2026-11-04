'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const ITEMS = [
  { label: 'Log', path: '/' },
  { label: 'Feedback', path: '/', type: 'feedback' },
  { label: 'AI use', path: '/', type: 'ai' },
  { label: 'Hours', path: '/hours' },
  { label: 'Planning', path: '/planning' },
  { label: 'Team', path: '/team' },
]

/** Keeps the chosen topic while moving between pages, so a coach can follow "UX" everywhere. */
export function Nav() {
  const pathname = usePathname()
  const params = useSearchParams()
  const topic = params.get('topic')
  const currentType = params.get('type')

  return (
    <nav className="nav" aria-label="Main">
      {ITEMS.map((item) => {
        const query = new URLSearchParams()
        if (item.type) query.set('type', item.type)
        if (topic && item.path !== '/team') query.set('topic', topic)
        const text = query.toString()
        const active =
          pathname === item.path &&
          (item.path !== '/' ||
            currentType === (item.type ?? null) ||
            (!item.type && currentType !== 'feedback' && currentType !== 'ai'))
        return (
          <Link
            key={item.label}
            href={text ? `${item.path}?${text}` : item.path}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
