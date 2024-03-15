import { TIME_INVERVAL } from '@prisma/client'
import { type Duration } from 'date-fns'

export const TimeIntervalToDuration: Record<TIME_INVERVAL, keyof Duration> = {
  [TIME_INVERVAL.DAILY]: 'days',
  [TIME_INVERVAL.MONTHLY]: 'months',
  [TIME_INVERVAL.WEEKLY]: 'weeks',
  [TIME_INVERVAL.YEARLY]: 'years',
}
