import { redirect } from 'next/navigation'
import Image from 'next/image'
import { DemoSevenDays } from './seven-days-demo'
import { ButtonAnchor, ButtonLink } from '~/components/ui/button'
import { getServerAuthSession } from '~/server/auth'
import { Logo } from '~/components/Logo'

export default async function IndexPage() {
  const session = await getServerAuthSession()

  if (session) {
    redirect('/inbox')
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="md:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden md:block">
            <Logo size="md" />
          </div>
          <div className="flex gap-4">
            <ButtonAnchor
              href="https://github.com/asdougl/calendar"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <Image
                src="/github-mark.svg"
                width={18}
                height={18}
                alt="Github"
              />
              <span className="hidden md:inline">Github</span>
            </ButtonAnchor>
            <ButtonLink path="/login" intent="primary">
              Login
            </ButtonLink>
          </div>
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
                <p className="text-base">
                  <span className="font-mono text-neutral-50">
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
              <DemoSevenDays />
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
          <a
            className="underline"
            href="https://www.cameronburrows.com.au"
            target="_blank"
            rel="noreferrer"
          >
            Website
          </a>
          <a
            className="underline"
            href="https://www.github.com/asdougl"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </a>
          <a
            className="underline"
            href="https://www.twitter.com/_asdougl"
            target="_blank"
            rel="noreferrer"
          >
            X / Twitter
          </a>
        </p>
        <p className="text-xs">Build in Sydney, Australia</p>
      </footer>
    </div>
  )
}
