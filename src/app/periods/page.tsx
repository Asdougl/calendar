import { redirect } from 'next/navigation'
import { addYears, differenceInDays, format } from 'date-fns'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { Header1 } from '~/components/ui/headers'
import { cn, getCategoryColor } from '~/utils/classnames'
import { ButtonLink } from '~/components/ui/button'

export default async function PeriodsPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const periods = await api.periods.range.query({
    start: new Date(),
    end: addYears(new Date(), 1),
  })

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-6">
          <Header1>Periods</Header1>
        </header>
        <ul className="flex flex-col gap-2">
          {periods.map((period) => (
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
      <Navbar />
    </main>
  )
}
