export const DayBoxSkeleton = () => {
  return (
    <div className="flex-grow rounded-lg border border-neutral-800 px-2 py-1">
      <div className="flex justify-between">
        <div className="flex items-baseline gap-1">
          <span className="my-2 h-4 w-12 animate-pulse rounded-full bg-neutral-900"></span>
        </div>
      </div>
      <ul className="flex flex-col gap-1 py-1">
        <li className="my-2 h-4 w-3/4 animate-pulse rounded-full bg-neutral-900"></li>
      </ul>
    </div>
  )
}
