'use client'

import * as RadixAvatar from '@radix-ui/react-avatar'
import { type VariantProps, cva } from 'class-variance-authority'
import { type FC } from 'react'

const avatar = cva(
  'inline-flex select-none items-center justify-center overflow-hidden rounded-full',
  {
    variants: {
      size: {
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
}

const fallbackName = (name: string) => {
  const [first, second] = name.split(' ')
  if (first === undefined) return '?'
  if (second === undefined) return first.slice(0, 2).toUpperCase() || '?'
  return (
    first.slice(0, 1).toUpperCase() + second.slice(0, 1).toUpperCase() || '?'
  )
}

export const Avatar: FC<AvatarProps> = ({ src, name, ...props }) => {
  return (
    <RadixAvatar.Root className={avatar(props)}>
      {src && (
        <RadixAvatar.Image
          className="h-full w-full object-cover"
          src={src}
          alt={name}
        />
      )}
      <RadixAvatar.Fallback className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-semibold text-neutral-800">
        {fallbackName(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}
