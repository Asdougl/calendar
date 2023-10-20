'use client'

import { useEffect, useState } from 'react'
import { Field, InputField } from '~/components/ui/Field'
import { Button, SubmitButton } from '~/components/ui/button'
import { Header1, Header2, Header3 } from '~/components/ui/headers'
import { Input } from '~/components/ui/input'
import { Select } from '~/components/ui/select'
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

export default function SandboxPage() {
  const [eventExamples, setEventExamples] = useState<
    {
      title: string
      category?: { icon: string; color: string }
    }[]
  >([])

  useEffect(() => {
    setEventExamples([
      ...CategoryColors.options.map((color) => ({
        title: Math.random().toString(36).substring(2, 4),
        category: {
          icon: randomFromArray(randomEmojis),
          color,
        },
      })),
      {
        title: Math.random().toString(36).substring(2, 7).toUpperCase(),
        category: undefined,
      },
    ])
  }, [])

  return (
    <main className="container mx-auto px-4 pb-64">
      <Header1 className="pb-12 pt-4">Sandbox</Header1>
      <div className="flex flex-col gap-4 px-4">
        <ul className="flex flex-col gap-1">
          {eventExamples.map((event) => (
            <li key={event.title} className="flex items-center gap-2">
              <div
                className={cn(
                  'bg-primary-400 hidden h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-full text-white md:flex',
                  event.category
                    ? [getCategoryColor(event.category.color, 'bg'), 'text-sm']
                    : 'bg-neutral-800'
                )}
              >
                {event.category ? event.category.icon : event.title[0]}
              </div>
              <div>
                {event.category && (
                  <span
                    className={cn(
                      'mr-2 rounded-sm px-1 text-xs',
                      getCategoryColor(event.category.color, 'bg')
                    )}
                  >
                    🤣
                  </span>
                )}
                {event.category ? event.category.color : 'no category'}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-2">
            <Button intent="primary">Primary</Button>
            <SubmitButton intent="primary" loading>
              Primary
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="secondary">Secondary</Button>
            <SubmitButton intent="secondary" loading>
              Secondary
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="tertiary">Tertiary</Button>
            <SubmitButton intent="tertiary" loading>
              Tertiary
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="danger">Danger</Button>
            <SubmitButton intent="danger" loading>
              Danger
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="success">Success</Button>
            <SubmitButton intent="success" loading>
              Success
            </SubmitButton>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Input />
          <InputField label="A Normal Field" width="full" />
          <InputField
            label="A Required Field"
            condition="required"
            width="full"
          />
          <InputField
            label="An Optional Field"
            condition="optional"
            width="full"
            error="Something gone wrong"
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <Field id="my-select" label="Some Select">
            <Select
              id="my-select"
              width="full"
              name="my-select"
              options={[
                { name: 'hello', value: 'world' },
                { name: 'foo', value: 'bar' },
                { name: 'baz', value: 'baz' },
              ]}
            />
          </Field>
        </div>
      </div>
    </main>
  )
}
