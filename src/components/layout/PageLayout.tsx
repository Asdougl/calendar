import { type ReactNode, type FC, type PropsWithChildren } from 'react'
import { Header1 } from '../ui/headers'
import { EventModal } from '../modals/EventModal'
import { PeriodModal } from '../modals/PeriodModal'
import { PowerNavBar } from '../PowerNavBar'
import { cn } from '~/utils/classnames'

export type PageLayoutProps = {
  title: ReactNode
  headerLeft?: ReactNode
  headerRight?: ReactNode
  skeleton?: boolean
  hideNav?: boolean
  fullscreen?: boolean
}

export const OuterPageLayout: FC<
  PropsWithChildren<
    Pick<PageLayoutProps, 'skeleton' | 'hideNav' | 'fullscreen'>
  >
> = ({ children }) => {
  return (
    <main className="flex h-screen w-screen grid-cols-[256px_1fr] flex-col-reverse overflow-hidden lg:grid">
      <PowerNavBar />
      {children}
    </main>
  )
}

export const InnerPageLayout: FC<PropsWithChildren<PageLayoutProps>> = ({
  children,
  title,
  headerLeft,
  headerRight,
  skeleton,
}) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl grow flex-col overflow-auto px-2 lg:pb-4">
      <header className="grid grid-cols-5 px-2 py-4">
        <div
          className={cn('flex justify-start', {
            'opacity-0': !headerLeft,
            'animate-pulse rounded-full bg-neutral-800': skeleton && headerLeft,
          })}
        >
          {!skeleton && headerLeft}
        </div>
        {typeof title === 'string' ? (
          <Header1
            skeleton={skeleton}
            className="relative col-span-3 flex h-8 items-baseline justify-center gap-2 text-2xl"
          >
            {title}
          </Header1>
        ) : (
          title
        )}
        <div
          className={cn('flex justify-end', {
            'opacity-0': !headerRight,
            'animate-pulse rounded-full bg-neutral-800':
              skeleton && headerRight,
          })}
        >
          {!skeleton && headerRight}
        </div>
      </header>
      {children}
      <EventModal />
      <PeriodModal />
    </div>
  )
}

export const PageLayout: FC<PropsWithChildren<PageLayoutProps>> = ({
  children,
  ...props
}) => {
  return (
    <OuterPageLayout {...props}>
      <InnerPageLayout {...props}>{children}</InnerPageLayout>
    </OuterPageLayout>
  )
}
