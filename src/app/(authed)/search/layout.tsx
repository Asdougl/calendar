import { type PropsWithChildren } from 'react'
import { SearchTabs } from './common'
import { InnerPageLayout } from '~/components/layout/PageLayout'

export default function SearchLayout({ children }: PropsWithChildren) {
  return (
    <InnerPageLayout title="Search">
      <SearchTabs />
      {children}
    </InnerPageLayout>
  )
}
