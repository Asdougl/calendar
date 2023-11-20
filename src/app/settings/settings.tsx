'use client'

import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button, ButtonLink } from '~/components/ui/button'
import { Header3 } from '~/components/ui/headers'
import { Switch } from '~/components/ui/switch'
import { api } from '~/trpc/react'
import { useClientTimezone } from '~/utils/hooks'
import { useLocalStorage } from '~/utils/localStorage'

const SettingItem = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <li className="grid h-12 grid-cols-3">
    <div className="flex items-center justify-start px-4 text-sm">{title}</div>
    <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
      {children}
    </div>
  </li>
)

const SettingList = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="px-4">
    <div className="px-2 py-2">
      <Header3>{title}</Header3>
    </div>
    <ul className="flex-grow-0 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
      {children}
    </ul>
  </div>
)

export const LocalSettings = () => {
  const [settings, setSettings] = useLocalStorage('local-settings')

  return (
    <SettingList title="App Settings">
      <SettingItem title="Left weekends">
        <Switch
          checked={settings.leftWeekends}
          onClick={() =>
            setSettings((curr) => ({
              ...settings,
              leftWeekends: !curr.leftWeekends,
            }))
          }
        />
      </SettingItem>
      <SettingItem title="Categories">
        <ButtonLink
          path="/settings/categories"
          size="sm"
          intent="secondary"
          className="w-40 text-center"
        >
          Edit
        </ButtonLink>
      </SettingItem>
    </SettingList>
  )
}

export const DebugSettings = () => {
  const [time, setTime] = useState(new Date().toLocaleString())

  const queryClient = api.useContext()

  const timezone = useClientTimezone()

  return (
    <SettingList title="Debug">
      <SettingItem title="Machine time">
        <div className="pr-2">{time}</div>
        <button onClick={() => setTime(new Date().toLocaleString())}>
          <ArrowPathIcon height={16} />
        </button>
      </SettingItem>
      <SettingItem title="Timezone">{timezone || 'Unknown'}</SettingItem>
      <SettingItem title="Invalidate Cache">
        <Button
          size="sm"
          intent="secondary"
          className="w-40"
          // eslint-disable-next-line no-console
          onClick={() => queryClient.invalidate().catch(console.error)}
        >
          Clear
        </Button>
      </SettingItem>
      <SettingItem title="Logout">
        <Button
          onClick={() => signOut()}
          size="sm"
          intent="secondary"
          className="w-40"
        >
          Logout
        </Button>
      </SettingItem>
      <SettingItem title="Force Refresh">
        <Button
          onClick={() => location.reload()}
          size="sm"
          intent="secondary"
          className="w-40"
        >
          Reload
        </Button>
      </SettingItem>
    </SettingList>
  )
}
