import { z } from 'zod'

export const DayOfWeek = z.enum([
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
])
export type DayOfWeek = z.infer<typeof DayOfWeek>

export const Preferences = z.object({
  weekends: z.enum(['left', 'right', 'dynamic']),
  timezone: z.string(),
  developer: z.boolean(),
  timeFormat: z.enum(['12', '24']),
  workHours: z.object({
    start: z.number(),
    end: z.number(),
  }),
  workDays: z.array(DayOfWeek),
})
export type Preferences = z.infer<typeof Preferences>

export const PreferencesDefaults = z.object({
  weekends: Preferences.shape.weekends.default('left'),
  timezone: Preferences.shape.timezone.default('GMT'),
  developer: Preferences.shape.developer.default(false),
  timeFormat: Preferences.shape.timeFormat.default('12'),
  workHours: Preferences.shape.workHours.default({ start: 9, end: 17 }),
  workDays: Preferences.shape.workDays.default([
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
  ]),
})
