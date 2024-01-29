import isError from 'lodash/isError'
import { isZodError } from './guards'

export const formatError = (error: unknown) => {
  if (isError(error)) {
    if (isZodError(error)) {
      return error.issues.map((issue) => issue.message).join('\n')
    } else {
      return error.message
    }
  } else if (typeof error === 'string') {
    return error
  } else {
    return 'Unknown error'
  }
}
