'use client'

import { addYears, differenceInDays, isSameDay, startOfDay } from 'date-fns'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { ButtonLink } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { pluralize } from '~/utils/misc'

const formatter = new Intl.DateTimeFormat('default', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const PeriodItem = ({
  period,
}: {
  period: NonNullable<RouterOutputs['periods']['range']>[number]
}) => {
  const daysDiff = differenceInDays(period.endDate, period.startDate) + 1

  return (
    <li className="flex gap-2 rounded-xl border border-neutral-800 p-2">
      <div
        className={cn(
          'flex w-8 items-center justify-center rounded-lg',
          color('bg')(period.color)
        )}
      >
        {period.icon}
      </div>
      <div className="flex flex-col">
        <div className="text-lg">{period.name}</div>
        <div className="flex gap-2 text-sm md:text-base">
          <span>{formatter.format(period.startDate)}</span>
          {isSameDay(period.startDate, period.endDate) ? null : (
            <>
              <span className="text-neutral-500">to</span>
              <span>{formatter.format(period.endDate)}</span>
              <span className="hidden text-neutral-500 md:inline">
                ({daysDiff} {pluralize(daysDiff, 'day', 'days')})
              </span>
            </>
          )}
        </div>
        <span className="text-sm text-neutral-500 md:hidden">
          {daysDiff} {pluralize(daysDiff, 'day', 'days')}
        </span>
      </div>
      <div className="flex flex-grow justify-end">
        <ButtonLink
          className="flex flex-col items-center justify-center"
          path="/periods/:id"
          params={{ id: period.id }}
        >
          Edit
        </ButtonLink>
      </div>
    </li>
  )
}

export const PeriodsView = () => {
  const { data: range } = api.periods.range.useQuery({
    start: startOfDay(new Date()),
    end: addYears(startOfDay(new Date()), 1),
  })

  return (
    <InnerPageLayout title="Periods">
      {range?.map((period) => <PeriodItem key={period.id} period={period} />)}
    </InnerPageLayout>
  )
}
