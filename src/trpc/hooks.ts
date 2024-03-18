'use client'

import { api } from './react'
import { type RouterOutputs } from './shared'
import { time } from '~/utils/dates'

/** @deprecated */
export const usePreferences = (
  initialData?: RouterOutputs['preferences']['getAll']
) => {
  const { data, ...rest } = api.preferences.getAll.useQuery(undefined, {
    initialData: initialData,
    staleTime: time.minutes(60),
    refetchInterval: time.hours(1),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
  return {
    preferences: data,
    ...rest,
  }
}
