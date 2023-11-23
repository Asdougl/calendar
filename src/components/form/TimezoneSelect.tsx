import { useState, type FC, useRef } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { Button } from '../ui/button'
import { SkeletonText } from '../skeleton/Text'
import { cn } from '~/utils/classnames'

type TimezoneSelectProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
}

const TIMEZONE_OPTIONS = Intl.supportedValuesOf('timeZone')

const TimezoneText = ({ value }: { value: string }) => {
  const [region, city] = value.split('/')
  return city ? (
    <span>
      {city?.replaceAll('_', ' ')},
      <span className="text-neutral-400"> {region?.replaceAll('_', ' ')}</span>
    </span>
  ) : (
    <span>{value}</span>
  )
}

export const TimezoneSelect: FC<TimezoneSelectProps> = ({
  value,
  onChange,
  disabled,
  id,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searching, setSearching] = useState(false)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onSearch = (value: string) => {
    setSearch(value)
    setSearching(true)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      const results: string[] = []
      for (const tz of TIMEZONE_OPTIONS) {
        if (tz.toLowerCase().includes(value.toLowerCase())) results.push(tz)
      }
      const limitedResults = results.slice(0, 10)
      if (results.length > 10) {
        limitedResults.push(`+${results.length - 10} more results`)
      }

      setSearchResults(limitedResults)
      setSearching(false)
    }, 500)
  }

  const toggleOpen = () => {
    setOpen((prev) => !prev)
    setSearch('')
    setSearchResults([])
    setSearching(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={toggleOpen}>
      <Popover.Trigger asChild>
        <Button
          id={id}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-center gap-1',
            className
          )}
        >
          <TimezoneText value={value} />
          <ChevronDownIcon className="h-5 w-5" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="relative z-10 rounded-lg border border-neutral-800 bg-neutral-950 md:w-auto">
          {/* Search */}
          <div className="flex items-center justify-center gap-2 border-b border-neutral-800 p-2 ring-neutral-400">
            <MagnifyingGlassIcon height={18} className="text-neutral-400" />
            <input
              type="text"
              className="w-full flex-grow bg-transparent text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
              placeholder="Search timezones..."
              value={search}
              onChange={(e) => onSearch(e.currentTarget.value)}
            />
          </div>
          {/* Results */}

          {search && (
            <ul className="flex flex-col gap-1 py-2">
              {searchResults.length ? (
                searchResults.map((tz, index) => (
                  <li key={tz} className={searching ? 'opacity-50' : ''}>
                    {index < 10 ? (
                      <button
                        disabled={searching || disabled}
                        onClick={() => onChange(tz)}
                        className="w-full px-4 text-left hover:bg-neutral-900 hover:text-neutral-50"
                      >
                        <TimezoneText value={tz} />
                      </button>
                    ) : (
                      <span className="px-4 text-sm opacity-50">{tz}</span>
                    )}
                  </li>
                ))
              ) : searching ? (
                <li className="px-4 opacity-50">
                  <SkeletonText skeletonized>timezone</SkeletonText>
                </li>
              ) : (
                <li className="px-4 opacity-50">No timezones found</li>
              )}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
