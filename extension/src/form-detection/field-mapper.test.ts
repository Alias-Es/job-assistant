// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import { inspectField } from './field-inspector'
import { mapField } from './field-mapper'

function createField<TElement extends HTMLElement>(
  html: string,
  selector: string,
): TElement {
  const parser = new DOMParser()
  const document = parser.parseFromString(html, 'text/html')
  const element = document.querySelector<TElement>(selector)

  if (element === null) {
    throw new Error(`Le champ ${selector} est introuvable dans le test`)
  }

  return element
}

describe('mapField', () => {
  it('reconnaît un champ prénom', () => {
    const field = createField<HTMLInputElement>(
      `
        <form>
          <label for="first-name">Prénom</label>

          <input
            id="first-name"
            name="candidate_first_name"
            type="text"
            autocomplete="given-name"
            placeholder="Votre prénom"
          />
        </form>
      `,
      '#first-name',
    )

    const inspectedField = inspectField(field)
    const result = mapField(inspectedField)

    expect(result.fieldType).toBe('FIRST_NAME')
    expect(result.category).toBe('AUTO_FILL')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('reconnaît un champ e-mail', () => {
    const field = createField<HTMLInputElement>(
      `
        <form>
          <label for="email">Adresse e-mail</label>

          <input
            id="email"
            name="candidate_email"
            type="email"
            autocomplete="email"
          />
        </form>
      `,
      '#email',
    )

    const inspectedField = inspectField(field)
    const result = mapField(inspectedField)

    expect(result).toMatchObject({
      fieldType: 'EMAIL',
      category: 'AUTO_FILL',
    })
  })

  it('classe une question de motivation comme assistée par IA', () => {
    const field = createField<HTMLTextAreaElement>(
      `
        <form>
          <label for="motivation">
            Pourquoi souhaitez-vous rejoindre notre entreprise ?
          </label>

          <textarea
            id="motivation"
            name="motivation"
            placeholder="Expliquez votre motivation"
          ></textarea>
        </form>
      `,
      '#motivation',
    )

    const inspectedField = inspectField(field)
    const result = mapField(inspectedField)

    expect(result).toMatchObject({
      fieldType: 'OPEN_QUESTION',
      category: 'AI_ASSISTED',
    })
  })

  it('classe un champ CV comme manuel', () => {
    const field = createField<HTMLInputElement>(
      `
        <form>
          <label for="resume">CV</label>

          <input
            id="resume"
            name="candidate_resume"
            type="file"
            accept=".pdf"
          />
        </form>
      `,
      '#resume',
    )

    const inspectedField = inspectField(field)
    const result = mapField(inspectedField)

    expect(result).toMatchObject({
      fieldType: 'RESUME',
      category: 'MANUAL_ONLY',
    })
  })

  it('classe un consentement comme manuel', () => {
    const field = createField<HTMLInputElement>(
      `
        <form>
          <input
            id="privacy-consent"
            name="privacy_consent"
            type="checkbox"
          />

          <label for="privacy-consent">
            Je certifie l’exactitude des informations
            et j’accepte le traitement de mes données.
          </label>
        </form>
      `,
      '#privacy-consent',
    )

    const inspectedField = inspectField(field)
    const result = mapField(inspectedField)

    expect(result).toMatchObject({
      fieldType: 'CONSENT',
      category: 'MANUAL_ONLY',
    })
  })

  it('laisse un champ incompris dans UNKNOWN', () => {
    const field = createField<HTMLInputElement>(
      `
        <form>
          <label for="internal-reference">
            Référence interne
          </label>

          <input
            id="internal-reference"
            name="internal_reference"
            type="text"
          />
        </form>
      `,
      '#internal-reference',
    )

    const inspectedField = inspectField(field)
    const result = mapField(inspectedField)

    expect(result).toEqual({
      fieldType: 'UNKNOWN',
      category: 'UNKNOWN',
      confidence: 0,
    })
  })
})