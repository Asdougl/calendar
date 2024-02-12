import { set, setDay, startOfDay } from 'date-fns'
import { redirect } from 'next/navigation'
import { DemoDayBox } from './demo-daybox'
import { ButtonLink } from '~/components/ui/button'
import { getServerAuthSession } from '~/server/auth'
import { type RouterOutputs } from '~/trpc/shared'
import { createTempId } from '~/utils/misc'

type EventsByDay = Record<
  0 | 1 | 2 | 3 | 4 | 5 | 6,
  NonNullable<RouterOutputs['event']['range']>
>

type Event = RouterOutputs['event']['range'][number]

const createEvent = (
  params: Pick<Event, 'title' | 'datetime'> & Partial<Omit<Event, 'id'>>
): Event => {
  return {
    id: createTempId(),
    category: null,
    location: '123 Fake St, Sydney',
    endDateTime: null,
    timeStatus: 'STANDARD',
    ...params,
  }
}

const createShowcaseData = (focus: Date): EventsByDay => ({
  // Sunday
  0: [
    createEvent({
      title: 'Dinner at parents',
      datetime: set(setDay(focus, 7), {
        hours: 12,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'blue',
        name: 'Family',
      },
      location: '123 Fake St, Sydney',
    }),
    createEvent({
      title: 'Go for a run',
      datetime: set(setDay(focus, 7), {
        hours: 12,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
  ],
  // Monday
  1: [
    createEvent({
      title: 'Day off',
      datetime: setDay(focus, 8),
      timeStatus: 'ALL_DAY',
    }),
    createEvent({
      title: 'Workout',
      datetime: set(setDay(focus, 8), {
        hours: 18,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
  ],
  // Tuesday
  2: [],
  // Wednesday
  3: [],
  // Thursday
  4: [
    createEvent({
      title: 'In the office',
      datetime: set(setDay(focus, 4), {
        hours: 9,
        minutes: 0,
      }),
    }),
    createEvent({
      title: 'Workout',
      datetime: set(setDay(focus, 4), {
        hours: 18,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
  ],
  // Friday
  5: [
    createEvent({
      title: 'Get on the beers',
      datetime: set(setDay(focus, 6), {
        hours: 17,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'green',
        name: 'Friends',
      },
    }),
  ],
  // Saturday
  6: [
    createEvent({
      title: 'Go to the market',
      datetime: set(setDay(focus, 6), {
        hours: 9,
        minutes: 0,
      }),
    }),
    createEvent({
      title: 'Lunch with friends',
      datetime: set(setDay(focus, 6), {
        hours: 12,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'green',
        name: 'Friends',
      },
    }),
    createEvent({
      title: 'Dinner with in-laws',
      datetime: set(setDay(focus, 6), {
        hours: 20,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'blue',
        name: 'Family',
      },
    }),
  ],
})

export default async function IndexPage() {
  const session = await getServerAuthSession()

  if (session) {
    redirect('/inbox')
  }

  const focusDate = startOfDay(new Date())

  const showcaseData = createShowcaseData(focusDate)

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <h1 className="font-mono text-xl">asdougl/calendar</h1>
          <ButtonLink path="/login">Login</ButtonLink>
        </div>
      </header>
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-6 lg:pt-16">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col gap-8 pb-8 md:pr-12">
              <section>
                <h2 className="pb-2 text-4xl font-bold md:text-5xl lg:text-6xl">
                  A new way <br /> to view time.
                </h2>
                <h3 className="text-lg text-neutral-400 md:text-xl lg:text-2xl">
                  Less time spend less time managing your calendar, more time
                  enjoying your life.
                </h3>
              </section>
              <section className="flex gap-4">
                <ButtonLink
                  size="xl"
                  intent="primary"
                  path="/login"
                  query={{ from: 'sign-up' }}
                >
                  Sign up
                </ButtonLink>
                <ButtonLink size="xl" path="/login" query={{ from: 'login' }}>
                  Login
                </ButtonLink>
              </section>
              <section className="text-sm text-neutral-400 md:text-lg">
                <p>
                  <span className="font-mono text-xs text-neutral-50 lg:text-base">
                    asdougl/calendar
                  </span>{' '}
                  is currently a work in progress.
                </p>{' '}
                <p className="text-xs">
                  You may experience bugs or missing features.
                </p>
                {/* undo if you make the repo public */}
                <p className="hidden">
                  Join the development on{' '}
                  <a
                    href="https://github.com/asdougl/calendar"
                    target="_blank"
                    className="text-neutral-50 underline hover:text-neutral-400"
                    rel="noreferrer"
                  >
                    Github
                  </a>
                </p>
              </section>
              <section className="hidden md:block">
                <h3 className="text-2xl font-bold">How it works</h3>
                <p className="text-lg text-neutral-400">
                  Calendar is a simple calendar app that helps you focus on the
                  week ahead.
                </p>
              </section>
              <section className="hidden md:block">
                <h3 className="text-2xl font-bold">Features</h3>
                <ul className="list-inside list-disc text-lg text-neutral-400">
                  <li>Simple, easy to use interface</li>
                  <li>Fast, responsive design</li>
                  <li>Mobile friendly</li>
                  <li>Dark mode</li>
                </ul>
              </section>
            </div>
            <div className="flex h-full min-h-[600px] gap-2">
              <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={6}
                  eventsMap={showcaseData}
                />
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={0}
                  eventsMap={showcaseData}
                />
              </div>
              <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={5}
                  eventsMap={showcaseData}
                />
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={4}
                  eventsMap={showcaseData}
                />
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={3}
                  eventsMap={showcaseData}
                />
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={2}
                  eventsMap={showcaseData}
                />
                <DemoDayBox
                  focusDate={focusDate}
                  dayOfWeek={1}
                  eventsMap={showcaseData}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-8 py-12 pb-8 md:hidden">
            <section className="">
              <h3 className="text-2xl font-bold">How it works</h3>
              <p className="text-lg text-neutral-400">
                Calendar is a simple calendar app that helps you focus on the
                week ahead.
              </p>
            </section>
            <section className="">
              <h3 className="text-2xl font-bold">Features</h3>
              <ul className="list-inside list-disc text-lg text-neutral-400">
                <li>Simple, easy to use interface</li>
                <li>Fast, responsive design</li>
                <li>Mobile friendly</li>
                <li>Dark mode</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <footer className="container mx-auto px-4 pb-12 pt-6 text-neutral-400">
        <p>Copyright &copy; {new Date().getFullYear()} Cameron Burrows</p>
        <p className="flex gap-2">
          <a className="underline" href="www.cameronburrows.com.au">
            Website
          </a>
          <a className="underline" href="www.github.com/asdougl">
            Github
          </a>
          <a className="underline" href="www.twitter.com/_asdougl">
            X / Twitter
          </a>
        </p>
        <p className="text-xs">Build in Sydney, Australia</p>
      </footer>
    </div>
  )
}
