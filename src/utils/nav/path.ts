import { z } from 'zod'

// All supported Paths and Arguments
export const PathMap = z.object({
  '/': z.null(),
  '/categories': z.null(),
  '/categories/:categoryId': z.object({ categoryId: z.string() }),
  '/day/:date': z.object({ date: z.string() }),
  '/events': z.null(),
  '/events/past': z.null(),
  '/inbox': z.null(),
  '/shared': z.null(),
  '/login': z.null(),
  '/month': z.null(),
  '/periods': z.null(),
  '/periods/:id': z.object({ id: z.string() }),
  '/profile': z.null(),
  '/people': z.null(),
  '/week': z.null(),
  '/year': z.null(),
})
export type PathMap = z.infer<typeof PathMap>
export type Pathname = keyof PathMap
