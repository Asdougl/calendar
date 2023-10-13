import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './typegen'

export type Event = Database['public']['Tables']['events']['Row']
export type Period = Database['public']['Tables']['periods']['Row']
export type Category = Database['public']['Tables']['categories']['Row']

/**
 * This is only used to generate types
 * @deprecated
 */
const generateQueryResponse = async <
  Table extends keyof Database['public']['Tables'],
  Query extends string,
>(
  table: Table,
  query: Query
) => {
  const client = new SupabaseClient<Database>('', '')
  const response = await client.from(table).select(query)
  return response.data
}

export type QueryResponse<
  Table extends keyof Database['public']['Tables'],
  Query extends string,
> = Awaited<ReturnType<typeof generateQueryResponse<Table, Query>>>

/**
 * This is only used to generate types
 * @deprecated
 */
const generateQueryResponseSingle = async <
  Table extends keyof Database['public']['Tables'],
  Query extends string,
>(
  table: Table,
  query: Query
) => {
  const client = new SupabaseClient<Database>('', '')
  const response = await client.from(table).select(query).single()
  return response.data
}

export type QuerySingleResponse<
  Table extends keyof Database['public']['Tables'],
  Query extends string,
> = Awaited<ReturnType<typeof generateQueryResponseSingle<Table, Query>>>

export type InferQueryResponse<
  Query extends { from: keyof Database['public']['Tables']; select: string },
> = NonNullable<
  Awaited<
    ReturnType<typeof generateQueryResponse<Query['from'], Query['select']>>
  >
>[number]

// Common Queries

export const EventWithCategoryQuery = {
  from: 'events',
  select: '*, category:categories (*)',
} as const

export type EventWithCategory = InferQueryResponse<
  typeof EventWithCategoryQuery
>
