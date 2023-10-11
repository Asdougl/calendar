export const propsHasClassName = <T extends Record<string, unknown>>(
  props: T
): props is T & { className: string } => {
  return 'className' in props && typeof props.className === 'string'
}

export const classNameProp = <T extends Record<string, unknown>>(
  props: T
): string | undefined => {
  if (propsHasClassName(props)) {
    return props.className
  }
  return undefined
}
