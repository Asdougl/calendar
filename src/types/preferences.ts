import { z } from 'zod'

export const Preferences = z.object({
  leftWeekends: z.boolean().default(true),
  timezone: z.string().default('GMT'),
})
export type Preferences = z.infer<typeof Preferences>
