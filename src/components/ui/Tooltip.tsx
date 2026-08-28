import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TooltipProps {
  label: string
  children: ReactNode
  className?: string
}

/**
 * Hover/focus tooltip wired through `aria-describedby` so keyboard and screen
 * reader users get the same hint as pointer users.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap',
          'rounded-md border border-line bg-surfaceAlt px-2.5 py-1.5 font-mono text-[11px] text-fg',
          'transition-opacity duration-150',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </span>
  )
}
