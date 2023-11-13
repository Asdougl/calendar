export const AddTodo = () => {
  const onSubmit = (formData: FormData) => {
    'use server'
  }

  return (
    <form action={onSubmit}>
      <input type="text" name="todo-name" />
      <button type="submit">Create</button>
    </form>
  )
}
