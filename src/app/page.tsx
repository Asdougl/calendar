import { redirect } from 'next/navigation'
import { DemoSevenDays } from './seven-days-demo'
import { ButtonLink } from '~/components/ui/button'
import { getServerAuthSession } from '~/server/auth'
import { env } from '~/env.mjs'
import { MarketingLayout } from '~/components/layout/MarketingLayout'

export default async function IndexPage() {
  const session = await getServerAuthSession()

  if (session && env.NODE_ENV !== 'development') {
    redirect('/inbox')
  }

  return (
    <MarketingLayout>
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-6 lg:pt-16">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col gap-8 pb-8 md:pr-12">
              <section>
                <h2 className="pb-2 text-4xl font-bold md:text-5xl lg:text-6xl">
                  A new way <br /> to view time.
                </h2>
                <h3 className="text-lg text-neutral-400 md:text-xl lg:text-2xl">
                  A calendar built for regular humans doing regular human things
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
              <section className="flex grow flex-col justify-end text-sm text-neutral-400 md:text-lg">
                <p className="text-base">
                  <span className="font-mono text-neutral-50">
                    asdougl/calendar
                  </span>{' '}
                  is currently a work in progress
                </p>{' '}
                <p className="text-xs">
                  You may experience bugs or missing features
                </p>
                {/* undo if you make the repo public */}
                <p className="pt-4">
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
            </div>
            <div className="flex h-[750px] flex-col gap-2">
              <DemoSevenDays />
              <p className="px-4 text-sm text-neutral-400">
                7 Day Inbox - drag the events to reschedule
              </p>
            </div>
          </div>
          <section className="pt-16">
            <h2 className="w-full text-center text-4xl font-bold">Features</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Inbox
                </h3>
                <p className="text-neutral-400">
                  A new way to view your events. Drag and drop to reschedule.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Quickly add events
                </h3>
                <p className="text-neutral-400">
                  Add events quickly without needing a schedule
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Todos in Calendar
                </h3>
                <p className="text-neutral-400">
                  Keep track of your tasks and events in one place.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Custom Categories
                </h3>
                <p className="text-neutral-400">
                  Organise your events with custom categories.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Multiplayer
                </h3>
                <p className="text-neutral-400">
                  Share event categories with friends and family
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Import and Export
                  <span className="rounded-full bg-orange-900 px-2 text-sm text-orange-200">
                    Coming Soon
                  </span>
                </h3>
                <p className="text-neutral-400">
                  Import and export to and from other calendars.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Share
                  <span className="rounded-full bg-blue-900 px-2 text-sm text-blue-200">
                    Pro
                  </span>
                  <span className="rounded-full bg-orange-900 px-2 text-sm text-orange-200">
                    Coming Soon
                  </span>
                </h3>
                <p className="text-neutral-400">
                  Share your events with anyone. No account required.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-900 px-4 py-3">
                <h3 className="flex items-center gap-2 text-2xl font-bold">
                  Customisation
                  <span className="rounded-full bg-blue-900 px-2 text-sm text-blue-200">
                    Pro
                  </span>
                  <span className="rounded-full bg-orange-900 px-2 text-sm text-orange-200">
                    Coming Soon
                  </span>
                </h3>
                <p className="text-neutral-400">
                  Themes, light mode, and custom domains.
                </p>
              </div>
            </div>
            {/* <p className="py-12">
              We&apos;re committed to a great free experience, but find our
              other plans on our{' '}
              <Link href="/pricing" className="font-bold hover:underline">
                Pricing Page
              </Link>
            </p> */}
          </section>
        </div>
      </main>
    </MarketingLayout>
  )
}
