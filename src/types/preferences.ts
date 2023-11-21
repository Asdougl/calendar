import { z } from 'zod'

export const Preferences = z.object({
  leftWeekends: z.boolean().default(true),
  timezone: z.string().default('GMT'),
  developer: z.boolean().default(false),
})
export type Preferences = z.infer<typeof Preferences>
