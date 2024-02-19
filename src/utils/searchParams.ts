import { getWindow } from './misc'

export const SEARCH_PARAMS = {
  /** Reserved for the focus date of a week or month view */
  OF: 'of',
  /** Reserved for activating the event edit modal */
  EVENT: 'event',
  /** Reserved for activating the period edit modal */
  PERIOD: 'period',
  /** Used to prefill the start date of a form */
  DATE: 'date',
  /** Used to prefill the end date of a form */
  END_DATE: 'endDate',
  /** Used to prefill the title of a form */
  TITLE: 'title',
  /** Reserved for search queries */
  Q: 'q',
  /** Reserved for identifying originating path */
  FROM: 'from',
} as const
export type SEARCH_PARAMS = (typeof SEARCH_PARAMS)[keyof typeof SEARCH_PARAMS]

/** Reserved keyword for modals to indicate to create a new instance */
export const SEARCH_PARAMS_NEW = 'new'
export type SEARCH_PARAMS_NEW = typeof SEARCH_PARAMS_NEW

type UpdatedSearchParams = {
  update?: Partial<
    Record<
      SEARCH_PARAMS,
      string | undefined | ((current: string | null) => string)
    >
  >
  remove?: SEARCH_PARAMS[]
}

export const createUpdatedSearchParams = (config: UpdatedSearchParams) => {
  const url = new URL(getWindow()?.location.href || '')

  if (config.update) {
    for (const key in config.update) {
      const value = config.update[key as SEARCH_PARAMS]
      if (value) {
        if (typeof value === 'function') {
          url.searchParams.set(key, value(url.searchParams.get(key)))
        } else {
          url.searchParams.set(key, value)
        }
      }
    }
  }

  if (config.remove) {
    for (const key of config.remove) {
      url.searchParams.delete(key)
    }
  }

  return url.toString()
}
