import { z } from 'zod'

export const Preferences = z.object({
  weekends: z.enum(['left', 'right', 'dynamic']),
  timezone: z.string(),
  developer: z.boolean(),
  timeFormat: z.enum(['12', '24']),
})
export type Preferences = z.infer<typeof Preferences>

export const PreferencesDefaults = z.object({
  weekends: Preferences.shape.weekends.default('left'),
  timezone: Preferences.shape.timezone.default('GMT'),
  developer: Preferences.shape.developer.default(false),
  timeFormat: Preferences.shape.timeFormat.default('12'),
})
