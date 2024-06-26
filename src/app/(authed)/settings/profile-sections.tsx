'use client'

import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { TimezoneSelect } from '~/components/form/TimezoneSelect'
import { SettingItem, SettingList } from '~/components/layout/Settings'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Select, type SelectOption } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { api } from '~/trpc/react'
import { Preferences, PreferencesDefaults } from '~/types/preferences'
import { useClientNow, useClientTimezone } from '~/utils/hooks'

export const ProfileSection = () => {
  const { data: user } = api.users.me.useQuery()

  return (
    <SettingList title="Profile">
      <SettingItem title="Name" skeleton={!user}>
        {user?.name && (
          <input
            type="text"
            defaultValue={user.name}
            className="h-full w-full bg-transparent text-center ring-neutral-600 focus:outline-none focus:ring"
          />
        )}
      </SettingItem>
      <SettingItem title="Email" skeleton={!user}>
        {user?.email}
      </SettingItem>
      <SettingItem title="Handle" skeleton={!user}>
        {user && (
          <input
            type="text"
            defaultValue={user.handle?.value || ''}
            placeholder="Your @handle"
            className="h-full w-full bg-transparent text-center ring-neutral-600 focus:outline-none focus:ring"
          />
        )}
      </SettingItem>
      <SettingItem title="Profile Picture" skeleton={!user}>
        <Avatar size="sm" src={user?.image} name={user?.name || 'Nobody'} />
      </SettingItem>
    </SettingList>
  )
}

const timeFormatOptions: SelectOption<Preferences['timeFormat']>[] = [
  { value: '12', name: '12h' },
  { value: '24', name: '24h' },
]

const leftWeekendsOptions: SelectOption<Preferences['weekends']>[] = [
  { value: 'left', name: 'Left Align' },
  { value: 'right', name: 'Right Align' },
  { value: 'dynamic', name: 'Dynamic Alignment' },
]

export const PreferencesSection = () => {
  const queryClient = api.useUtils()

  const { data: preferences, isLoading: isInitialLoading } =
    api.preferences.getAll.useQuery()
  const {
    mutate: updatePreferences,
    isPending: isUpdating,
    isSuccess,
  } = api.preferences.update.useMutation({
    onMutate: async (data) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.preferences.getAll.cancel()
      // Snapshot the previous value
      const old = queryClient.preferences.getAll.getData()

      const withDefaults = PreferencesDefaults.parse(data)
      // Optimistically update to the new value
      queryClient.preferences.getAll.setData(
        undefined,
        Preferences.parse({
          ...old,
          ...withDefaults,
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
    <SettingList
      title="Preferences"
      saving={isSuccess ? (isUpdating ? true : false) : undefined}
    >
      <SettingItem title="Weekends left" skeleton={isInitialLoading}>
        {preferences && (
          <Select
            value={preferences.weekends}
            disabled={isInitialLoading || isUpdating}
            onChange={(value) => {
              const parse = Preferences.shape.weekends.safeParse(value)
              if (parse.success) {
                updatePreferences({
                  ...preferences,
                  weekends: parse.data,
                })
              }
            }}
            className="h-full rounded-none border-0"
            options={leftWeekendsOptions}
          />
        )}
      </SettingItem>
      <SettingItem title="Time format" skeleton={isInitialLoading}>
        {preferences && (
          <Select
            value={preferences.timeFormat}
            disabled={isInitialLoading || isUpdating}
            onChange={(value) => {
              const parse = Preferences.shape.timeFormat.safeParse(value)
              if (parse.success) {
                updatePreferences({
                  ...preferences,
                  timeFormat: parse.data,
                })
              }
            }}
            className="h-full rounded-none border-0"
            options={timeFormatOptions}
          />
        )}
      </SettingItem>
      <SettingItem title="Timezone" skeleton={isInitialLoading}>
        {preferences && (
          <TimezoneSelect
            value={preferences.timezone}
            disabled={isInitialLoading || isUpdating}
            onChange={(value) =>
              updatePreferences({ ...preferences, timezone: value })
            }
            className="h-full rounded-none border-0"
          />
        )}
      </SettingItem>
      <SettingItem title="Developer" skeleton={isInitialLoading}>
        {preferences && (
          <Switch
            checked={preferences.developer}
            disabled={isInitialLoading || isUpdating}
            onClick={() =>
              updatePreferences({
                ...preferences,
                developer: !preferences.developer,
              })
            }
          />
        )}
      </SettingItem>
    </SettingList>
  )
}

export const DebugSection = () => {
  const [time, setTime] = useClientNow()

  const { data: preferences } = api.preferences.getAll.useQuery()

  const queryClient = api.useUtils()

  const timezone = useClientTimezone()

  return preferences?.developer ? (
    <SettingList title="Developer">
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
  ) : null
}
