import Image from 'next/image'
import Link from 'next/link'
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
    title: 'text-xl',
    subtitle: 'text-xs -mb-0.5',
  },
}

type LogoProps = {
  size?: keyof typeof sizes
  mobileHide?: boolean
}

export const Logo = ({ size = 'lg', mobileHide }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-70">
      <Image
        src="/asdougl-mark.svg"
        alt="Logo"
        width={sizes[size].dim}
        height={sizes[size].dim}
      />
      <h1 className={cn('flex flex-col', { hidden: mobileHide })}>
        <div
          className={cn(
            'font-mono leading-none tracking-wide text-neutral-300',
            sizes[size].subtitle
          )}
        >
          asdougl
        </div>
        <span
          className={cn(
            'font-bold leading-none tracking-wider',
            sizes[size].title
          )}
        >
          Calendar
        </span>
      </h1>
    </Link>
  )
}
