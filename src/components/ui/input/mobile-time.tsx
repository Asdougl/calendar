import { useState, type FC, useEffect } from 'react'
import { Spinner } from '../spinner'
import { cn } from '~/utils/classnames'

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const HOURS_24 = [...Array(24).keys()]
const MINUTES = [
  '00',
  '05',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
]

type MobileTimeInputProps = {
  value: string | null
  onChange: (value: string | null) => void
  type: '12' | '24'
  disabled?: boolean
  className?: string
}

type UpdateMap = {
  hours: number | null
  minutes: number | null
  meridiem: 'am' | 'pm' | null
}

// Regex to match 12 hour or 24 hour time
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]).*([aApP](?:m|M))?$/

export const MobileTimeInput: FC<MobileTimeInputProps> = ({
  value,
  onChange,
  type,
  disabled,
  className,
}) => {
  const [hours, setHours] = useState<number>(() => {
    if (!value) return type === '12' ? 8 : 0
    const match = value.match(TIME_REGEX)
    if (!match) return 1
    const rawHours = match[1]
    if (!rawHours) return type === '12' ? 1 : 0
    const hours = parseInt(rawHours)
    return type === '12' ? (hours > 12 ? hours - 12 : hours) : hours
  })
  const [minutes, setMinutes] = useState<number>(() => {
    if (!value) return 0
    const match = value.match(TIME_REGEX)
    if (!match) return 1
    const rawMinutes = match[2]
    return rawMinutes ? parseInt(rawMinutes) : 1
  })
  const [meridiem, setMeridiem] = useState<'am' | 'pm'>(() => {
    if (!value) return 'am'
    const match = value.match(/([aApP](?:m|M))$/)
    if (!match) return 'am'

    const rawMeridiem = match[1]
    if (rawMeridiem) {
      if (rawMeridiem.toLowerCase() === 'am') return 'am'
      else return 'pm'
    } else {
      const rawHours = match[1]
      if (rawHours) {
        const hours = parseInt(rawHours)
        if (hours < 12) return 'am'
        else return 'pm'
      }
      return 'am'
    }
  })

  const build = (update: UpdateMap) => {
    const { hours, minutes, meridiem } = update
    if (hours === null || minutes === null) {
      onChange(null)
      return
    }

    // format to 24 hours regardless of type
    let formattedHours = hours
    if (type === '12') {
      if (meridiem === 'am' && hours === 12) formattedHours = 0
      else if (type === '12' && meridiem === 'pm' && hours < 12)
        formattedHours += 12
    }

    onChange(`${formattedHours}:${minutes.toString().padStart(2, '0')}`)
  }

  useEffect(() => {
    if (type === '12') {
      // must be going from 24 to 12
      setHours((curr) => {
        if (curr > 12) return curr - 12
        if (curr === 0) return 12
        else return curr
      })
      if (hours > 12) setMeridiem('pm')
    } else {
      // must be going from 12 to 24
      setHours((curr) => {
        if (meridiem === 'pm' && curr < 12) return curr + 12
        else if (meridiem === 'am' && curr === 12) return 0
        else return curr
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const updateHours = (hours: number) => {
    setHours(hours)
    build({ hours, minutes, meridiem })
  }

  const updateMinutes = (minutes: string) => {
    setMinutes(parseInt(minutes))
    build({ hours, minutes: parseInt(minutes), meridiem })
  }

  const updateMeridiem = (meridiem: 'am' | 'pm') => {
    setMeridiem(meridiem)
    build({ hours, minutes, meridiem })
  }

  return (
    <div className={cn('flex justify-center gap-2', className)}>
      <Spinner
        options={type === '12' ? HOURS_12 : HOURS_24}
        value={hours}
        onChange={updateHours}
        disabled={disabled}
        size="lg"
        className="flex-1"
      />
      <Spinner
        options={MINUTES}
        value={minutes.toString().padStart(2, '0')}
        onChange={updateMinutes}
        disabled={disabled}
        size="lg"
        className="flex-1"
      />
      {type === '12' && (
        <Spinner
          options={['am', 'pm']}
          value={meridiem}
          onChange={updateMeridiem}
          disabled={disabled}
          size="lg"
          className="flex-1"
        />
      )}
    </div>
  )
}
