import { SkeletonText } from '~/components/skeleton/Text'

export const SkeletonDivider = () => (
  <li className="w-full pt-6">
    <div className="group flex items-center justify-between gap-1">
      <SkeletonText skeletonized className="text-lg font-semibold">
        January 2024
      </SkeletonText>
    </div>
  </li>
)

export const SkeletonEvent = () => (
  <li className="">
    <div className="group flex items-center justify-between gap-1 overflow-hidden rounded-lg border border-neutral-800 px-2 py-1">
      <div className="flex items-center justify-start gap-2 overflow-hidden">
        <div className="h-10 w-1 flex-shrink-0 rounded-full bg-neutral-800"></div>
        <div className="flex flex-col">
          <SkeletonText
            skeletonized
            className="flex-grow-0 truncate text-left text-lg leading-snug"
          >
            New Event
          </SkeletonText>
          <SkeletonText
            skeletonized
            className="flex-grow-0 truncate text-left text-lg leading-snug"
          >
            Monday, Jan 10
          </SkeletonText>
        </div>
      </div>
    </div>
  </li>
)
