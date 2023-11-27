import { CheckIcon } from '@heroicons/react/24/solid'
import { InlineLoader } from '../ui/Loader'
import { Header3 } from '../ui/headers'
import { cn } from '~/utils/classnames'

export const SettingItem = ({
  title,
  children,
  skeleton,
}: {
  title: string
  children: React.ReactNode
  skeleton?: boolean
}) => (
  <li className="grid h-12 grid-cols-3">
    <div className="flex items-center justify-start px-4 text-sm">
      <span
        className={cn(
          skeleton &&
            'animate-pulse rounded-full bg-neutral-800 text-transparent'
        )}
      >
        {title}
      </span>
    </div>
    <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
      {skeleton ? <InlineLoader /> : children}
    </div>
  </li>
)

export const SettingList = ({
  title,
  children,
  saving,
}: {
  title: string
  children: React.ReactNode
  saving?: boolean
}) => (
  <div className="px-4">
    <div className="flex justify-between px-2 py-2">
      <Header3>{title}</Header3>
      {saving !== undefined && (
        <div className="flex items-center gap-1 text-sm text-neutral-400">
          {saving ? (
            <>
              <InlineLoader /> Saving...
            </>
          ) : (
            <span className="flex animate-slow-fade-out items-center gap-1">
              <CheckIcon height={16} /> Saved
            </span>
          )}
        </div>
      )}
    </div>
    <ul className="flex-grow-0 divide-y divide-neutral-800 rounded-lg border border-neutral-800">
      {children}
    </ul>
  </div>
)
