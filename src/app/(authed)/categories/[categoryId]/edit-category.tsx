'use client'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import upperFirst from 'lodash/upperFirst'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DeleteButton } from '~/components/form/DeleteButton'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Button, SubmitButton } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field } from '~/components/ui/Field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select } from '~/components/ui/select'
import { env } from '~/env.mjs'
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
  private: z.boolean().default(false),
  hidden: z.boolean().default(false),
})

const CategorySelectColors = CategoryColors.map((color) => ({
  value: color,
  name: upperFirst(color),
  color,
}))

const EditCategoryForm = ({
  category,
}: {
  category?: EditCategoryProps['initialCategory']
}) => {
  const navigate = useNavigate()

  const queryClient = api.useUtils()

  const form = useForm<z.infer<typeof EditCategorySchema>>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      name: category?.name,
      color:
        category && isCategoryColor(category.color) ? category.color : 'gray',
      private: category?.private,
      hidden: category?.hidden,
    },
  })

  const updateCategory = api.category.update.useMutation({
    onSuccess: (data) => {
      queryClient.category.all.setData(undefined, (curr) => {
        if (!curr) {
          return [data]
        }
        return [...curr.map((item) => (item.id === data.id ? data : item))]
      })
      queryClient.category.one.setData({ id: data.id }, (curr) => {
        if (!curr) {
          return data
        }
        return {
          ...curr,
          ...data,
        }
      })
      queryClient.category.all.invalidate().catch(warn)
      queryClient.category.one.invalidate({ id: data.id }).catch(warn)
      queryClient.event.invalidate().catch(warn)
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const createCategory = api.category.create.useMutation({
    onSuccess: (data) => {
      queryClient.category.all.setData(undefined, (curr) => {
        if (!curr) {
          return [data]
        }
        return [...curr, data]
      })
      queryClient.category.all.invalidate().catch(warn)
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const removeCategory = api.category.remove.useMutation({
    onSuccess: (data) => {
      queryClient.category.all.invalidate().catch(warn)
      queryClient.category.one.invalidate({ id: data.id }).catch(warn)
      queryClient.event.invalidate().catch(warn)
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (category) {
      await updateCategory.mutateAsync({
        id: category.id,
        ...data,
      })
    } else {
      console.log('woa')
      await createCategory.mutateAsync(data)
    }
    navigate({ path: '/categories' })
  })

  const lockForm =
    updateCategory.isPending ||
    createCategory.isPending ||
    removeCategory.isPending ||
    form.formState.isSubmitting

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 px-2">
      <Field id="name" label="Name">
        <Input id="name" disabled={lockForm} {...form.register('name')} />
      </Field>
      <Field id="color" label="Color">
        <Controller
          control={form.control}
          name="color"
          render={({ field }) => (
            <Select
              id="color"
              disabled={lockForm}
              options={CategorySelectColors}
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
              disabled={lockForm}
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
              disabled={lockForm}
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
      {form.formState.errors.root && (
        <div className="text-red-500">{form.formState.errors.root.message}</div>
      )}
      <SubmitButton disabled={lockForm}>Save</SubmitButton>
      {category && (
        <DeleteButton
          disabled={lockForm}
          title={`Delete ${category.name}`}
          body={`Are you sure you want to delete ${category.name}? All events in this category will be uncategorized. This action cannot be undone.`}
          buttonText="Delete"
          isDeleting={removeCategory.isPending}
          onDelete={() => removeCategory.mutate({ id: category.id })}
        >
          Delete
        </DeleteButton>
      )}
    </form>
  )
}

export const CreateCategory = () => {
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
      title={`Create Category`}
    >
      <EditCategoryForm />
    </InnerPageLayout>
  )
}

export const EditCategory = ({ initialCategory }: EditCategoryProps) => {
  const { data: category } = api.category.one.useQuery(
    {
      id: initialCategory?.id ?? '',
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
