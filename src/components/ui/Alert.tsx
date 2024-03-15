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

const alert = cva('rounded-md px-3 py-2 flex gap-4 border items-center', {
  variants: {
    level: {
      info: 'bg-blue-950 bg-opacity-50 text-blue-50 border-blue-900',
      success: 'bg-green-950 bg-opacity-50 text-green-50 border-green-900',
      warning: 'bg-yellow-950 bg-opacity-50 text-yellow-50 border-yellow-900',
      error: 'bg-red-950 bg-opacity-50 text-red-50 border-red-900',
    },
  },
})

type AlertProps = VariantProps<typeof alert> & {
  message: string
  title?: string
  className?: string
}

export const Alert: FC<AlertProps> = ({
  message,
  title,
  className,
  ...props
}) => {
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
    <div className={cn(alert(props), className)}>
      <div className="py-2">{icon}</div>
      <div className="flex flex-col">
        {title && <Header3>{title}</Header3>}
        <p data-testid={props.level}>{message}</p>
      </div>
    </div>
  )
}
