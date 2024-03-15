'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { type FC } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Header2 } from '../ui/headers'
import { stdFormat } from '../ui/dates/common'
import { PeriodForm } from '../form/period/period-form'
import { ButtonRawLink } from '../ui/button'
import { cn, color } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { SEARCH_PARAM_NEW, modifyCurrentSearchParams } from '~/utils/nav/search'
import { useQueryParams } from '~/utils/nav/hooks'

const getInitialDate = (date: string | null | undefined) => {
  if (!date) return new Date()
  const initialDate = new Date(date)
  if (isNaN(initialDate.getTime())) return new Date()
  return initialDate
}

export const PeriodModal: FC = () => {
  const [searchParams, updateSearchParams] = useQueryParams()

  const enabled =
    searchParams.has('period') &&
    searchParams.get('period') !== SEARCH_PARAM_NEW

  const { data: period, isFetching } = api.periods.one.useQuery(
    { id: searchParams.get('period') || '' },
    {
      enabled,
      staleTime: Duration.minutes(5),
      refetchOnMount: false,
    }
  )

  const onOpenChange = (value: boolean, jumpTo?: Date) => {
    if (!value) {
      updateSearchParams({
        remove: ['period', 'date', 'endDate'],
        update: {
          of: jumpTo ? stdFormat(jumpTo) : undefined,
        },
      })
    }
  }

  return (
    <Dialog.Root open={searchParams.has('period')} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-10 z-10 w-full max-w-xl -translate-x-1/2 p-6 lg:top-24">
          <div className="flex justify-between pb-2">
            <Dialog.Title asChild>
              {enabled && isFetching ? (
                <div className="flex items-center">
                  <div className="animate-pulse rounded-full bg-neutral-800 text-transparent">
                    Event name
                  </div>
                </div>
              ) : (
                <Header2 className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-6 w-1 rounded-full',
                      color('bg')(period?.color)
                    )}
                  ></div>
                  {period ? period.name : 'Add Period'}
                </Header2>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded px-4 py-2 hover:bg-neutral-800"
                aria-label="close"
              >
                <XMarkIcon height={20} />
              </button>
            </Dialog.Close>
          </div>
          {isFetching ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Period Name
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Period Dates
                </div>
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Period Category
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Period Color
                </div>
                <div className="w-full animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Period Icon
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <div className="animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Delete
                </div>
                <div className="animate-pulse rounded-lg bg-neutral-800 px-4 py-2 text-transparent">
                  Submit
                </div>
              </div>
            </div>
          ) : period ? (
            <PeriodForm period={period} onSubmit={() => onOpenChange(false)} />
          ) : (
            <PeriodForm
              startDate={getInitialDate(searchParams.get('date'))}
              endDate={
                searchParams.has('endDate')
                  ? getInitialDate(searchParams.get('endDate'))
                  : undefined
              }
              onSubmit={(eventDate) => onOpenChange(false, eventDate)}
              extraActions={
                <ButtonRawLink
                  href={modifyCurrentSearchParams({
                    update: { event: SEARCH_PARAM_NEW },
                    remove: ['period'],
                  })}
                >
                  Add Event
                </ButtonRawLink>
              }
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
