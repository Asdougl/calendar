import { useState } from 'react'
import type { PropsWithChildren, FC } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowPathIcon, BugAntIcon } from '@heroicons/react/24/solid'
import { useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from './button'
import { Header2 } from './headers'
import { useClientTimezone } from '@/util/hooks'

const DebugListItem: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <li className="grid grid-cols-3 h-12">
      <div className="flex items-center px-4 justify-start text-sm">
        {title}
      </div>
      <div className="col-span-2 border-l border-neutral-800 text-white flex items-center justify-center">
        {children}
      </div>
    </li>
  )
}

export const Debugger: FC = () => {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState(new Date().toLocaleString())

  const supabase = createClientComponentClient()

  const queryClient = useQueryClient()

  const timezone = useClientTimezone()

  console.log(timezone)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button>
          <BugAntIcon height={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      <Dialog.Content className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-2 max-w-xl w-full">
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg w-full p-4 flex gap-2 flex-col">
          <div className="flex justify-between items-center">
            <Dialog.Title asChild>
              <Header2 className="flex gap-2 items-center">
                <BugAntIcon height={20} />
                Debugger
              </Header2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button>Close</Button>
            </Dialog.Close>
          </div>
          <ul className="border border-neutral-800 divide-y divide-neutral-800 rounded-lg">
            <DebugListItem title="Timezone">
              {timezone || 'Unknown'}
            </DebugListItem>
            <DebugListItem title="Current Time">
              <div className="pr-2">{time}</div>
              <button onClick={() => setTime(new Date().toLocaleString())}>
                <ArrowPathIcon height={16} />
              </button>
            </DebugListItem>
            <DebugListItem title="Clear Cache">
              <Button
                size="sm"
                intent="secondary"
                className="w-40"
                onClick={() => queryClient.invalidateQueries({ queryKey: [] })}
              >
                Clear
              </Button>
            </DebugListItem>
            <DebugListItem title="Logout">
              <Button
                onClick={() => supabase.auth.signOut()}
                size="sm"
                intent="secondary"
                className="w-40"
              >
                Logout
              </Button>
            </DebugListItem>
            <DebugListItem title="Force Reload">
              <Button
                onClick={() => location.reload()}
                size="sm"
                intent="secondary"
                className="w-40"
              >
                Reload
              </Button>
            </DebugListItem>
          </ul>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
