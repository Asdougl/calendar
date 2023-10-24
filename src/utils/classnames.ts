import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs))
}

type ColorProperties = 'bg' | 'text' | 'border' | 'ring'

export const CategoryColors = [
  'yellow',
  'blue',
  'green',
  'pink',
  'purple',
  'red',
  'indigo',
  'gray',
  'orange',
] as const
export type CategoryColors = (typeof CategoryColors)[number]

const isCategoryColor = (input: string): input is CategoryColors => {
  return CategoryColors.includes(input as CategoryColors)
}

const CATEGORY_COLOR_MAP: Record<
  CategoryColors,
  Record<ColorProperties, string>
> = {
  yellow: {
    bg: 'bg-yellow-400',
    text: 'text-yellow-400',
    border: 'border-yellow-400',
    ring: 'ring-yellow-400',
  },
  blue: {
    bg: 'bg-blue-400',
    text: 'text-blue-400',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
  },
  green: {
    bg: 'bg-green-400',
    text: 'text-green-400',
    border: 'border-green-400',
    ring: 'ring-green-400',
  },
  pink: {
    bg: 'bg-pink-400',
    text: 'text-pink-400',
    border: 'border-pink-400',
    ring: 'ring-pink-400',
  },
  purple: {
    bg: 'bg-purple-400',
    text: 'text-purple-400',
    border: 'border-purple-400',
    ring: 'ring-purple-400',
  },
  red: {
    bg: 'bg-red-400',
    text: 'text-red-400',
    border: 'border-red-400',
    ring: 'ring-red-400',
  },
  indigo: {
    bg: 'bg-indigo-400',
    text: 'text-indigo-400',
    border: 'border-indigo-400',
    ring: 'ring-indigo-400',
  },
  gray: {
    bg: 'bg-gray-400',
    text: 'text-gray-400',
    border: 'border-gray-400',
    ring: 'ring-gray-400',
  },
  orange: {
    bg: 'bg-orange-400',
    text: 'text-orange-400',
    border: 'border-orange-400',
    ring: 'ring-orange-400',
  },
}

export const getCategoryColor = (
  colorName: string,
  property: ColorProperties
) => {
  if (isCategoryColor(colorName)) {
    return CATEGORY_COLOR_MAP[colorName][property]
  } else {
    return CATEGORY_COLOR_MAP.gray[property]
  }
}
