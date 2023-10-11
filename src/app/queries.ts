import type { QueryResponse } from '@/types/supabase'

export const EventQuery = {
  from: 'events',
  select: '*',
} as const

export type EventQueryResponse = QueryResponse<
  (typeof EventQuery)['from'],
  (typeof EventQuery)['select']
>
