import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import * as RadixSwitch from '@radix-ui/react-switch'
import { type ComponentProps, type FC } from 'react'
import { cn } from '~/utils/classnames'

export const Switch: FC<ComponentProps<(typeof RadixSwitch)['Root']>> = (
  props
) => {
  return (
    <RadixSwitch.Root
      {...props}
      className={cn(
        'relative flex h-8 w-14 items-center rounded-full bg-neutral-800 p-2',
        props.className
      )}
    >
      <div className="absolute left-0 top-1/2 flex h-full w-1/2 -translate-y-1/2 items-center justify-center">
        <CheckIcon className="h-4 w-4" />
      </div>
      <div className="absolute right-0 top-1/2 flex h-full w-1/2 -translate-y-1/2 items-center justify-center">
        <XMarkIcon className="h-4 w-4" />
      </div>
      <RadixSwitch.Thumb className="relative z-10 h-5 w-5 rounded-full bg-neutral-600 transition-all data-[state=checked]:translate-x-5 data-[state=checked]:bg-neutral-50" />
    </RadixSwitch.Root>
  )
}
