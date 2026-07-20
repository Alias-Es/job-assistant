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

type SearchRoot = Document | ShadowRoot

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

function getFieldRoot(field: SupportedFormField): SearchRoot {
  const root = field.getRootNode()

  if (root instanceof ShadowRoot) {
    return root
  }

  return field.ownerDocument
}

function getLabel(field: SupportedFormField): string {
  const associatedLabel = field.labels?.item(0)
  const associatedLabelText =
    associatedLabel?.textContent?.trim() ?? ''

  if (associatedLabelText.length > 0) {
    return associatedLabelText
  }

  if (field.id.length === 0) {
    return ''
  }

  const root = getFieldRoot(field)
  const labels = root.querySelectorAll('label')

  for (const label of labels) {
    if (label.htmlFor === field.id) {
      return label.textContent?.trim() ?? ''
    }
  }

  return ''
}

function isRelevantField(field: SupportedFormField): boolean {
  if (field.disabled) {
    return false
  }

  if (field.getAttribute('aria-hidden') === 'true') {
    return false
  }

  if (field instanceof HTMLInputElement) {
    const ignoredTypes = [
      'hidden',
      'submit',
      'button',
      'reset',
      'image',
    ]

    if (ignoredTypes.includes(field.type)) {
      return false
    }
  }

  return true
}

function collectSearchRoots(
  root: SearchRoot,
  collectedRoots: SearchRoot[],
): void {
  collectedRoots.push(root)

  const elements = root.querySelectorAll<HTMLElement>('*')

  for (const element of elements) {
    if (element.shadowRoot !== null) {
      collectSearchRoots(
        element.shadowRoot,
        collectedRoots,
      )
    }
  }
}

function findAllFormFields(
  document: Document,
): SupportedFormField[] {
  const roots: SearchRoot[] = []

  collectSearchRoots(document, roots)

  const uniqueFields = new Set<SupportedFormField>()

  for (const root of roots) {
    const fields =
      root.querySelectorAll<SupportedFormField>(
        'input, textarea, select',
      )

    for (const field of fields) {
      if (isRelevantField(field)) {
        uniqueFields.add(field)
      }
    }
  }

  return Array.from(uniqueFields)
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
    autocomplete:
      field.getAttribute('autocomplete') ?? '',
    ariaLabel:
      field.getAttribute('aria-label') ?? '',
  }
}

export function inspectFormFields(
  document: Document,
): InspectedField[] {
  return findAllFormFields(document).map(inspectField)
}