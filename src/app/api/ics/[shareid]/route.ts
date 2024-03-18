import { type NextRequest, NextResponse } from 'next/server'
import { unstable_cache as cache } from 'next/cache'
import { db } from '~/server/db'
import { PreferencesDefaults } from '~/types/preferences'
import {
  createCalendarIcs,
  createICSEvent,
  createICSPeriod,
} from '~/utils/calendar'
import { Duration } from '~/utils/dates'

const getEventsAndPeriods = cache(
  (userId: string) =>
    Promise.all([
      db.event.findMany({
        where: {
          createdById: userId,
          cancelled: false,
        },
      }),
      db.period.findMany({
        where: {
          createdById: userId,
        },
      }),
    ]),
  ['ics-events-periods'],
  {
    revalidate: Duration.minutes(30), // revalidate every half hour
  }
)

export const GET = async (
  _req: NextRequest,
  { params }: { params: { shareid: string } }
) => {
  const { shareid } = params

  const share = await db.share.findUnique({
    select: { id: true, expires: true, createdById: true },
    where: {
      id: shareid,
    },
  })

  if (!share) {
    return NextResponse.json({ error: 'Share not found' }, { status: 404 })
  }

  if (share.expires < new Date()) {
    return NextResponse.json({ error: 'Share expired' }, { status: 404 })
  }

  const user = await db.user.findUnique({
    select: { preferences: true }, // add something about plan = premium
    where: { id: share.createdById },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // query the next 6 months of events
  const [events, periods] = await getEventsAndPeriods(share.createdById)

  const preferences = PreferencesDefaults.parse(user?.preferences)

  // convert the events to ics
  const icsEvents = events.map((event) =>
    createICSEvent(event, preferences.timezone)
  )
  const icsPeriods = periods.map((period) =>
    createICSPeriod(period, preferences.timezone)
  )

  const ics = createCalendarIcs([...icsEvents, ...icsPeriods])

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="${shareid}.ics"`,
    },
  })
}
