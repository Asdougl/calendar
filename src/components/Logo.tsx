import Image from 'next/image'
import { cn } from '~/utils/classnames'

const sizes = {
  lg: {
    dim: 80,
    title: 'text-4xl',
    subtitle: 'text-base',
  },
  md: {
    dim: 60,
    title: 'text-3xl',
    subtitle: 'text-sm -mb-1',
  },
  sm: {
    dim: 40,
    title: 'text-2xl',
    subtitle: 'text-xs -mb-1.5',
  },
}

type LogoProps = {
  size?: keyof typeof sizes
  mobileHide?: boolean
}

export const Logo = ({ size = 'lg', mobileHide }: LogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/favicon.svg"
        alt="Logo"
        width={sizes[size].dim}
        height={sizes[size].dim}
      />
      <h1 className={cn('flex flex-col', { hidden: mobileHide })}>
        <span
          className={cn(
            'font-mono leading-none tracking-wide text-neutral-300',
            sizes[size].subtitle
          )}
        >
          asdougl
        </span>
        <span
          className={cn(
            'font-bold leading-none tracking-wider',
            sizes[size].title
          )}
        >
          Calendar
        </span>
      </h1>
    </div>
  )
}
