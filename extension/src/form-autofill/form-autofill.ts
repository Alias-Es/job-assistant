import { inspectFormFields } from '../form-detection/field-inspector'
import { mapField } from '../form-detection/field-mapper'
import type { CandidateProfile } from '../profile/candidate-profile'
import { resolveCandidateValue } from '../profile/profile-value-resolver'
import { fillField } from './fill-field'

export interface AutofillResult {
  filledCount: number
  skippedCount: number
}

function isFillableTextField(
  element: HTMLElement,
): element is HTMLInputElement | HTMLTextAreaElement {
  if (element instanceof HTMLTextAreaElement) {
    return true
  }

  if (!(element instanceof HTMLInputElement)) {
    return false
  }

  const unsupportedTypes = [
    'file',
    'checkbox',
    'radio',
    'submit',
    'button',
    'hidden',
    'password',
  ]

  return !unsupportedTypes.includes(element.type)
}

export function autofillForm(
  document: Document,
  profile: CandidateProfile,
): AutofillResult {
  const fields = inspectFormFields(document)

  let filledCount = 0
  let skippedCount = 0

  for (const field of fields) {
    const mapping = mapField(field)

    // Pour le moment, on remplit uniquement les champs sûrs.
    if (mapping.category !== 'AUTO_FILL') {
      skippedCount += 1
      continue
    }

    // Une confiance trop faible augmente le risque d’erreur.
    if (mapping.confidence < 0.5) {
      skippedCount += 1
      continue
    }

    if (!isFillableTextField(field.element)) {
      skippedCount += 1
      continue
    }

    // On n’écrase jamais une information déjà saisie.
    if (field.element.value.trim().length > 0) {
      skippedCount += 1
      continue
    }

    if (field.element.disabled || field.element.readOnly) {
      skippedCount += 1
      continue
    }

    const value = resolveCandidateValue(
      profile,
      mapping.fieldType,
    )

    if (value === null || value.trim().length === 0) {
      skippedCount += 1
      continue
    }

    fillField(field.element, value)
    filledCount += 1
  }

  return {
    filledCount,
    skippedCount,
  }
}