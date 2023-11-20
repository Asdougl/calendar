import { z } from 'zod'

export const Preferences = z.object({
  leftWeekends: z.boolean().default(true),
})
export type Preferences = z.infer<typeof Preferences>
