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
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'gray',
] as const

export type CategoryColors = (typeof CategoryColors)[number]

export const isCategoryColor = (input: string): input is CategoryColors => {
  return CategoryColors.includes(input as CategoryColors)
}

const CATEGORY_COLOR_MAP: Record<
  CategoryColors | '_none',
  Record<ColorProperties, string>
> = {
  red: {
    bg: 'bg-red-400',
    'bg-dull': 'bg-red-900',
    text: 'text-red-400',
    border: 'border-red-400',
    ring: 'ring-red-400',
    'alt-text': 'text-red-800',
  },
  orange: {
    bg: 'bg-orange-400',
    'bg-dull': 'bg-orange-900',
    text: 'text-orange-400',
    border: 'border-orange-400',
    ring: 'ring-orange-400',
    'alt-text': 'text-orange-800',
  },
  amber: {
    bg: 'bg-amber-400',
    'bg-dull': 'bg-amber-900',
    text: 'text-amber-400',
    border: 'border-amber-400',
    ring: 'ring-amber-400',
    'alt-text': 'text-amber-800',
  },
  yellow: {
    bg: 'bg-yellow-400',
    'bg-dull': 'bg-yellow-900',
    text: 'text-yellow-400',
    border: 'border-yellow-400',
    ring: 'ring-yellow-400',
    'alt-text': 'text-yellow-800',
  },
  lime: {
    bg: 'bg-lime-400',
    'bg-dull': 'bg-lime-900',
    text: 'text-lime-400',
    border: 'border-lime-400',
    ring: 'ring-lime-400',
    'alt-text': 'text-lime-800',
  },
  green: {
    bg: 'bg-green-400',
    'bg-dull': 'bg-green-900',
    text: 'text-green-400',
    border: 'border-green-400',
    ring: 'ring-green-400',
    'alt-text': 'text-green-800',
  },
  emerald: {
    bg: 'bg-emerald-400',
    'bg-dull': 'bg-emerald-900',
    text: 'text-emerald-400',
    border: 'border-emerald-400',
    ring: 'ring-emerald-400',
    'alt-text': 'text-emerald-800',
  },
  teal: {
    bg: 'bg-teal-400',
    'bg-dull': 'bg-teal-900',
    text: 'text-teal-400',
    border: 'border-teal-400',
    ring: 'ring-teal-400',
    'alt-text': 'text-teal-800',
  },
  cyan: {
    bg: 'bg-cyan-400',
    'bg-dull': 'bg-cyan-900',
    text: 'text-cyan-400',
    border: 'border-cyan-400',
    ring: 'ring-cyan-400',
    'alt-text': 'text-cyan-800',
  },
  sky: {
    bg: 'bg-sky-400',
    'bg-dull': 'bg-sky-900',
    text: 'text-sky-400',
    border: 'border-sky-400',
    ring: 'ring-sky-400',
    'alt-text': 'text-sky-800',
  },
  blue: {
    bg: 'bg-blue-400',
    'bg-dull': 'bg-blue-900',
    text: 'text-blue-400',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
    'alt-text': 'text-blue-800',
  },
  indigo: {
    bg: 'bg-indigo-400',
    'bg-dull': 'bg-indigo-900',
    text: 'text-indigo-400',
    border: 'border-indigo-400',
    ring: 'ring-indigo-400',
    'alt-text': 'text-indigo-800',
  },
  violet: {
    bg: 'bg-violet-400',
    'bg-dull': 'bg-violet-900',
    text: 'text-violet-400',
    border: 'border-violet-400',
    ring: 'ring-violet-400',
    'alt-text': 'text-violet-800',
  },
  purple: {
    bg: 'bg-purple-400',
    'bg-dull': 'bg-purple-900',
    text: 'text-purple-400',
    border: 'border-purple-400',
    ring: 'ring-purple-400',
    'alt-text': 'text-purple-800',
  },
  fuchsia: {
    bg: 'bg-fuchsia-400',
    'bg-dull': 'bg-fuchsia-900',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-400',
    ring: 'ring-fuchsia-400',
    'alt-text': 'text-fuchsia-800',
  },
  pink: {
    bg: 'bg-pink-400',
    'bg-dull': 'bg-pink-900',
    text: 'text-pink-400',
    border: 'border-pink-400',
    ring: 'ring-pink-400',
    'alt-text': 'text-pink-800',
  },
  rose: {
    bg: 'bg-rose-400',
    'bg-dull': 'bg-rose-900',
    text: 'text-rose-400',
    border: 'border-rose-400',
    ring: 'ring-rose-400',
    'alt-text': 'text-rose-800',
  },
  gray: {
    bg: 'bg-gray-400',
    'bg-dull': 'bg-gray-900',
    text: 'text-gray-400',
    border: 'border-gray-400',
    ring: 'ring-gray-400',
    'alt-text': 'text-gray-800',
  },
  _none: {
    bg: 'bg-neutral-600',
    'bg-dull': 'bg-neutral-900',
    text: 'text-neutral-400',
    border: 'border-neutral-600',
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

/**
 * @deprecated use `color` instead
 */
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

export const color =
  (...properties: ColorProperties[]) =>
  (colorName: string | undefined) => {
    return clsx(
      properties.map((property) => getCategoryColor(colorName, property))
    )
  }
