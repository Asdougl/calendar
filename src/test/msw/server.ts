import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { type SuperJSONResult, SuperJSON } from 'superjson'
// import { createTRPCMsw } from 'msw-trpc'
// import superjson from 'superjson'
// import { TimeStatus } from '@prisma/client'
import { type Event } from '@prisma/client'
import { createMockEvent } from '../mock/events'
// import { createMockCategory } from '../mock/categories'
// import { type AppRouter } from '~/server/api/root'

// const trpcMsw = createTRPCMsw<AppRouter>({
//   transformer: { input: superjson, output: superjson },
// })

type Result = {
  result: {
    data: unknown
  }
}

export const server = setupServer(
  http.get('http://localhost:3000/api/trpc/:trpc', ({ request, params }) => {
    const trpcComponent = params.trpc

    if (!trpcComponent || typeof trpcComponent !== 'string') {
      return HttpResponse.text('Oh No', { status: 400 })
    }

    const queries = trpcComponent.includes(',')
      ? trpcComponent.split(',')
      : [trpcComponent]

    const url = new URL(request.url)

    const searchInput = url.searchParams.get('input')

    if (!searchInput) {
      return HttpResponse.text('Oh No', { status: 400 })
    }

    const unparsed = SuperJSON.deserialize(
      JSON.parse(searchInput) as unknown as SuperJSONResult
    )

    if (typeof unparsed !== 'object' || !unparsed) {
      return HttpResponse.text('Oh No', { status: 400 })
    }

    const input = Object.values(unparsed)

    const results: unknown[] = []

    queries.forEach((query, index) => {
      switch (query) {
        case 'categories.all': {
          const event = input[index] as Event
          results.push(createMockEvent(event))
          break
        }
        case 'preferences.getAll': {
          const event = input[index] as Event
          results.push(createMockEvent(event))
          break
        }
        default: {
          results.push({ result: { data: null } })
        }
      }
    })

    return Response.json(
      results.reduce<Record<number, Result>>(
        (acc, result, index) => {
          acc[index] = { result: { data: SuperJSON.serialize(result) } }
          return acc
        },
        {} as Record<number, Result>
      )
    )
  }),
  http.post(
    'http://localhost:3000/api/trpc/:trpc',
    async ({ request, params }) => {
      const trpcComponent = params.trpc

      // eslint-disable-next-line no-console
      console.log('WAHOO', trpcComponent, typeof trpcComponent)

      if (!trpcComponent || typeof trpcComponent !== 'string') {
        return HttpResponse.text('Bad TRPC Component', { status: 400 })
      }

      const queries = trpcComponent.includes(',')
        ? trpcComponent.split(',')
        : [trpcComponent]

      const json = await request.json()

      if (!json || typeof json !== 'object') {
        return HttpResponse.text('Bad Input', { status: 400 })
      }

      const input: unknown[] = []

      Object.values(json).forEach((value) => {
        input.push(SuperJSON.deserialize(value as SuperJSONResult))
      })

      const results: unknown[] = []

      queries.forEach((query, index) => {
        switch (query) {
          case 'event.create': {
            const event = input[index] as Event
            results.push(createMockEvent(event))
            break
          }
          case 'event.update': {
            const event = input[index] as Event
            results.push(createMockEvent(event))
            break
          }
          case 'event.delete': {
            const event = input[index] as Event
            results.push(createMockEvent(event))
            break
          }
          default: {
            results.push({ result: { data: null } })
          }
        }
      })

      const resultingJson = results.reduce<Record<number, Result>>(
        (acc, result, index) => {
          acc[index] = { result: { data: SuperJSON.serialize(result) } }
          return acc
        },
        {} as Record<number, Result>
      )

      return Response.json(resultingJson)
    }
  )
)
//   // EVENTS
//   trpcMsw.event.create.mutation((ctx) => {
//     // if time status is all day, set the time to 12:00
//     if (
//       ctx.timeStatus &&
//       (ctx.timeStatus === TimeStatus.ALL_DAY ||
//         ctx.timeStatus === TimeStatus.NO_TIME)
//     ) {
//       ctx.datetime = new Date(ctx.datetime.setHours(12, 0, 0, 0))
//     }

//     return createMockEvent(ctx)
//   }),
//   trpcMsw.event.update.mutation((ctx) => {
//     if (
//       ctx.datetime && // mad caveat -- actual endpoint handles no datetime but mocked cannot
//       ctx.timeStatus &&
//       (ctx.timeStatus === TimeStatus.ALL_DAY ||
//         ctx.timeStatus === TimeStatus.NO_TIME)
//     ) {
//       ctx.datetime = new Date(ctx.datetime.setHours(12, 0, 0, 0))
//     }
//     return createMockEvent(ctx)
//   }),
//   trpcMsw.event.delete.mutation((ctx) => {
//     return createMockEvent(ctx)
//   }),

//   // CATEGORIES
//   trpcMsw.category.all.query(() => {
//     return [
//       createMockCategory({ name: 'Blue', color: 'blue' }),
//       createMockCategory({ name: 'Red', color: 'red' }),
//       createMockCategory({ name: 'Green', color: 'green' }),
//     ]
//   }),

//   // PREFERENCES
//   trpcMsw.preferences.getAll.query(() => {
//     return {
//       weekends: 'left' as const,
//       timezone: 'Australia/Sydney',
//       timeFormat: '12' as const,
//       developer: false,
//     }
//   })
// )
