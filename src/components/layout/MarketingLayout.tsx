import { type ReactNode } from 'react'
import Image from 'next/image'
import { ButtonAnchor, ButtonLink } from '../ui/button'
import { Logo } from '../Logo'

export const MarketingLayout = ({ children }: { children: ReactNode }) => {
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
      {children}
      <footer className="container mx-auto px-4 pb-12 pt-24 text-neutral-400 lg:pt-32">
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
        <p className="text-xs">Built in Sydney, Australia</p>
      </footer>
    </div>
  )
}
