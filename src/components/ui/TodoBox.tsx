import { CheckIcon } from '@heroicons/react/24/solid'
import { type FC } from 'react'

export const TodoBox: FC<{ done: boolean }> = ({ done }) => {
  return (
    <div className="h-4 w-4 rounded-lg border border-neutral-800">
      <CheckIcon className={done ? 'text-primary-400' : 'text-transparent'} />
    </div>
  )
}
