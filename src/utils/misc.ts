export const match = (pattern: RegExp, string: string) => {
  const match = string.match(pattern)
  return match ? [...match] : []
}

// Fischer-Yates shuffle
export const shuffle = <T>(array: T[]) => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const createTempId = () => {
  return Math.random().toString(36).substring(2)
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export const entries = <T extends object>(obj: T): Entries<T> => {
  return Object.entries(obj) as Entries<T>
}

export const pluralize = (
  count: unknown[] | number,
  singular: string,
  plural: string
) => {
  return (Array.isArray(count) ? count.length : count) === 1 ? singular : plural
}

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getWindow = () => {
  return typeof window === 'undefined' ? null : window
}
