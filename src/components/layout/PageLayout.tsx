import { type ReactNode, type FC, type PropsWithChildren } from 'react'
import { Navbar } from '../Navbar'
import { Header1 } from '../ui/headers'

export type PageLayoutProps = {
  title: ReactNode
  headerLeft?: ReactNode
  headerRight?: ReactNode
}

export const PageLayout: FC<PropsWithChildren<PageLayoutProps>> = ({
  children,
  title,
  headerLeft,
  headerRight,
}) => {
  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between px-4 py-6">
          <div className="flex h-full w-8">{headerLeft}</div>
          <Header1 className="relative flex h-8 items-baseline gap-2 text-2xl">
            {title}
          </Header1>
          <div className="flex h-full w-8">{headerRight}</div>
        </header>
        {children}
      </div>
      <Navbar loading />
    </main>
  )
}
