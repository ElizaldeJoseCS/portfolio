import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  )
})

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  /** Adds the rel/target pair and an off-screen hint for off-site links. */
  external?: boolean
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = 'outline', size = 'md', className, children, external, ...rest },
  ref,
) {
  const externalProps = external ? { target: '_blank', rel: 'noreferrer noopener' } : {}
  return (
    <a ref={ref} className={buttonClasses(variant, size, className)} {...externalProps} {...rest}>
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
})
