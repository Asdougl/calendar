import { ChevronUpIcon } from '@heroicons/react/24/solid'
import { useEffect, useRef } from 'react'
import { cn } from '~/utils/classnames'

type SpinnerProps<T extends string | number> = {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  debug?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'auto'
  className?: string
  labels?: (value: T) => string
}

export const Spinner = <T extends string | number>({
  options,
  value,
  onChange,
  debug,
  disabled,
  size = 'md',
  className,
  labels,
}: SpinnerProps<T>) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget

    if (disabled) return

    if (updateTimeout.current !== null) {
      clearTimeout(updateTimeout.current)
    }

    updateTimeout.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = target
      const scrollPercent = scrollTop / (scrollHeight - clientHeight)
      const index = Math.round(scrollPercent * (options.length - 1))
      const newValue = options[index]
      if (newValue !== undefined && newValue !== value) {
        onChange(newValue)
      }
    }, 100)
  }

  useEffect(() => {
    if (scrollRef.current && value !== null) {
      // scroll to the option corresponding to the value
      const index = options.indexOf(value)
      const scrollPercent = index / (options.length - 1)
      const { scrollHeight, clientHeight } = scrollRef.current
      scrollRef.current.scrollTop =
        scrollPercent * (scrollHeight - clientHeight)
    }
  }, [value, options])

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-neutral-800',
        className
      )}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          'relative flex h-32 snap-y flex-col overflow-scroll bg-neutral-950 py-8',
          disabled ? 'pointer-events-none' : 'cursor-pointer'
        )}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={value === option || disabled}
            aria-label={`${labels ? labels(option) : option.toString()} ${
              value === option ? 'selected' : ''
            }`.trim()}
            className={cn(
              'snap-center border-y border-neutral-800 px-4 py-4 text-center font-mono',
              disabled ? 'text-neutral-600' : 'text-neutral-50',
              {
                'w-6 text-lg': size === 'sm',
                'w-12 text-xl': size === 'md',
                'w-18 text-xl': size === 'lg',
              }
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-between bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950 py-1.5">
        {!disabled && (
          <>
            <ChevronUpIcon
              height={20}
              className={cn(
                'opacity-0',
                value &&
                  options.indexOf(value) > 0 &&
                  'opacity-100 md:opacity-0 md:group-hover:opacity-100'
              )}
            />
            <ChevronUpIcon
              height={20}
              className={cn(
                'rotate-180 opacity-0',
                value &&
                  options.indexOf(value) < options.length - 1 &&
                  'opacity-100 md:opacity-0 md:group-hover:opacity-100'
              )}
            />
          </>
        )}
      </div>
      {debug && (
        <div className="absolute left-0 top-1/2 h-1 w-full border-t border-red-500"></div>
      )}
    </div>
  )
}
