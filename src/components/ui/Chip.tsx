import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps {
  children: ReactNode
  className?: string
  tone?: 'default' | 'accent' | 'alt'
  /** Renders a numeric strength bar behind the label (Engineer skills). */
  level?: number
}

const tones = {
  default: 'border-line/80 text-muted bg-surface/70',
  accent: 'border-accent/50 text-accent bg-accent/10',
  alt: 'border-accentAlt/50 text-accentAlt bg-accentAlt/10',
}

export function Chip({ children, className, tone = 'default', level }: ChipProps) {
  return (
    <span
      className={cn(
        'relative isolate inline-flex items-center overflow-hidden rounded-full border px-3 py-1',
        'font-mono text-xs tracking-tight',
        tones[tone],
        className,
      )}
    >
      {typeof level === 'number' && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 -z-10 bg-accent/20"
          style={{ width: `${Math.round(Math.min(Math.max(level, 0), 1) * 100)}%` }}
        />
      )}
      {children}
    </span>
  )
}
