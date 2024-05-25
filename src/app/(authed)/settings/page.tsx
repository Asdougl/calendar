import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import {
  DebugSection,
  PreferencesSection,
  ProfileSection,
} from './profile-sections'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/utils/nav/Link'

export default function SettingsPage() {
  return (
    <InnerPageLayout
      headerLeft={
        <PathLink path="/profile" className="flex items-center justify-center">
          <ArrowLeftIcon height={20} className="" />
        </PathLink>
      }
      title="Settings"
    >
      <div className="flex flex-col gap-4 overflow-y-auto">
        <ProfileSection />
        <PreferencesSection />
        <DebugSection />
      </div>
    </InnerPageLayout>
  )
}
