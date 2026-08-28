import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide ' +
  'rounded-world transition-colors duration-200 select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-bg hover:bg-accentAlt shadow-glow',
  outline: 'border border-line text-fg hover:border-accent hover:text-accent bg-surface/60',
  ghost: 'text-muted hover:text-fg hover:bg-surface/70',
}

// Every size clears the 44px touch target from spec §7.
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] px-4 text-sm',
  md: 'min-h-[48px] px-5 text-base',
  lg: 'min-h-[56px] px-7 text-lg',
}

/** Shared class recipe so <Button> and <LinkButton> stay visually identical. */
export const buttonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) => cn(base, variants[variant], sizes[size], className)
