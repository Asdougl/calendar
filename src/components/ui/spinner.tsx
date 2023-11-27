import { useEffect, useRef } from 'react'
import { cn } from '~/utils/classnames'

type SpinnerProps<T extends string | number> = {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  debug?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'auto'
}

export const Spinner = <T extends string | number>({
  options,
  value,
  onChange,
  debug,
  disabled,
  size = 'md',
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
    <div className="relative overflow-hidden rounded-lg border border-neutral-800">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          'relative h-32 snap-y overflow-scroll bg-neutral-950 py-8',
          disabled ? 'pointer-events-none' : 'cursor-pointer'
        )}
      >
        {options.map((option) => (
          <div
            key={option}
            className={cn(
              'snap-center border-y border-neutral-800 px-4 py-4 text-center font-mono',
              disabled ? 'text-neutral-600' : 'text-neutral-50',
              {
                'w-6 text-lg': size === 'sm',
                'w-14 text-xl': size === 'md',
                'w-20 text-xl': size === 'lg',
                'w-auto text-base': size === 'auto',
              }
            )}
          >
            {option}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950"></div>
      {debug && (
        <div className="absolute left-0 top-1/2 h-1 w-full border-t border-red-500"></div>
      )}
    </div>
  )
}
