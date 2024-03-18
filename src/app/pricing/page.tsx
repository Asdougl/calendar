import {
  CheckIcon,
  BeakerIcon,
  RocketLaunchIcon,
  HomeIcon,
} from '@heroicons/react/24/solid'
import { MarketingLayout } from '~/components/layout/MarketingLayout'
import { Alert } from '~/components/ui/Alert'
import { Button, ButtonLink } from '~/components/ui/button'

const plans = {
  free: {
    features: [
      '7 Day Inbox',
      'Month View',
      'Todos',
      'Periods',
      'Categories',
      'Export / Import Data (coming soon)',
    ],
  },
  pro: {
    features: [
      'Themes',
      'ICS Sync Support',
      'Public Share Links',
      'Multiplayer',
    ],
  },
  custom: {
    features: [
      'Early Access',
      'Direct Developer Contact',
      'Custom Deployment',
      'Custom Branding',
      'Custom Domains',
      'Single Sign On',
    ],
  },
}

export default function PricingPage() {
  return (
    <MarketingLayout>
      <main className="container mx-auto flex flex-col gap-8 px-4 pb-8 pt-6 lg:pt-16">
        <div className="pb-6">
          <h2 className="pb-2 text-4xl font-bold md:text-5xl lg:text-6xl">
            Pricing
          </h2>
          <div className="py-6">
            <Alert
              level="warning"
              title="Coming Soon"
              message="We are still working on the payment system and the features that
            come with it. We will be sure to let you know when it is ready."
            />
          </div>
          <p className="max-w-2xl text-neutral-400">
            We&apos;re focused on delivering a great{' '}
            <span className="underline">free</span> experience but we offer
            plans for those who need more to support the project&apos;s
            development.
          </p>
        </div>
        <div className="flex flex-col gap-4 max-lg:items-center lg:grid lg:grid-cols-3">
          {/* FREE */}
          <div className="relative flex w-full max-w-md flex-col gap-4 rounded-lg border border-neutral-400 p-8 shadow-md shadow-neutral-600">
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full bg-neutral-100 px-4 py-1 font-bold text-neutral-950">
              Recommended
            </div>
            <div className="flex justify-between">
              <h3 className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 text-2xl font-bold">
                <HomeIcon width={16} />
                Free
              </h3>
              <div className="font-bold">
                <span className="text-2xl">$0 </span>
                <span className="text-neutral-400">/ month</span>
              </div>
            </div>
            <p className="text-neutral-400">
              For almost everyone, with all the core features
            </p>
            <ul className="flex grow flex-col gap-2 pb-8 pl-2">
              {plans.free.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckIcon height={12} />
                  {feature}
                </li>
              ))}
            </ul>
            <ButtonLink
              path="/login"
              query={{ from: 'sign-up' }}
              intent="primary"
            >
              Get Started Now
            </ButtonLink>
          </div>
          {/* PRO */}
          <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-neutral-800 p-8">
            <div className="flex justify-between">
              <h3 className="flex items-center gap-2 rounded-full bg-blue-900 px-3 text-2xl font-bold text-blue-200">
                <RocketLaunchIcon width={16} />
                Pro
              </h3>
              <div className="font-bold">
                <span className="text-2xl">$5 </span>
                <span className="text-neutral-400">/ month</span>
              </div>
            </div>
            <p className="text-neutral-400">
              For power users who live in their calendar
            </p>
            <ul className="flex grow flex-col gap-2 pb-8 pl-2">
              {plans.pro.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckIcon height={12} />
                  {feature}
                </li>
              ))}
              <li className="flex items-center gap-2 text-neutral-400">
                <CheckIcon height={12} />
                Everything in Free
              </li>
            </ul>
            <Button disabled>Coming Soon</Button>
          </div>
          {/* CUSTOM */}
          <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-neutral-800 p-8">
            <div className="flex justify-between">
              <h3 className="flex items-center gap-2 rounded-full bg-green-900 px-3 text-2xl font-bold text-green-200">
                <BeakerIcon width={16} />
                Custom
              </h3>
              <div className="font-bold">
                <span className="text-2xl">&nbsp;</span>
                <span className="text-neutral-400">TBD</span>
              </div>
            </div>
            <p className="text-neutral-400">
              For those with very specific needs
            </p>
            <ul className="flex grow flex-col gap-2 pb-8 pl-2">
              {plans.custom.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckIcon height={12} />
                  {feature}
                </li>
              ))}
              <li className="flex items-center gap-2 text-neutral-400">
                <CheckIcon height={12} />
                Everything in Pro
              </li>
            </ul>
            <Button disabled>Coming Later</Button>
          </div>
        </div>
      </main>
    </MarketingLayout>
  )
}
