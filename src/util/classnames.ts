import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs))
}

type ColorProperties = 'bg' | 'text' | 'border' | 'ring'

const CATEGORY_COLOR_MAP: Record<string, Record<ColorProperties, string>> = {
  yellow: {
    bg: 'bg-yellow-900',
    text: 'text-yellow-400',
    border: 'border-yellow-400',
    ring: 'ring-yellow-400',
  },
  blue: {
    bg: 'bg-blue-900',
    text: 'text-blue-400',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
  },
  green: {
    bg: 'bg-green-900',
    text: 'text-green-400',
    border: 'border-green-400',
    ring: 'ring-green-400',
  },
  pink: {
    bg: 'bg-pink-900',
    text: 'text-pink-400',
    border: 'border-pink-400',
    ring: 'ring-pink-400',
  },
  purple: {
    bg: 'bg-purple-900',
    text: 'text-purple-400',
    border: 'border-purple-400',
    ring: 'ring-purple-400',
  },
  red: {
    bg: 'bg-red-900',
    text: 'text-red-400',
    border: 'border-red-400',
    ring: 'ring-red-400',
  },
  indigo: {
    bg: 'bg-indigo-900',
    text: 'text-indigo-400',
    border: 'border-indigo-400',
    ring: 'ring-indigo-400',
  },
  gray: {
    bg: 'bg-gray-900',
    text: 'text-gray-400',
    border: 'border-gray-400',
    ring: 'ring-gray-400',
  },
}

export const getCategoryColor = (
  category: string,
  property: ColorProperties
) => {
  const color = CATEGORY_COLOR_MAP[category] || CATEGORY_COLOR_MAP.gray
  return color[property]
}
