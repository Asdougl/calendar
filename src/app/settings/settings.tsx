'use client'

import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { signOut } from 'next-auth/react'
import { InlineLoader } from '~/components/ui/Loader'
import { Button, ButtonLink } from '~/components/ui/button'
import { Header3 } from '~/components/ui/headers'
import { Switch } from '~/components/ui/switch'
import { api } from '~/trpc/react'
import { Preferences } from '~/types/preferences'
import { cn } from '~/utils/classnames'
import { useClientNow, useClientTimezone } from '~/utils/hooks'

const SettingItem = ({
  title,
  children,
  skeleton,
}: {
  title: string
  children: React.ReactNode
  skeleton?: boolean
}) => (
  <li className="grid h-12 grid-cols-3">
    <div className="flex items-center justify-start px-4 text-sm">
      <span
        className={cn(skeleton && 'animate-pulse rounded-full bg-neutral-800')}
      >
        {title}
      </span>
    </div>
    <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
      {skeleton ? <InlineLoader /> : children}
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
  const queryClient = api.useContext()

  const { data: preferences, isInitialLoading } =
    api.preferences.getAll.useQuery()
  const { mutate: updatePreferences, isLoading: isUpdating } =
    api.preferences.update.useMutation({
      onMutate: async (data) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.preferences.getAll.cancel()
        // Snapshot the previous value
        const old = queryClient.preferences.getAll.getData()
        // Optimistically update to the new value
        queryClient.preferences.getAll.setData(
          undefined,
          Preferences.parse({
            ...old,
            ...data,
          })
        )
        // Return a context object with the snapshotted value
        return { prevData: old }
      },
      onError: (err, newPrefs, ctx) => {
        if (ctx?.prevData) {
          // If the mutation fails, use the context returned from onMutate to roll back
          queryClient.preferences.getAll.setData(undefined, ctx.prevData)
        }
      },
      onSettled: () => {
        // Invalidate and refetch
        // eslint-disable-next-line no-console
        queryClient.preferences.getAll.invalidate().catch(console.error)
      },
    })

  return (
    <SettingList title="App Settings">
      <SettingItem title="Left weekends" skeleton={isInitialLoading}>
        {preferences && (
          <Switch
            checked={preferences.leftWeekends}
            disabled={isInitialLoading || isUpdating}
            onClick={() =>
              updatePreferences({
                ...preferences,
                leftWeekends: !preferences.leftWeekends,
              })
            }
          />
        )}
      </SettingItem>
      <SettingItem title="Categories">
        <ButtonLink
          path="/categories"
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
  const [time, setTime] = useClientNow()

  const queryClient = api.useContext()

  const timezone = useClientTimezone()

  return (
    <SettingList title="Debug">
      <SettingItem title="Machine time">
        <div className="pr-2">{time.toLocaleString()}</div>
        <button onClick={() => setTime(new Date())}>
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
