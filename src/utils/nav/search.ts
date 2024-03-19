import { z } from 'zod'
import { getWindow } from '../misc'

// All supported Search Params
export const SearchParams = z.object({
  of: z.string().optional(),
  event: z.string().optional(),
  period: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  endDate: z.string().optional(),
  title: z.string().optional(),
  q: z.string().optional(),
  from: z.string().optional(),
  category: z.string().optional(),
  person: z.string().optional(),
  fromWeek: z.string().optional(),
})
export type SearchParams = z.infer<typeof SearchParams>

export const SearchParamKeys = SearchParams.keyof()
export type SearchParamKeys = z.infer<typeof SearchParamKeys>

export const SEARCH_PARAM_NEW = 'new'
export type SEARCH_PARAM_NEW = typeof SEARCH_PARAM_NEW

export const SEARCH_PARAM_SEARCH = 'search'
export type SEARCH_PARAM_SEARCH = typeof SEARCH_PARAM_SEARCH

export type ModifySearchParamsConfig = {
  update?: Partial<
    Record<
      SearchParamKeys,
      string | undefined | ((curr: string | null) => string)
    >
  >
  remove?: SearchParamKeys[] | true
  searchParams?: URLSearchParams
}

export const modifySearchParams = (config: ModifySearchParamsConfig) => {
  let searchParams =
    config.searchParams || new URLSearchParams(getWindow()?.location.search)
  if (config.remove) {
    if (config.remove === true) {
      searchParams = new URLSearchParams()
    } else {
      for (const key of config.remove) {
        searchParams.delete(key)
      }
    }
  }

  if (config.update) {
    for (const key in config.update) {
      const value = config.update[key as SearchParamKeys]
      if (value) {
        if (typeof value === 'function') {
          searchParams.set(key, value(searchParams.get(key)))
        } else {
          searchParams.set(key, value)
        }
      }
    }
  }

  return searchParams
}

export const modifyCurrentSearchParams = (
  config: Omit<ModifySearchParamsConfig, 'searchParams'>
) => {
  const url = new URL(getWindow()?.location.href || 'http://localhost')
  modifySearchParams({
    ...config,
    searchParams: url.searchParams,
  })
  return url.toString()
}
