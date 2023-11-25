import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs))
}

type ColorProperties =
  | 'bg'
  | 'bg-dull'
  | 'text'
  | 'border'
  | 'ring'
  | 'alt-text'

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
  CategoryColors | '_none',
  Record<ColorProperties, string>
> = {
  yellow: {
    bg: 'bg-yellow-400',
    'bg-dull': 'bg-yellow-900',
    text: 'text-yellow-400',
    border: 'border-yellow-400',
    ring: 'ring-yellow-400',
    'alt-text': 'text-yellow-800',
  },
  blue: {
    bg: 'bg-blue-400',
    'bg-dull': 'bg-blue-900',
    text: 'text-blue-400',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
    'alt-text': 'text-blue-800',
  },
  green: {
    bg: 'bg-green-400',
    'bg-dull': 'bg-green-900',
    text: 'text-green-400',
    border: 'border-green-400',
    ring: 'ring-green-400',
    'alt-text': 'text-green-800',
  },
  pink: {
    bg: 'bg-pink-400',
    'bg-dull': 'bg-pink-900',
    text: 'text-pink-400',
    border: 'border-pink-400',
    ring: 'ring-pink-400',
    'alt-text': 'text-pink-800',
  },
  purple: {
    bg: 'bg-purple-400',
    'bg-dull': 'bg-purple-900',
    text: 'text-purple-400',
    border: 'border-purple-400',
    ring: 'ring-purple-400',
    'alt-text': 'text-purple-800',
  },
  red: {
    bg: 'bg-red-400',
    'bg-dull': 'bg-red-900',
    text: 'text-red-400',
    border: 'border-red-400',
    ring: 'ring-red-400',
    'alt-text': 'text-red-800',
  },
  indigo: {
    bg: 'bg-indigo-400',
    'bg-dull': 'bg-indigo-900',
    text: 'text-indigo-400',
    border: 'border-indigo-400',
    ring: 'ring-indigo-400',
    'alt-text': 'text-indigo-800',
  },
  gray: {
    bg: 'bg-gray-400',
    'bg-dull': 'bg-gray-900',
    text: 'text-gray-400',
    border: 'border-gray-400',
    ring: 'ring-gray-400',
    'alt-text': 'text-gray-800',
  },
  orange: {
    bg: 'bg-orange-400',
    'bg-dull': 'bg-orange-900',
    text: 'text-orange-400',
    border: 'border-orange-400',
    ring: 'ring-orange-400',
    'alt-text': 'text-orange-800',
  },
  _none: {
    bg: 'bg-neutral-600',
    'bg-dull': 'bg-neutral-900',
    text: 'text-neutral-400',
    border: 'border-neutral-200',
    ring: 'ring-neutral-400',
    'alt-text': 'text-neutral-800',
  },
}

type ColorOrNone = CategoryColors | '_none'

type CategoryColorOption = {
  value: ColorOrNone
  name: string
  color: ColorOrNone
}

export const CATEGORY_SELECT_OPTIONS: CategoryColorOption[] = [
  {
    name: 'None',
    value: '_none',
    color: '_none',
  },
  {
    name: 'Yellow',
    value: 'yellow',
    color: 'yellow',
  },
  {
    name: 'Blue',
    value: 'blue',
    color: 'blue',
  },
  {
    name: 'Green',
    value: 'green',
    color: 'green',
  },
  {
    name: 'Pink',
    value: 'pink',
    color: 'pink',
  },
  {
    name: 'Purple',
    value: 'purple',
    color: 'purple',
  },
  {
    name: 'Red',
    value: 'red',
    color: 'red',
  },
  {
    name: 'Indigo',
    value: 'indigo',
    color: 'indigo',
  },
  {
    name: 'Gray',
    value: 'gray',
    color: 'gray',
  },
  {
    name: 'Orange',
    value: 'orange',
    color: 'orange',
  },
]

export const getCategoryColor = (
  colorName: string | undefined,
  property: ColorProperties
) => {
  if (colorName && isCategoryColor(colorName)) {
    return CATEGORY_COLOR_MAP[colorName][property]
  } else {
    return CATEGORY_COLOR_MAP._none[property]
  }
}
