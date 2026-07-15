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

const MAPPING_RULES: MappingRule[] = [
  {
    fieldType: 'FIRST_NAME',
    category: 'AUTO_FILL',
    keywords: [
      'first name',
      'firstname',
      'given name',
      'prenom',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'LAST_NAME',
    category: 'AUTO_FILL',
    keywords: [
      'last name',
      'lastname',
      'family name',
      'surname',
      'nom de famille',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'EMAIL',
    category: 'AUTO_FILL',
    keywords: [
      'email',
      'e-mail',
      'mail',
      'adresse e-mail',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'PHONE',
    category: 'AUTO_FILL',
    keywords: [
      'phone',
      'telephone',
      'mobile',
      'tel',
    ],
    minimumScore: 2,
  },
  {
    fieldType: 'LINKEDIN',
    category: 'AUTO_FILL',
    keywords: ['linkedin'],
    minimumScore: 1,
  },
  {
    fieldType: 'PORTFOLIO',
    category: 'AUTO_FILL',
    keywords: [
      'portfolio',
      'personal website',
      'website',
      'site personnel',
    ],
    minimumScore: 1,
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
    minimumScore: 1,
  },
  {
    fieldType: 'OPEN_QUESTION',
    category: 'AI_ASSISTED',
    keywords: [
      'motivation',
      'why do you want',
      'why would you',
      'pourquoi souhaitez-vous',
      'projet pertinent',
      'relevant project',
      'describe a project',
      'decrivez un projet',
    ],
    minimumScore: 1,
  },
  {
    fieldType: 'RESUME',
    category: 'MANUAL_ONLY',
    keywords: [
      'resume',
      'curriculum vitae',
      'cv',
    ],
    minimumScore: 1,
  },
  {
    fieldType: 'SALARY_EXPECTATION',
    category: 'MANUAL_ONLY',
    keywords: [
      'salary',
      'salaire',
      'pretentions salariales',
      'salary expectation',
    ],
    minimumScore: 1,
  },
  {
    fieldType: 'WORK_AUTHORIZATION',
    category: 'MANUAL_ONLY',
    keywords: [
      'work authorization',
      'autorisation de travail',
      'right to work',
      'sponsorship',
    ],
    minimumScore: 1,
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
    minimumScore: 1,
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
    minimumScore: 1,
  },
]

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchableValues(field: InspectedField): string[] {
  return [
    field.label,
    field.name,
    field.id,
    field.placeholder,
    field.autocomplete,
    field.ariaLabel,
  ]
    .map(normalizeText)
    .filter((value) => value.length > 0)
}

function calculateRuleScore(
  field: InspectedField,
  rule: MappingRule,
): number {
  const searchableValues = getSearchableValues(field)

  let score = 0

  for (const value of searchableValues) {
    const hasMatchingKeyword = rule.keywords.some((keyword) =>
      value.includes(normalizeText(keyword)),
    )

    if (hasMatchingKeyword) {
      score += 1
    }
  }

  return score
}

function calculateConfidence(
  score: number,
  minimumScore: number,
): number {
  if (score < minimumScore) {
    return 0
  }

  return Math.min(1, score / 4)
}

export function mapField(field: InspectedField): FieldMapping {
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