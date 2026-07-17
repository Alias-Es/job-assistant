export type ApplicationActionElement =
  | HTMLAnchorElement
  | HTMLButtonElement
  | HTMLElement

export interface ApplicationAction {
  element: ApplicationActionElement
  text: string
  url: string | null
  score: number
}

const STRONG_KEYWORDS = [
  'postuler',
  'je postule',
  'candidater',
  'je candidate',
  'envoyer ma candidature',
  'déposer ma candidature',
  'apply',
  'apply now',
  'apply for this job',
  'submit application',
  'start application',
]

const MEDIUM_KEYWORDS = [
  'candidature',
  'candidate',
  'rejoignez-nous',
  'rejoindre',
  'join us',
  'join our team',
  'voir la candidature',
  'continuer vers la candidature',
  'commencer la candidature',
]

const NEGATIVE_KEYWORDS = [
  'connexion',
  'se connecter',
  'login',
  'sign in',
  'créer un compte',
  'create account',
  'sign up',
  'newsletter',
  'alerte',
  'job alert',
  'partager',
  'share',
  'enregistrer',
  'save',
  'favori',
  'favorite',
]

const APPLICATION_URL_KEYWORDS = [
  'apply',
  'application',
  'candidature',
  'postuler',
  'candidate',
  'jobs/apply',
  'careers/apply',
]

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsKeyword(
  value: string,
  keywords: string[],
): boolean {
  const normalizedValue = normalizeText(value)

  return keywords.some((keyword) =>
    normalizedValue.includes(normalizeText(keyword)),
  )
}

function getElementText(
  element: ApplicationActionElement,
): string {
  return [
    element.textContent ?? '',
    element.getAttribute('aria-label') ?? '',
    element.getAttribute('title') ?? '',
    element.getAttribute('name') ?? '',
    element.id,
    element.className,
    element.getAttribute('data-testid') ?? '',
    element.getAttribute('data-test') ?? '',
    element.getAttribute('data-cy') ?? '',
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
}

function getActionUrl(
  element: ApplicationActionElement,
): string | null {
  if (!(element instanceof HTMLAnchorElement)) {
    return null
  }

  const href = element.getAttribute('href')

  if (href === null || href.trim().length === 0) {
    return null
  }

  try {
    return new URL(
      href,
      element.ownerDocument.baseURI,
    ).href
  } catch {
    return null
  }
}

function isVisible(element: HTMLElement): boolean {
  if (element.hidden) {
    return false
  }

  if (element.getAttribute('aria-hidden') === 'true') {
    return false
  }

  const style = window.getComputedStyle(element)

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden'
  )
}

function isDisabled(
  element: ApplicationActionElement,
): boolean {
  if (
    element instanceof HTMLButtonElement &&
    element.disabled
  ) {
    return true
  }

  return element.getAttribute('aria-disabled') === 'true'
}

function calculateScore(
  element: ApplicationActionElement,
): number {
  const searchableText = getElementText(element)
  let score = 0

  if (containsKeyword(searchableText, STRONG_KEYWORDS)) {
    score += 8
  }

  if (containsKeyword(searchableText, MEDIUM_KEYWORDS)) {
    score += 4
  }

  if (containsKeyword(searchableText, NEGATIVE_KEYWORDS)) {
    score -= 8
  }

  if (element instanceof HTMLAnchorElement) {
    const href = element.getAttribute('href') ?? ''

    if (
      containsKeyword(
        href,
        APPLICATION_URL_KEYWORDS,
      )
    ) {
      score += 5
    }

    if (
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      score -= 6
    }
  }

  if (
    element instanceof HTMLButtonElement ||
    element.getAttribute('role') === 'button'
  ) {
    score += 1
  }

  return score
}

export function findApplicationActions(
  document: Document,
): ApplicationAction[] {
  const elements =
    document.querySelectorAll<ApplicationActionElement>(
      'a, button, [role="button"]',
    )

  const actions: ApplicationAction[] = []

  for (const element of elements) {
    if (!isVisible(element) || isDisabled(element)) {
      continue
    }

    const score = calculateScore(element)

    // En dessous de 5, le résultat est trop incertain.
    if (score < 5) {
      continue
    }

    actions.push({
      element,
      text: element.textContent?.trim() ?? '',
      url: getActionUrl(element),
      score,
    })
  }

  return actions.sort(
    (firstAction, secondAction) =>
      secondAction.score - firstAction.score,
  )
}

export function findBestApplicationAction(
  document: Document,
): ApplicationAction | null {
  return findApplicationActions(document)[0] ?? null
}