import { Navbar } from '~/components/Navbar'
import { Header1, Header3 } from '~/components/ui/headers'

export default function SettingsLoader() {
  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden">
        <div className="px-4 py-6">
          <Header1 skeleton>Hi Username</Header1>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <div className="pb-2">
            <Header3 skeleton>Some settings</Header3>
          </div>
          <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
            <li className="grid h-12 grid-cols-3">
              <div className="flex items-center justify-start px-4 text-sm">
                <div className="h-4 animate-pulse rounded-full bg-neutral-800 text-transparent">
                  some setting
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
                <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800"></div>
              </div>
            </li>
            <li className="grid h-12 grid-cols-3">
              <div className="flex items-center justify-start px-4 text-sm">
                <div className="h-4 animate-pulse rounded-full bg-neutral-800 text-transparent">
                  some setting
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
                <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800"></div>
              </div>
            </li>
            <li className="grid h-12 grid-cols-3">
              <div className="flex items-center justify-start px-4 text-sm">
                <div className="h-4 animate-pulse rounded-full bg-neutral-800 text-transparent">
                  some setting
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
                <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800"></div>
              </div>
            </li>
            <li className="grid h-12 grid-cols-3">
              <div className="flex items-center justify-start px-4 text-sm">
                <div className="h-4 animate-pulse rounded-full bg-neutral-800 text-transparent">
                  some setting
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
                <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800"></div>
              </div>
            </li>
            <li className="grid h-12 grid-cols-3">
              <div className="flex items-center justify-start px-4 text-sm">
                <div className="h-4 animate-pulse rounded-full bg-neutral-800 text-transparent">
                  some setting
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center border-l border-neutral-800 text-white">
                <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800"></div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <Navbar />
    </main>
  )
}
