import { createContext, useContext } from 'react'

type SevenDaysContext = {
  baseDate: Date
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6
  outlines?: boolean
  loading?: boolean
  usedIn?: 'shared' | 'inbox' | 'week'
  week?: string
}

export const SevenDaysContext = createContext<SevenDaysContext>({
  baseDate: new Date(),
  weekStart: 1,
})

export const SevenDaysProvider = SevenDaysContext.Provider

export const useSevenDaysCtx = () => {
  return useContext(SevenDaysContext)
}
