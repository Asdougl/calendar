import { differenceInDays, format } from 'date-fns'
import { ButtonLink } from '~/components/ui/button'
import { Header1 } from '~/components/ui/headers'
import { api } from '~/trpc/react'
import { cn, getCategoryColor } from '~/utils/classnames'

export const PeriodsView = () => {
  const { data: periods } = api.periods.range.useQuery({
    start: new Date(),
    end: new Date(),
  })

  return (
    <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-6">
        <Header1>Periods</Header1>
      </header>
      <ul className="flex flex-col gap-2">
        {periods?.map((period) => (
          <li
            key={period.id}
            className="flex gap-2 rounded-lg border border-neutral-900 px-4 py-2"
          >
            <div
              className={cn(
                'flex w-6 items-center justify-center rounded-lg',
                getCategoryColor(period.color, 'bg')
              )}
            >
              {period.icon}
            </div>
            <div className="flex flex-col">
              <div className="text-lg">{period.name}</div>
              <div className="flex gap-2 text-neutral-500">
                <span>{format(period.startDate, 'd MMM yyyy')}</span>
                <span>to</span>
                <span>{format(period.endDate, 'd MMM yyyy')}</span>
                <span>
                  ({differenceInDays(period.endDate, period.startDate)} days)
                </span>
              </div>
            </div>
            <div className="flex flex-grow justify-end">
              <ButtonLink
                className="block"
                path="/periods/:id"
                params={{ id: period.id }}
              >
                Edit
              </ButtonLink>
            </div>
          </li>
        ))}
      </ul>
      <ButtonLink path="/periods/:id" params={{ id: 'new' }}>
        Create New
      </ButtonLink>
    </div>
  )
}
