export type PageContext =
  | 'OFFER_PAGE'
  | 'APPLICATION_FORM_PAGE'
  | 'OFFER_AND_APPLICATION_FORM'
  | 'UNSUPPORTED_PAGE'

type FormField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement

const APPLICATION_KEYWORDS = [
  'apply',
  'application',
  'candidate',
  'candidature',
  'postuler',
  'resume',
  'cv',
  'curriculum vitae',
  'cover letter',
  'lettre de motivation',
  'linkedin',
  'work authorization',
  'autorisation de travail',
]

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsApplicationKeyword(value: string): boolean {
  const normalizedValue = normalizeText(value)

  return APPLICATION_KEYWORDS.some((keyword) =>
    normalizedValue.includes(normalizeText(keyword)),
  )
}

function getFieldPlaceholder(field: FormField): string {
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
  ) {
    return field.placeholder
  }

  return ''
}

function getAssociatedLabel(field: FormField): string {
  const firstLabel = field.labels?.item(0)

  return firstLabel?.textContent?.trim() ?? ''
}

function containsJobPosting(document: Document): boolean {
  const jsonLdElements =
    document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    )

  for (const jsonLdElement of jsonLdElements) {
    const content = jsonLdElement.textContent

    if (content === null) {
      continue
    }

    if (content.includes('"JobPosting"')) {
      return true
    }
  }

  return false
}

function calculateApplicationFormScore(
  document: Document,
): number {
  let score = 0

  const forms = document.querySelectorAll('form')

  if (forms.length === 0) {
    return 0
  }

  const fileInputs =
    document.querySelectorAll<HTMLInputElement>(
      'input[type="file"]',
    )

  for (const fileInput of fileInputs) {
    const acceptedFiles = fileInput.accept

    const fieldInformation = [
      getAssociatedLabel(fileInput),
      fileInput.name,
      fileInput.id,
      fileInput.getAttribute('aria-label') ?? '',
      acceptedFiles,
    ].join(' ')

    if (
      containsApplicationKeyword(fieldInformation) ||
      acceptedFiles.toLowerCase().includes('.pdf')
    ) {
      score += 3
      break
    }
  }

  const fields = document.querySelectorAll<FormField>(
    'input, textarea, select',
  )

  for (const field of fields) {
    const fieldInformation = [
      getAssociatedLabel(field),
      field.name,
      field.id,
      getFieldPlaceholder(field),
      field.getAttribute('aria-label') ?? '',
      field.getAttribute('autocomplete') ?? '',
    ].join(' ')

    if (containsApplicationKeyword(fieldInformation)) {
      score += 1
    }
  }

  const pageHeadings = Array.from(
    document.querySelectorAll('h1, h2, h3, legend'),
  )
    .map((element) => element.textContent ?? '')
    .join(' ')

  if (containsApplicationKeyword(pageHeadings)) {
    score += 2
  }

  return score
}

function containsApplicationForm(
  document: Document,
): boolean {
  // Un simple formulaire ne suffit pas :
  // ça pourrait être une newsletter ou une page de connexion.
  return calculateApplicationFormScore(document) >= 3
}

export function detectPageContext(
  document: Document,
): PageContext {
  const hasJobPosting = containsJobPosting(document)
  const hasApplicationForm =
    containsApplicationForm(document)

  if (hasJobPosting && hasApplicationForm) {
    return 'OFFER_AND_APPLICATION_FORM'
  }

  if (hasJobPosting) {
    return 'OFFER_PAGE'
  }

  if (hasApplicationForm) {
    return 'APPLICATION_FORM_PAGE'
  }

  return 'UNSUPPORTED_PAGE'
}