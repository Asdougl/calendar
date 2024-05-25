'use client'

import { type FC, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  getDaysInMonth,
  getISOWeek,
  getMonth,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  set,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import {
  ChevronLeftIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/solid'
import { MonthItem } from './month-item'
import { cn, color } from '~/utils/classnames'
import { api } from '~/trpc/react'
import { Duration, toCalendarDate, weekDatesOfDateRange } from '~/utils/dates'
import { type RouterOutputs } from '~/trpc/shared'
import { PathLink } from '~/utils/nav/Link'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { createClientDateRangeHook } from '~/utils/hooks'
import { stdFormat } from '~/components/ui/dates/common'

const useMonthDate = createClientDateRangeHook({
  param: 'of',
  initialState: { start: new Date(), end: new Date() }, // set on server, untrusted
  processor: (date) => ({
    start: startOfMonth(date),
    end: endOfMonth(date),
  }),
})

const colorBg = color('bg')

export const MonthView: FC = () => {
  const [focusMonth, focusMounted] = useMonthDate()
  const [showShared, setShowShared] = useState(true)

  const queryClient = api.useUtils()

  const { data: periodsByDay } = api.periods.range.useQuery(
    {
      start: startOfDay(subDays(focusMonth.start, 7)),
      end: endOfDay(addDays(focusMonth.end, 7)),
    },
    {
      enabled: focusMounted,
      staleTime: Duration.minutes(5),
      refetchInterval: Duration.minutes(10),
      placeholderData: () => {
        const toReturn: RouterOutputs['periods']['range'] = []
        const lastMonthData = queryClient.periods.range.getData({
          start: startOfDay(subDays(subMonths(focusMonth.start, 1), 7)),
          end: endOfDay(addDays(endOfMonth(subMonths(focusMonth.start, 1)), 7)),
        })
        if (lastMonthData)
          toReturn.push(
            ...lastMonthData.filter((period) =>
              isAfter(
                period.startDate,
                subDays(focusMonth.start, 7).getTime() / 1000
              )
            )
          )
        const nextMonthData = queryClient.periods.range.getData({
          start: startOfDay(subDays(addMonths(focusMonth.start, 1), 7)),
          end: endOfDay(addDays(endOfMonth(addMonths(focusMonth.start, 1)), 7)),
        })

        if (nextMonthData)
          toReturn.push(
            ...nextMonthData.filter((period) =>
              isBefore(
                period.endDate,
                addDays(focusMonth.end, 7).getTime() / 1000
              )
            )
          )

        return toReturn
      },
      select: (data) => {
        if (!data) return {}
        const periodsByDay: Record<string, RouterOutputs['periods']['range']> =
          {}

        for (let i = 0; i < getDaysInMonth(focusMonth.start); i++) {
          const day = addDays(startOfMonth(focusMonth.start), i)
          periodsByDay[format(day, 'yyyy-MM-dd')] = data.filter((period) =>
            isWithinInterval(day, {
              start: period.startDate,
              end: period.endDate,
            })
          )
        }

        return periodsByDay
      },
    }
  )

  const { data: eventsByDay, isFetching } = api.event.range.useQuery(
    {
      start: startOfDay(subDays(focusMonth.start, 7)),
      end: endOfDay(addDays(focusMonth.end, 7)),
      shared: showShared,
    },
    {
      enabled: focusMounted,
      placeholderData: () => {
        const toReturn: RouterOutputs['event']['range'] = []

        if (!focusMonth) return toReturn

        const lastMonthData = queryClient.event.range.getData({
          start: startOfDay(subDays(subMonths(focusMonth.start, 1), 7)),
          end: endOfDay(addDays(endOfMonth(subMonths(focusMonth.start, 1)), 7)),
        })
        if (lastMonthData)
          toReturn.push(
            ...lastMonthData.filter((event) =>
              isAfter(
                event.datetime,
                subDays(focusMonth.start, 7).getTime() / 1000
              )
            )
          )
        const nextMonthData = queryClient.event.range.getData({
          start: startOfDay(subDays(addMonths(focusMonth.start, 1), 7)),
          end: endOfDay(addDays(endOfMonth(addMonths(focusMonth.start, 1)), 7)),
        })

        if (nextMonthData)
          toReturn.push(
            ...nextMonthData.filter((event) =>
              isBefore(
                event.datetime,
                addDays(focusMonth.end, 7).getTime() / 1000
              )
            )
          )

        return toReturn
      },
      staleTime: Duration.minutes(1),
      refetchInterval: Duration.minutes(5),
      select: (data) => {
        if (!data) return {}
        const eventsByDay: Record<string, RouterOutputs['event']['range']> = {}
        data.forEach((event) => {
          const dayKey = format(event.datetime, 'yyyy-MM-dd')
          const eventsOfDay = eventsByDay[dayKey]
          if (eventsOfDay) eventsOfDay.push(event)
          else eventsByDay[dayKey] = [event]
        })
        return eventsByDay
      },
    }
  )

  const weekDates = useMemo(() => {
    const startOfCurrMonth = set(new Date(), {
      date: 1,
      month: focusMonth.start.getMonth(),
      year: focusMonth.start.getFullYear(),
    })
    const endOfCurrMonth = endOfMonth(startOfCurrMonth)

    return weekDatesOfDateRange(startOfCurrMonth, endOfCurrMonth)
  }, [focusMonth.start])

  return (
    <InnerPageLayout
      headerLeft={
        <button onClick={() => setShowShared(!showShared)}>
          {showShared ? (
            <UserGroupIcon height={20} />
          ) : (
            <UserIcon height={20} />
          )}
        </button>
      }
      title={format(focusMonth.start, 'MMMM yyyy')}
      headerRight={
        <div className="flex gap-2">
          <PathLink
            path="/month"
            query={{ of: stdFormat(addMonths(focusMonth.start, -1)) }}
            className="flex items-center justify-center"
          >
            <ChevronLeftIcon height={20} className="" />
          </PathLink>
          <PathLink
            path="/month"
            query={{ of: stdFormat(addMonths(focusMonth.start, 1)) }}
            className="flex items-center justify-center"
          >
            <ChevronLeftIcon height={20} className="rotate-180" />
          </PathLink>
        </div>
      }
    >
      <div
        className={cn('grid flex-grow overflow-scroll px-0.5 xl:gap-2', {
          'grid-rows-5': weekDates.length === 5,
          'grid-rows-4': weekDates.length === 4,
        })}
      >
        {weekDates.map((week, i) => (
          <PathLink
            key={
              week[0] ? `${format(week[0], 'yy')}w${getISOWeek(week[0])}` : i
            }
            path="/week"
            query={{
              of: toCalendarDate(week[0] || new Date()),
            }}
            className="group grid grid-cols-7"
          >
            {week.map((day, j) => {
              const eventsForDay = eventsByDay
                ? eventsByDay[toCalendarDate(day)]
                : []

              const periodsForDay = periodsByDay
                ? periodsByDay[toCalendarDate(day)]
                : []

              const inCurrMonth = day.getMonth() === getMonth(focusMonth.start)

              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  id={toCalendarDate(day)}
                  className={cn(
                    'group flex flex-1 flex-grow flex-col gap-0.5 overflow-hidden border border-r-0 border-neutral-800 px-[2px] py-[2px] first:rounded-l-lg last:rounded-r-lg last:border-r md:group-hover:border-neutral-600 md:group-hover:bg-neutral-900',
                    j > 4 && 'bg-neutral-900',
                    !inCurrMonth && 'opacity-50'
                  )}
                >
                  {/* needs to be wrapped in a flex because parent can't be a flex */}
                  {/* if we want the event title to overflow into ellipsis */}
                  <div className="flex justify-between">
                    <div
                      className={cn(
                        'px-1',
                        isSameDay(day, new Date()) &&
                          'rounded-lg bg-neutral-50 text-neutral-950'
                      )}
                    >
                      <div className="text-xs xl:hidden">
                        {format(day, 'dd')}
                      </div>
                      <div className="hidden text-sm xl:block">
                        {format(day, 'dd MMM')}
                      </div>
                    </div>
                    <div className="flex h-full grow items-center justify-end">
                      {periodsForDay?.map((period) => (
                        <div
                          key={period.id}
                          className={cn(
                            'h-2 w-2 grow rounded-sm',
                            colorBg(period.color)
                          )}
                        ></div>
                      ))}
                    </div>
                  </div>
                  {isFetching && (!eventsForDay || eventsForDay.length < 1) && (
                    <div className="px-2 pt-1">
                      <div className="h-3 w-full animate-pulse rounded-full bg-neutral-800"></div>
                    </div>
                  )}
                  {eventsForDay?.map((event) => (
                    <MonthItem
                      key={event.id}
                      event={event}
                      loading={isFetching}
                    />
                  ))}
                </div>
              )
            })}
          </PathLink>
        ))}
      </div>
    </InnerPageLayout>
  )
}
