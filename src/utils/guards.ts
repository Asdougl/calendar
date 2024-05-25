import { type ZodError } from 'zod'
import isNil from 'lodash/isNil'

export const isError = (error: unknown): error is Error => {
  return typeof error === 'object' && error !== null && 'message' in error
}

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number'
}

export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value)
}

export const exists = <T>(value: T | null | undefined): value is T => {
  return isNil(value) === false
}

export const isZodError = (error: Error): error is ZodError => {
  return error.name === 'ZodError'
}
