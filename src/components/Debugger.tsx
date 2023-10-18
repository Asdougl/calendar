import { useState } from 'react'
import type { PropsWithChildren, FC } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowPathIcon, BugAntIcon } from '@heroicons/react/24/solid'
import { signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { Header2 } from './ui/headers'
import { useClientTimezone } from '~/utils/hooks'
import { api } from '~/trpc/react'

const DebugListItem: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <li className="grid h-12 grid-cols-3">
      <div className="flex items-center justify-start px-4 text-sm">
        {title}
      </div>
      <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
        {children}
      </div>
    </li>
  )
}

export const Debugger: FC = () => {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState(new Date().toLocaleString())

  const queryClient = api.useContext()

  const timezone = useClientTimezone()

  console.log(timezone)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex h-full w-full items-center justify-center">
          <BugAntIcon height={20} />
        </button>
      </Dialog.Trigger>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/4 z-10 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 p-2">
        <div className="flex w-full flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between">
            <Dialog.Title asChild>
              <Header2 className="flex items-center gap-2">
                <BugAntIcon height={20} />
                Debugger
              </Header2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button>Close</Button>
            </Dialog.Close>
          </div>
          <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
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
                onClick={() => queryClient.invalidate().catch(console.error)}
              >
                Clear
              </Button>
            </DebugListItem>
            <DebugListItem title="Logout">
              <Button
                onClick={() => signOut()}
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
