import { redirect } from 'next/navigation'
import { differenceInDays, format, isSameDay } from 'date-fns'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { cn, getCategoryColor } from '~/utils/classnames'
import { ButtonLink } from '~/components/ui/button'
import { PageLayout } from '~/components/layout/PageLayout'
import { type RouterOutputs } from '~/trpc/shared'
import { pluralize } from '~/utils/misc'

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
          getCategoryColor(period.color, 'bg')
        )}
      >
        {period.icon}
      </div>
      <div className="flex flex-col">
        <div className="text-lg">{period.name}</div>
        <div className="flex gap-2 text-sm md:text-base">
          <span>{format(period.startDate, 'd MMM yyyy')}</span>
          {isSameDay(period.startDate, period.endDate) ? null : (
            <>
              <span className="text-neutral-500">to</span>
              <span>{format(period.endDate, 'd MMM yyyy')}</span>
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

export default async function PeriodsPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const periods = await api.periods.range.query({
    start: new Date(),
    end: new Date(),
  })

  return (
    <PageLayout title="Periods">
      <ul className="flex flex-col gap-2 pb-6">
        {periods?.map((period) => (
          <PeriodItem key={period.id} period={period} />
        ))}
      </ul>
      <ButtonLink path="/periods/:id" params={{ id: 'new' }}>
        Create New
      </ButtonLink>
    </PageLayout>
  )
}
