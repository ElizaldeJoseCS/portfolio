import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Adds hover lift + accent border. Off for static content panels. */
  interactive?: boolean
}

export function Card({ children, className, interactive = false, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-world border border-line/70 bg-surface/70 backdrop-blur-md',
        'transition-[border-color,transform,box-shadow] duration-200',
        interactive && 'hover:-translate-y-1 hover:border-accent/70 hover:shadow-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
