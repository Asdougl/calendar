import type { ComponentProps, FC } from 'react'
import { cn } from '~/utils/classnames'

export type LabelProps = ComponentProps<'label'> & {
  condition?: 'required' | 'optional'
}

export const Label: FC<LabelProps> = ({
  className,
  condition,
  children,
  ...props
}) => {
  return (
    <label className={cn('pl-1 text-sm', className)} {...props}>
      {children}{' '}
      {condition === 'required' && (
        <span className="text-xs text-red-300">required</span>
      )}
      {condition === 'optional' && (
        <span className="text-xs text-neutral-400">optional</span>
      )}
    </label>
  )
}
