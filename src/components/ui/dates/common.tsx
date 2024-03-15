import { format, isAfter, isBefore, setDate } from 'date-fns'

export const MONTH_OPTIONS = [
  <option key={0} value={0}>
    January
  </option>,
  <option key={1} value={1}>
    February
  </option>,
  <option key={2} value={2}>
    March
  </option>,
  <option key={3} value={3}>
    April
  </option>,
  <option key={4} value={4}>
    May
  </option>,
  <option key={5} value={5}>
    June
  </option>,
  <option key={6} value={6}>
    July
  </option>,
  <option key={7} value={7}>
    August
  </option>,
  <option key={8} value={8}>
    September
  </option>,
  <option key={9} value={9}>
    October
  </option>,
  <option key={10} value={10}>
    November
  </option>,
  <option key={11} value={11}>
    December
  </option>,
]

export const STD_FORMAT = 'yyyy-MM-dd'
export const DISPLAY_FORMAT = 'd MMM yyyy'
export const ACCESSIBLE_FORMAT = 'd, eeee, MMMM yyyy'

export const stdFormat = (date: Date) => format(date, STD_FORMAT)
export const displayFormat = (date: Date) => format(date, DISPLAY_FORMAT)
export const accessibleFormat = (date: Date) => format(date, ACCESSIBLE_FORMAT)

export const isDisabled = (test: Date, min?: Date, max?: Date) => {
  if (max && isAfter(test, max)) {
    return true
  }
  if (min && isBefore(test, min)) {
    return true
  }
  return false
}

export const getInitialFocus = (initialDate?: Date) => {
  return setDate(initialDate ?? new Date(), 1)
}

export const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
