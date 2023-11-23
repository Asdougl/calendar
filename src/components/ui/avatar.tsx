'use client'

import * as RadixAvatar from '@radix-ui/react-avatar'
import { type VariantProps, cva } from 'class-variance-authority'
import { type FC } from 'react'
import { useSession } from 'next-auth/react'
import { PathLink } from './PathLink'
import { cn } from '~/utils/classnames'

const avatar = cva(
  'inline-flex select-none items-center justify-center overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-4 w-4',
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

type AvatarProps = VariantProps<typeof avatar> & {
  src?: string | null
  name: string
  className?: string
}

const fallbackName = (name: string) => {
  const [first, second] = name.split(' ')
  if (first === undefined) return '?'
  if (second === undefined) return first.slice(0, 2).toUpperCase() || '?'
  return (
    first.slice(0, 1).toUpperCase() + second.slice(0, 1).toUpperCase() || '?'
  )
}

export const Avatar: FC<AvatarProps> = ({ src, name, className, ...props }) => {
  return (
    <RadixAvatar.Root className={cn(avatar(props), className)}>
      {src && (
        <RadixAvatar.Image
          className="h-full w-full object-cover"
          src={src}
          alt={name}
        />
      )}
      <RadixAvatar.Fallback className="flex h-full w-full items-center justify-center bg-neutral-800 text-sm text-neutral-200">
        {fallbackName(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}

export const ProfileAvatar: FC<Pick<AvatarProps, 'className' | 'size'>> = ({
  className,
  size,
}) => {
  const { data } = useSession()

  if (!data) return null

  return (
    <Avatar
      size={size || 'md'}
      name={data.user.name || ''}
      src={data.user.image}
      className={className}
    />
  )
}

export const ProfileLink: FC<Pick<AvatarProps, 'className' | 'size'>> = ({
  className,
  size,
}) => {
  return (
    <PathLink
      path="/profile"
      className={cn(
        'flex items-center justify-center rounded-full ring-neutral-800 hover:ring',
        className
      )}
    >
      <ProfileAvatar size={size} />
    </PathLink>
  )
}
