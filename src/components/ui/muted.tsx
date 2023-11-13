import { type ComponentProps, type FC, type PropsWithChildren } from 'react'
import { cn } from '~/utils/classnames'

export const Muted: FC<PropsWithChildren<ComponentProps<'span'>>> = ({
  children,
  ...props
}) => {
  return (
    <span {...props} className={cn('text-neutral-400', props.className)}>
      {children}
    </span>
  )
}
