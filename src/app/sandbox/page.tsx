'use client'

import { Header1, Header2, Header3 } from '~/components/ui/headers'
import { randomFromArray } from '~/utils/array'
import { CategoryColors, cn, getCategoryColor } from '~/utils/classnames'

const randomEmojis = [
  '🤣',
  '😂',
  '😎',
  '🤩',
  '😍',
  '😘',
  '😗',
  '😙',
  '😚',
  '🙂',
  '🤗',
  '🤔',
  '🤨',
  '😐',
  '😑',
  '😶',
  '🙄',
  '😏',
  '😣',
  '😥',
  '😮',
  '🤐',
  '😯',
  '😪',
  '😫',
  '😴',
  '😌',
  '😛',
  '😜',
  '😝',
  '🤤',
  '😒',
  '😓',
  '😔',
  '😕',
  '🙃',
  '🤑',
  '😲',
  '🙁',
  '😖',
  '😞',
  '😟',
  '😤',
  '😢',
  '😭',
  '😦',
  '😧',
  '😨',
  '😩',
  '🤯',
  '😬',
  '😰',
  '😱',
  '🥵',
  '🥶',
  '😳',
  '🤪',
  '😵',
  '😡',
  '😠',
  '🤬',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '😇',
  '🤠',
  '🤡',
  '🥳',
  '🥴',
  '🥺',
  '🤥',
  '🤫',
  '🤭',
  '🧐',
  '🤓',
  '😈',
  '👿',
  '👹',
  '👺',
  '💀',
  '👻',
  '👽',
  '🤖',
  '💩',
  '😺',
  '😸',
  '😹',
  '😻',
]

const eventExamples = [
  ...CategoryColors.options.map((color) => ({
    title: Math.random().toString(36).substring(2, 4),
    category: {
      icon: randomFromArray(randomEmojis),
      color,
    },
  })),
  {
    title: Math.random().toString(36).substring(2, 3).toUpperCase(),
    category: undefined,
  },
]

export default function SandboxPage() {
  return (
    <main className="container mx-auto px-4">
      <Header1 className="pb-12 pt-4">Sandbox</Header1>
      <div className="flex flex-col px-4">
        <Header2>Category Colors</Header2>
        <div className="flex flex-col md:flex-row">
          <div className="">
            <Header3>Desktop</Header3>
            <ul className="flex flex-col gap-1">
              {eventExamples.map((event) => (
                <li key={event.title} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'bg-primary-400 hidden h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-full text-white md:flex',
                      event.category
                        ? [
                            getCategoryColor(event.category.color, 'bg'),
                            'text-sm',
                          ]
                        : 'bg-neutral-800'
                    )}
                  >
                    {event.category ? event.category.icon : event.title[0]}
                  </div>
                  <div>
                    {event.category ? event.category.color : 'no category'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="">
            <Header3>Mobile</Header3>
            <ul className="flex flex-col gap-1">
              {eventExamples.map((event) => (
                <li key={event.title} className="flex items-center gap-2">
                  {event.category && (
                    <span
                      className={cn(
                        'rounded-sm px-1 text-xs',
                        getCategoryColor(event.category.color, 'bg')
                      )}
                    >
                      🤣
                    </span>
                  )}
                  <div>
                    {event.category ? event.category.color : 'no category'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
