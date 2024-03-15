import { redirect } from 'next/navigation'
import { type ReactNode } from 'react'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { env } from '~/env.mjs'

export default function DevLayout({ children }: { children: ReactNode }) {
  if (env.NODE_ENV !== 'development') {
    redirect('/')
  }

  return <OuterPageLayout>{children}</OuterPageLayout>
}
