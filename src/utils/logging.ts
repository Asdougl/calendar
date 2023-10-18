import { isError } from './guards'

type Log = {
  message: string
  level: 'info' | 'warn' | 'error'
  blob?: string
}

const Logs: Log[] = []

const safeJSONStringify = (value: unknown) => {
  try {
    return JSON.stringify(value)
  } catch (error) {
    return String(value)
  }
}

export const log = (
  level: 'info' | 'warn' | 'error' = 'info',
  message: unknown
) => {
  Logs.push({
    level,
    message: isError(message) ? message.message : 'Unknown error',
    blob: isError(message) ? message.stack : safeJSONStringify(message),
  })
}
