import { LayoutGroup, motion } from 'framer-motion'
import { cn } from '~/utils/classnames'

type Option<T extends string | number> = {
  label: string
  value: T
}

type TabSelectable<T extends string | number> = T | Option<T>

type TabSelectProps<Value extends string | number> = {
  options: Readonly<TabSelectable<Value>[]>
  value: Value
  onChange: (value: Value) => void
  className?: string
}

export const TabSelect = <Value extends string | number>({
  options,
  value,
  onChange,
  className,
}: TabSelectProps<Value>) => {
  return (
    <div
      className={cn(
        'flex gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-1',
        className
      )}
    >
      <LayoutGroup>
        {options.map((option) => {
          const label =
            typeof option == 'string' || typeof option === 'number'
              ? option
              : option.label
          const optionValue =
            typeof option === 'string' || typeof option === 'number'
              ? option
              : option.value
          return (
            <button
              key={optionValue}
              type="button"
              className={cn('relative flex-grow px-4 py-2')}
              onClick={() => onChange(optionValue)}
            >
              {value === optionValue && (
                <motion.div
                  layoutId="select-active"
                  className="absolute left-0 top-0 h-full w-full rounded bg-neutral-800"
                ></motion.div>
              )}
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </LayoutGroup>
    </div>
  )
}
