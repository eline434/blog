import Link from 'next/link'

export type Chip = {
  label: string
  href: string
  active: boolean
  color?: string
  count?: number
}

/** Filters are plain links: they work without JavaScript and can be shared as a URL. */
export function Chips({ chips, label, large }: { chips: Chip[]; label: string; large?: boolean }) {
  return (
    <div className={large ? 'chips chips--large' : 'chips'} role="group" aria-label={label}>
      <span className="chips__label" aria-hidden="true">
        {label}
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          className="chip"
          href={chip.href}
          scroll={false}
          aria-current={chip.active ? 'true' : undefined}
        >
          {chip.color && <span className="dot" data-color={chip.color} aria-hidden="true" />}
          {chip.label}
          {chip.count !== undefined && <span className="chip__count">{chip.count}</span>}
        </Link>
      ))}
    </div>
  )
}
