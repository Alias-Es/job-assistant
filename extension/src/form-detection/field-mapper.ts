import type { InspectedField } from './field-inspector'

export type FieldCategory =
  | 'AUTO_FILL'
  | 'AI_ASSISTED'
  | 'MANUAL_ONLY'
  | 'UNKNOWN'

export type CandidateFieldType =
  | 'FIRST_NAME'
  | 'LAST_NAME'
  | 'EMAIL'
  | 'PHONE'
  | 'CITY'
  | 'LINKEDIN'
  | 'PORTFOLIO'
  | 'EDUCATION'
  | 'OPEN_QUESTION'
  | 'RESUME'
  | 'SALARY_EXPECTATION'
  | 'WORK_AUTHORIZATION'
  | 'SENSITIVE_INFORMATION'
  | 'CONSENT'
  | 'UNKNOWN'

export interface FieldMapping {
  category: FieldCategory
  fieldType: CandidateFieldType
  confidence: number
}

interface MappingRule {
  fieldType: CandidateFieldType
  category: FieldCategory
  keywords: string[]
  minimumScore: number
}

const AUTOCOMPLETE_MAPPINGS: Record<
  string,
  CandidateFieldType
> = {
  'given-name': 'FIRST_NAME',
  'family-name': 'LAST_NAME',
  email: 'EMAIL',
  tel: 'PHONE',
  'tel-national': 'PHONE',
  'address-level2': 'CITY',
  url: 'PORTFOLIO',
}

const MAPPING_RULES: MappingRule[] = [
  {
    fieldType: 'FIRST_NAME',
    category: 'AUTO_FILL',
    keywords: [
      'prenom',
      'premier prenom',
      'first name',
      'firstname',
      'given name',
      'givenname',
    ],
    minimumScore: 3,
  },
  {
    fieldType: 'LAST_NAME',
    category: 'AUTO_FILL',
    keywords: [
      'nom',
      'nom de famille',
      'last name',
      'lastname',
      'family name',
      'familyname',
      'surname',
    ],
    minimumScore: 3,
  },
  {
    fieldType: 'EMAIL',
    category: 'AUTO_FILL',
    keywords: [
      'email',
      'e mail',
      'adresse email',
      'adresse e mail',
      'courriel',
      'confirm email',
      'confirmation email',
      'confirmez votre email',
      'ressaisissez l adresse email',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'PHONE',
    category: 'AUTO_FILL',
    keywords: [
      'telephone',
      'numero de telephone',
      'phone',
      'phone number',
      'mobile',
      'mobile phone',
      'tel',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'CITY',
    category: 'AUTO_FILL',
    keywords: [
      'ville',
      'city',
      'localite',
      'locality',
      'commune',
      'ville de residence',
      'city of residence',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'LINKEDIN',
    category: 'AUTO_FILL',
    keywords: [
      'linkedin',
      'profil linkedin',
      'linkedin profile',
      'linkedin url',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'PORTFOLIO',
    category: 'AUTO_FILL',
    keywords: [
      'portfolio',
      'site web',
      'website',
      'personal website',
      'site personnel',
      'repository',
      'repo',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'EDUCATION',
    category: 'AUTO_FILL',
    keywords: [
      'formation principale',
      'education',
      'highest education',
      'diplome principal',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'OPEN_QUESTION',
    category: 'AI_ASSISTED',
    keywords: [
      'motivation',
      'why do you want',
      'why would you',
      'pourquoi souhaitez vous',
      'projet pertinent',
      'relevant project',
      'describe a project',
      'decrivez un projet',
      'message au recruteur',
      'cover letter',
      'lettre de motivation',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'RESUME',
    category: 'MANUAL_ONLY',
    keywords: [
      'resume',
      'curriculum vitae',
      'cv',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'SALARY_EXPECTATION',
    category: 'MANUAL_ONLY',
    keywords: [
      'salary',
      'salaire',
      'pretentions salariales',
      'salary expectation',
      'remuneration',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'WORK_AUTHORIZATION',
    category: 'MANUAL_ONLY',
    keywords: [
      'work authorization',
      'autorisation de travail',
      'right to work',
      'sponsorship',
      'autorise a travailler',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'SENSITIVE_INFORMATION',
    category: 'MANUAL_ONLY',
    keywords: [
      'handicap',
      'disability',
      'health',
      'sante',
      'religion',
      'ethnicity',
      'origine',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'CONSENT',
    category: 'MANUAL_ONLY',
    keywords: [
      'consent',
      'consentement',
      'privacy',
      'confidentialite',
      'certifie',
      'exactitude',
    ],
    minimumScore: 2,
  },
]

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[_*/:()\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsKeyword(
  value: string,
  keyword: string,
): boolean {
  const normalizedValue = normalizeText(value)
  const normalizedKeyword = normalizeText(keyword)

  if (
    normalizedValue.length === 0 ||
    normalizedKeyword.length === 0
  ) {
    return false
  }

  if (normalizedValue === normalizedKeyword) {
    return true
  }

  /*
   * Les espaces évitent que "nom" corresponde à "prenom".
   */
  return ` ${normalizedValue} `.includes(
    ` ${normalizedKeyword} `,
  )
}

function getAutocompleteMapping(
  field: InspectedField,
): FieldMapping | null {
  const autocompleteTokens = normalizeText(
    field.autocomplete,
  ).split(' ')

  for (const token of autocompleteTokens) {
    const fieldType = AUTOCOMPLETE_MAPPINGS[token]

    if (fieldType !== undefined) {
      return {
        category: 'AUTO_FILL',
        fieldType,
        confidence: 1,
      }
    }
  }

  return null
}

function scoreValue(
  value: string,
  keywords: string[],
  weight: number,
): number {
  if (value.trim().length === 0) {
    return 0
  }

  for (const keyword of keywords) {
    if (containsKeyword(value, keyword)) {
      return weight
    }
  }

  return 0
}

function calculateRuleScore(
  field: InspectedField,
  rule: MappingRule,
): number {
  let score = 0

  /*
   * Le label visible est généralement l’indice le plus fiable.
   */
  score += scoreValue(field.label, rule.keywords, 5)

  /*
   * name et id sont souvent utilisés par les ATS.
   */
  score += scoreValue(field.name, rule.keywords, 3)
  score += scoreValue(field.id, rule.keywords, 3)

  /*
   * Les indices d’interface sont utiles, mais moins fiables.
   */
  score += scoreValue(
    field.ariaLabel,
    rule.keywords,
    3,
  )
  score += scoreValue(
    field.placeholder,
    rule.keywords,
    2,
  )

  return score
}

function calculateConfidence(
  score: number,
  minimumScore: number,
): number {
  if (score < minimumScore) {
    return 0
  }

  return Math.min(1, 0.65 + score * 0.05)
}

export function mapField(
  field: InspectedField,
): FieldMapping {
  const autocompleteMapping =
    getAutocompleteMapping(field)

  if (autocompleteMapping !== null) {
    return autocompleteMapping
  }

  let bestMapping: FieldMapping = {
    category: 'UNKNOWN',
    fieldType: 'UNKNOWN',
    confidence: 0,
  }

  for (const rule of MAPPING_RULES) {
    const score = calculateRuleScore(field, rule)

    if (score < rule.minimumScore) {
      continue
    }

    const confidence = calculateConfidence(
      score,
      rule.minimumScore,
    )

    if (confidence > bestMapping.confidence) {
      bestMapping = {
        category: rule.category,
        fieldType: rule.fieldType,
        confidence,
      }
    }
  }

  return bestMapping
}