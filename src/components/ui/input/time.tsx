import { useState, type FC, type ChangeEvent } from 'react'
import { Input, type InputProps } from '.'

type HoursMinutes = {
  hours: number
  minutes: number
}

type TimeMatcher = (value: string) => HoursMinutes | null

const match = (regex: RegExp, value: string) => {
  const match = value.match(regex)
  if (!match) return []
  return match
}

const isValidTime = (hours: number, minutes: number) => {
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

// Possible time regexes:
const TimeMatchers: TimeMatcher[] = [
  // hh:mm
  (value) => {
    const [, rawHours, rawMinutes] = match(/^([0-9]{2}):([0-9]{2})$/, value)
    if (!rawHours || !rawMinutes) return null
    return {
      hours: parseInt(rawHours),
      minutes: parseInt(rawMinutes),
    }
  },
  // hhmm
  (value) => {
    const [, rawHours, rawMinutes] = match(/^([0-9]{2})([0-9]{2})$/, value)
    if (!rawHours || !rawMinutes) return null
    return {
      hours: parseInt(rawHours),
      minutes: parseInt(rawMinutes),
    }
  },
  // h:mm
  (value) => {
    const [, rawHours, rawMinutes] = match(/^([0-9]{1,2}):([0-9]{2})$/, value)
    if (!rawHours || !rawMinutes) return null
    return {
      hours: parseInt(rawHours),
      minutes: parseInt(rawMinutes),
    }
  },
  // hmm
  (value) => {
    const [, rawHours, rawMinutes] = match(/^([0-9]{1,2})([0-9]{2})$/, value)
    if (!rawHours || !rawMinutes) return null
    return {
      hours: parseInt(rawHours),
      minutes: parseInt(rawMinutes),
    }
  },
  // hh:mma
  (value) => {
    const [, rawHours, rawMinutes, rawMeridien] = match(
      /^([0-9]{2}):([0-9]{2}) *([ap]m?)$/i,
      value
    )
    if (!rawHours || !rawMinutes || !rawMeridien) return null
    let hours = parseInt(rawHours)
    const minutes = parseInt(rawMinutes)
    const meridien = rawMeridien?.toLowerCase()

    if (hours > 12) return null

    if (meridien.startsWith('p') && hours < 12) hours += 12
    else if (meridien.startsWith('a') && hours === 12) hours = 0

    return {
      hours,
      minutes,
    }
  },
  // hhmma
  (value) => {
    const [, rawHours, rawMinutes, rawMeridien] = match(
      /^([0-9]{2})([0-9]{2}) *([ap]m?)$/i,
      value
    )
    if (!rawHours || !rawMinutes || !rawMeridien) return null
    let hours = parseInt(rawHours)
    const minutes = parseInt(rawMinutes)
    const meridien = rawMeridien?.toLowerCase()

    if (hours > 12) return null

    if (meridien.startsWith('p') && hours < 12) hours += 12
    else if (meridien.startsWith('a') && hours === 12) hours = 0

    return {
      hours,
      minutes,
    }
  },
  // h:mma
  (value) => {
    const [, rawHours, rawMinutes, rawMeridien] = match(
      /^([0-9]{1,2}):([0-9]{2}) *([ap]m?)$/i,
      value
    )
    if (!rawHours || !rawMinutes || !rawMeridien) return null
    let hours = parseInt(rawHours)
    const minutes = parseInt(rawMinutes)
    const meridien = rawMeridien?.toLowerCase()

    if (hours > 12) return null

    if (meridien.startsWith('p') && hours < 12) hours += 12
    else if (meridien.startsWith('a') && hours === 12) hours = 0

    return {
      hours,
      minutes,
    }
  },
  // hmma
  (value) => {
    const [, rawHours, rawMinutes, rawMeridien] = match(
      /^([0-9]{1,2})([0-9]{2}) *([ap]m?)$/i,
      value
    )
    if (!rawHours || !rawMinutes || !rawMeridien) return null
    let hours = parseInt(rawHours)
    const minutes = parseInt(rawMinutes)
    const meridien = rawMeridien?.toLowerCase()

    if (hours > 12) return null

    if (meridien.startsWith('p') && hours < 12) hours += 12
    else if (meridien.startsWith('a') && hours === 12) hours = 0

    return {
      hours,
      minutes,
    }
  },
  // ha
  (value) => {
    const [, rawHours, rawMeridien] = match(/^([0-9]{1,2}) *([ap]m?)$/i, value)
    if (!rawHours || !rawMeridien) return null
    let hours = parseInt(rawHours)
    const meridien = rawMeridien?.toLowerCase()

    if (hours > 12) return null

    if (meridien.startsWith('p') && hours < 12) hours += 12
    else if (meridien.startsWith('a') && hours === 12) hours = 0

    return {
      hours,
      minutes: 0,
    }
  },
]

const okSymbols = /^[0-9 :.ampAMP]*$/

type TimeInputProps = Omit<
  InputProps,
  'value' | 'onChange' | 'type' | 'warning'
> & {
  value: string | null
  onChange: (value: string | null) => void
}

export const TimeInput: FC<TimeInputProps> = ({
  value,
  onChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '')
  const [hasGoodValue, setHasGoodValue] = useState(() => {
    return TimeMatchers.some((matcher) => (value ? matcher(value) : true))
  })

  const onInternalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value.length > 8 || !okSymbols.test(value)) return

    setInternalValue(value)
    // try and cooerce the value into a valid time
    let currentMatch: HoursMinutes | null = null

    for (const matcher of TimeMatchers) {
      const match = matcher(value)
      if (match) {
        currentMatch = match
        break
      }
    }

    if (!currentMatch) {
      setHasGoodValue(false)
      onChange(null)
      return
    }

    const { hours, minutes } = currentMatch

    if (!isValidTime(hours, minutes)) {
      setHasGoodValue(false)
      onChange(null)
      return
    }

    setHasGoodValue(true)
    onChange(
      `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`
    )
  }

  return (
    <Input
      {...props}
      type="text"
      value={internalValue}
      warning={!hasGoodValue}
      onChange={onInternalChange}
    />
  )
}
