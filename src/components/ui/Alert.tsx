import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { FC } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid'
import { Header3 } from './headers'
import { cn } from '~/utils/classnames'

const alert = cva('rounded-md px-3 py-2 flex gap-4 border', {
  variants: {
    level: {
      info: 'bg-blue-950 bg-opacity-50 text-blue-50 border-blue-900',
      success: 'bg-green-950 bg-opacity-50 text-green-50 border-green-900',
      warning: 'bg-yellow-950 bg-opacity-50 text-yellow-50 border-yellow-900',
      error: 'bg-red-950 bg-opacity-50 text-red-50 border-red-900',
    },
  },
})
type AlertVariantProps = VariantProps<typeof alert>

export const Alert: FC<
  { message: string; title?: string } & AlertVariantProps
> = ({ message, title, ...props }) => {
  let icon: React.ReactNode
  switch (true) {
    case props.level === 'success':
      icon = <CheckCircleIcon height={20} />
      break
    case props.level === 'warning':
      icon = <ExclamationCircleIcon height={20} />
      break
    case props.level === 'error':
      icon = <ExclamationCircleIcon height={20} />
      break
    default:
      icon = <InformationCircleIcon height={20} />
      break
  }

  return (
    <div className={cn(alert(props))}>
      <div className="py-2">{icon}</div>
      <div className="flex flex-col">
        {title && <Header3>{title}</Header3>}
        <p>{message}</p>
      </div>
    </div>
  )
}
