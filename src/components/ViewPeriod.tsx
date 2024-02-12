import { type FC, type PropsWithChildren, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { XMarkIcon } from '@heroicons/react/24/solid'
import {
  addDays,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  format,
  isWithinInterval,
  startOfWeek,
} from 'date-fns'
import { ButtonLink } from './ui/button'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { toCalendarDate } from '~/utils/dates'

type ViewPeriodProps = {
  period: RouterOutputs['periods']['range'][number]
  initialOpen?: boolean
}

export const ViewPeriod: FC<PropsWithChildren<ViewPeriodProps>> = ({
  period,
  children,
  initialOpen = false,
}) => {
  const [open, setOpen] = useState(initialOpen)

  const totalWeeks =
    differenceInCalendarWeeks(period.endDate, period.startDate, {
      weekStartsOn: 1,
    }) + 1

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-10 z-10 flex w-full max-w-xl -translate-x-1/2 flex-col gap-2 p-6 lg:top-24">
          {/* Row 0 */}
          <div className="flex items-stretch justify-between">
            <Dialog.Title className="flex items-stretch gap-2">
              <div
                className={cn(
                  'w-1 flex-shrink-0 rounded-full',
                  color('bg')(period.color)
                )}
              >
                &nbsp;
              </div>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{period.name}</div>
              </div>
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center rounded-lg px-4 ring-neutral-600 hover:bg-neutral-800 focus:outline-none focus:ring">
              <XMarkIcon height={20} />
            </Dialog.Close>
          </div>
          {/* Row 1 */}
          <div className="flex items-center gap-4 py-2">
            <div className="text-lg">
              <span className="font-bold">
                {format(period.startDate, 'd MMM yyyy')}
              </span>{' '}
              <span className="text-neutral-400">to</span>{' '}
              <span className="font-bold">
                {format(period.endDate, 'd MMM yyyy')}
              </span>
            </div>
            <div className="text-sm text-neutral-400">
              {differenceInCalendarDays(period.endDate, period.startDate) + 1}{' '}
              days
            </div>
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-7 gap-y-2">
            {Array(totalWeeks * 7)
              .fill(null)
              .map((_, i) => {
                const date = addDays(startOfWeek(period.startDate), i)

                if (
                  !isWithinInterval(date, {
                    start: period.startDate,
                    end: period.endDate,
                  })
                ) {
                  return <div key={toCalendarDate(date)}></div>
                }

                return (
                  <div
                    key={toCalendarDate(date)}
                    className={cn('flex flex-col items-center justify-center')}
                  >
                    <div className="text-sm text-neutral-400">
                      {format(date, 'E')}
                    </div>
                    <div className="text-base">{format(date, 'd')}</div>
                  </div>
                )
              })}
          </div>
          {/* Row 4 */}
          <div className="flex justify-end pt-4">
            <ButtonLink path="/periods/:id" params={{ id: period.id }}>
              More Details
            </ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
