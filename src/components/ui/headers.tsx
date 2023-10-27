import type { ComponentProps, FC } from 'react'
import { cn } from '~/utils/classnames'

type HeaderProps = {
  skeleton?: boolean
}

export const Header1: FC<ComponentProps<'h1'> & HeaderProps> = ({
  className,
  children,
  skeleton,
  ...props
}) => {
  return (
    <h1
      className={cn(
        'text-3xl font-bold',
        {
          'inline animate-pulse rounded-full bg-neutral-800 text-transparent':
            skeleton,
        },
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

export const Header2: FC<ComponentProps<'h2'> & HeaderProps> = ({
  className,
  children,
  skeleton,
  ...props
}) => {
  return (
    <h2
      className={cn(
        'text-2xl font-bold',
        {
          'inline animate-pulse rounded-full bg-neutral-800 text-transparent':
            skeleton,
        },
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export const Header3: FC<ComponentProps<'h3'> & HeaderProps> = ({
  className,
  children,
  skeleton,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-xl font-bold',
        {
          'inline animate-pulse rounded-full bg-neutral-800 text-transparent':
            skeleton,
        },
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export const Header4: FC<ComponentProps<'h4'> & HeaderProps> = ({
  className,
  children,
  skeleton,
  ...props
}) => {
  return (
    <h4
      className={cn(
        'text-lg font-bold',
        {
          'inline animate-pulse rounded-full bg-neutral-800 text-transparent':
            skeleton,
        },
        className
      )}
      {...props}
    >
      {children}
    </h4>
  )
}
