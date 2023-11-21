import { type VariantProps, cva } from 'class-variance-authority'

export const inputStyle = cva(
  'border border-neutral-800 bg-neutral-950 text-neutral-50 px-3 py-2 rounded-md focus:outline-none focus:ring ring-neutral-400 w-full placeholder:text-neutral-700',
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
      width: {
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64',
        full: 'w-full',
      },
      error: {
        true: 'ring-red-300 border-red-900',
      },
      skeleton: {
        true: 'animate-pulse bg-neutral-900',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'lg',
      error: false,
    },
  }
)
export type InputVariantProps = VariantProps<typeof inputStyle>
