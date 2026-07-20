type FillableField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement

function setNativeValue(
  field: FillableField,
  value: string,
): void {
  if (field instanceof HTMLInputElement) {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )

    descriptor?.set?.call(field, value)
    return
  }

  if (field instanceof HTMLTextAreaElement) {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )

    descriptor?.set?.call(field, value)
    return
  }

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value',
  )

  descriptor?.set?.call(field, value)
}

function dispatchFieldEvents(
  field: FillableField,
): void {
  field.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      composed: true,
      inputType: 'insertText',
    }),
  )

  field.dispatchEvent(
    new Event('change', {
      bubbles: true,
      composed: true,
    }),
  )
}

export function fillField(
  field: FillableField,
  value: string,
): void {
  field.focus()

  setNativeValue(field, value)
  dispatchFieldEvents(field)

  field.blur()
}