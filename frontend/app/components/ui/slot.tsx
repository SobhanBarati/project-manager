import * as React from "react"

function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>((props, ref) => {
  const { children, ...rest } = props
  
  if (!children) {
    return null
  }
  
  const child = React.Children.only(children)
  
  if (!React.isValidElement(child)) {
    return child
  }

  // گرفتن props های کودک
  const childProps = child.props as any
  
  // گرفتن ref کودک
  const childRef = childProps.ref

  return React.cloneElement(child, {
    ...rest,
    ...childProps,
    ref: mergeRefs([ref, childRef]),
  })
})

Slot.displayName = "Slot"

export { Slot }