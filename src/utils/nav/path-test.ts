import { z } from 'zod'

// All supported Paths and Arguments
export const PathMap = z.object({
  /* <generated-paths> */
  '/': z.null(),
  '/login': z.null(),
  '/swatches': z.null(),
  '/sandbox': z.null(),
  '/data': z.null(),
  '/categories': z.null(),
  '/events': z.null(),
  '/todos': z.null(),
  '/people': z.null(),
  '/year': z.null(),
  '/profile': z.null(),
  '/shared': z.null(),
  '/recursion': z.null(),
  '/inbox': z.null(),
  '/week': z.null(),
  '/periods': z.null(),
  '/settings': z.null(),
  '/month': z.null(),
  '/categories/:categoryId': z.object({ categoryId: z.string() }),
  '/day/:date': z.object({ date: z.string() }),
  '/events/past': z.null(),
  '/search/events': z.null(),
  '/search/people': z.null(),
  '/periods/:id': z.object({ id: z.string() }),
  /* </generated-paths> */
})
export type PathMap = z.infer<typeof PathMap>
export type Pathname = keyof PathMap
