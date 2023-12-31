import { addDays, endOfDay, format, startOfDay } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { Navbar } from '~/components/Navbar'
import { Header1 } from '~/components/ui/headers'
import { api } from '~/trpc/server'
import { isAuthed } from '~/utils/auth'
import { timeFormat } from '~/utils/dates'

export default async function Home() {
  await isAuthed()

  const preferences = await api.preferences.getAll.query()

  const events = await api.event.range.query({
    start: startOfDay(zonedTimeToUtc(new Date(), preferences.timezone)),
    end: endOfDay(addDays(zonedTimeToUtc(new Date(), preferences.timezone), 7)),
  })

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-6">
          <div className="relative">
            <Header1 className="bg-neutral-950 text-2xl">Inbox</Header1>
          </div>
        </header>
        <ul className="list-disc">
          {events.map((event) => (
            <li key={event.id}>
              {format(event.datetime, 'EEEE')}, {event.title},{' '}
              {timeFormat(event.datetime, preferences)}
            </li>
          ))}
        </ul>
      </div>
      <Navbar />
    </main>
  )
}
