export type SupportedFormField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement

export interface InspectedField {
  element: SupportedFormField
  tagName: 'input' | 'textarea' | 'select'
  type: string
  label: string
  name: string
  id: string
  placeholder: string
  autocomplete: string
  ariaLabel: string
}

function getTagName(
  field: SupportedFormField,
): InspectedField['tagName'] {
  return field.tagName.toLowerCase() as InspectedField['tagName']
}

function getFieldType(field: SupportedFormField): string {
  if (field instanceof HTMLInputElement) {
    return field.type
  }

  return getTagName(field)
}

function getPlaceholder(field: SupportedFormField): string {
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
  ) {
    return field.placeholder
  }

  return ''
}

function getLabel(field: SupportedFormField): string {
  const firstLabel = field.labels?.item(0)

  return firstLabel?.textContent?.trim() ?? ''
}

export function inspectField(
  field: SupportedFormField,
): InspectedField {
  return {
    element: field,
    tagName: getTagName(field),
    type: getFieldType(field),
    label: getLabel(field),
    name: field.name,
    id: field.id,
    placeholder: getPlaceholder(field),
    autocomplete: field.getAttribute('autocomplete') ?? '',
    ariaLabel: field.getAttribute('aria-label') ?? '',
  }
}

export function inspectFormFields(
  document: Document,
): InspectedField[] {
  const fields = document.querySelectorAll<SupportedFormField>(
    'form input, form textarea, form select',
  )

  return Array.from(fields).map(inspectField)
}