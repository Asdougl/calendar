import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { FC } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid'
import { Header3 } from './headers'
import { cn } from '~/utils/classnames'

const alert = cva('rounded-md px-4 py-1 flex flex-col border', {
  variants: {
    level: {
      info: 'bg-blue-950 bg-opacity-50 text-blue-50 border-blue-900 [&>p]:text-blue-100',
      success:
        'bg-green-950 bg-opacity-50 text-green-50 border-green-900 [&>p]:text-green-100',
      warning:
        'bg-yellow-950 bg-opacity-50 text-yellow-50 border-yellow-900 [&>p]:text-yellow-100',
      error:
        'bg-red-950 bg-opacity-50 text-red-50 border-red-900 [&>p]:text-red-100 [&>svg]:text-error-900',
    },
  },
})

type AlertProps = VariantProps<typeof alert> & {
  message?: string
  title: string
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
      icon = <CheckCircleIcon className="text-green-500" height={20} />
      break
    case props.level === 'warning':
      icon = <ExclamationTriangleIcon className="text-yellow-500" height={20} />
      break
    case props.level === 'error':
      icon = <ExclamationCircleIcon className="text-red-500" height={20} />
      break
    default:
      icon = <InformationCircleIcon className="text-blue-500" height={20} />
      break
  }

  return (
    <div className={cn(alert(props), className)}>
      <div className="flex items-center gap-2">
        <div className="icon py-2">{icon}</div>
        {title && <Header3>{title}</Header3>}
      </div>
      <p className="pb-2" data-testid={props.level}>
        {message}
      </p>
    </div>
  )
}
