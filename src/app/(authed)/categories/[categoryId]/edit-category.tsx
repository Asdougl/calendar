'use client'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import upperFirst from 'lodash/upperFirst'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { SubmitButton } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field } from '~/components/ui/Field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select } from '~/components/ui/select'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { CategoryColors, isCategoryColor } from '~/utils/classnames'
import { warn } from '~/utils/logging'
import { useNavigate } from '~/utils/nav/hooks'
import { PathLink } from '~/utils/nav/Link'

type EditCategoryProps = {
  initialCategory: NonNullable<RouterOutputs['category']['one']>
}

const EditCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.enum(CategoryColors),
  private: z.boolean(),
  hidden: z.boolean(),
})

const CategorySelectColors = CategoryColors.map((color) => ({
  value: color,
  name: upperFirst(color),
  color,
}))

const EditCategoryForm = ({
  category,
}: {
  category: EditCategoryProps['initialCategory']
}) => {
  const navigate = useNavigate()

  const queryClient = api.useUtils()

  const form = useForm<z.infer<typeof EditCategorySchema>>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      name: category.name,
      color: isCategoryColor(category.color) ? category.color : 'gray',
      private: category.private,
      hidden: category.hidden,
    },
  })

  const { mutateAsync } = api.category.update.useMutation({
    onSuccess: (data) => {
      queryClient.category.all.setData(undefined, (curr) => {
        if (!curr) {
          return [data]
        }
        return [...curr.map((item) => (item.id === data.id ? data : item))]
      })
      queryClient.category.one.setData({ id: category.id }, (curr) => {
        if (!curr) {
          return data
        }
        return {
          ...curr,
          ...data,
        }
      })
      queryClient.category.all.invalidate().catch(warn)
      queryClient.category.one.invalidate({ id: category.id }).catch(warn)
      queryClient.event.invalidate().catch(warn)
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync({
      id: category.id,
      ...data,
    })
    navigate({ path: '/categories' })
  })

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 px-2">
      <Field id="name" label="Name">
        <Input id="name" {...form.register('name')} />
      </Field>
      <Field id="color" label="Color">
        <Controller
          control={form.control}
          name="color"
          render={({ field }) => (
            <Select
              id="color"
              options={CategorySelectColors}
              defaultValue={category.color}
              {...field}
            />
          )}
        />
      </Field>
      <div className="flex items-center gap-2 px-2 py-4">
        <Controller
          control={form.control}
          name="private"
          render={({ field }) => (
            <Checkbox
              id="private"
              onCheckedChange={field.onChange}
              checked={field.value}
            />
          )}
        />
        <Label htmlFor="hidden" className="flex flex-col">
          <span className="text-base">Private</span>
          <span className="text-sm text-neutral-400">
            Events in this category will not be visible in shareable links
          </span>
        </Label>
      </div>
      <div className="flex items-center gap-2 px-2 py-4">
        <Controller
          control={form.control}
          name="hidden"
          render={({ field }) => (
            <Checkbox
              id="hidden"
              onCheckedChange={field.onChange}
              checked={field.value}
            />
          )}
        />
        <Label htmlFor="hidden" className="flex flex-col">
          <span className="text-base">Hidden</span>
          <span className="text-sm text-neutral-400">
            Events in this category will not show up in your inbox, events or
            calendar
          </span>
        </Label>
      </div>
      <SubmitButton>Save</SubmitButton>
    </form>
  )
}

export default function EditCategory({ initialCategory }: EditCategoryProps) {
  const { data: category } = api.category.one.useQuery(
    {
      id: initialCategory.id,
    },
    {
      initialData: initialCategory,
    }
  )

  if (!category) {
    return null
  }

  return (
    <InnerPageLayout
      headerLeft={
        <PathLink
          path="/categories"
          className="flex items-center justify-center"
        >
          <ChevronLeftIcon height={20} />
        </PathLink>
      }
      title={`Edit ${category.name}`}
    >
      <EditCategoryForm category={category} />
    </InnerPageLayout>
  )
}
