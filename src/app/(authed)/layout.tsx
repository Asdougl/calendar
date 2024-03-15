import { type ReactNode } from 'react'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function AuthedLayout({
  children,
}: {
  children: ReactNode
}) {
  await isAuthed()

  return <OuterPageLayout fullscreen>{children}</OuterPageLayout>
}
