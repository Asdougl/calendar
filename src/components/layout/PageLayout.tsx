import { type ReactNode, type FC, type PropsWithChildren } from 'react'
import { Navbar } from '../Navbar'
import { Header1 } from '../ui/headers'
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
> = ({ children, skeleton, hideNav, fullscreen }) => {
  return (
    <main className="flex min-h-screen flex-col px-2 md:px-0">
      <div
        className={cn(
          'mx-auto flex h-full w-full max-w-2xl flex-grow flex-col',
          { 'pb-24 lg:pb-0': !fullscreen }
        )}
      >
        {children}
      </div>
      {!hideNav && <Navbar loading={skeleton} />}
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
    <>
      <header className="flex items-center justify-between px-4 py-6">
        <div
          className={cn('flex h-full w-8', {
            'opacity-0': !headerLeft,
            'animate-pulse rounded-full bg-neutral-800': skeleton && headerLeft,
          })}
        >
          {!skeleton && headerLeft}
        </div>
        {typeof title === 'string' ? (
          <Header1
            skeleton={skeleton}
            className="relative flex h-8 items-baseline gap-2 text-2xl"
          >
            {title}
          </Header1>
        ) : (
          title
        )}
        <div
          className={cn('flex h-full w-8', {
            'opacity-0': !headerRight,
            'animate-pulse rounded-full bg-neutral-800':
              skeleton && headerRight,
          })}
        >
          {!skeleton && headerRight}
        </div>
      </header>
      {children}
    </>
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
