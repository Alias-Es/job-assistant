// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import {
  detectApplicationSubmission,
} from './application-submission-detector'

function createDocument(
  html: string,
  title = '',
): Document {
  const parser = new DOMParser()

  return parser.parseFromString(
    `
      <!doctype html>
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `,
    'text/html',
  )
}

describe('detectApplicationSubmission', () => {
  it('détecte une confirmation française', () => {
    const document = createDocument(`
      <main>
        <h1>Merci pour votre candidature</h1>

        <p>
          Nous avons bien reçu votre candidature.
        </p>
      </main>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result.detected).toBe(true)
    expect(result.matchedText).not.toBeNull()
  })

  it('détecte une confirmation anglaise', () => {
    const document = createDocument(`
      <main>
        <h1>Application submitted</h1>

        <p>Thank you for applying.</p>
      </main>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result.detected).toBe(true)
  })

  it('détecte un message de statut', () => {
    const document = createDocument(`
      <div role="status">
        Votre candidature a bien été envoyée.
      </div>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result.detected).toBe(true)
  })

  it('ignore un bouton Envoyer la candidature', () => {
    const document = createDocument(`
      <main>
        <h1>Formulaire de candidature</h1>

        <button>
          Envoyer votre candidature
        </button>
      </main>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result).toEqual({
      detected: false,
      matchedText: null,
    })
  })

  it('ignore une page demandant de finaliser', () => {
    const document = createDocument(`
      <main>
        <h1>Finaliser votre candidature</h1>

        <p>
          Vérifiez vos informations avant de continuer.
        </p>
      </main>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result.detected).toBe(false)
  })

  it('ignore une page ordinaire', () => {
    const document = createDocument(`
      <main>
        <h1>Développeur Java</h1>

        <p>
          Découvrez cette opportunité professionnelle.
        </p>
      </main>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result).toEqual({
      detected: false,
      matchedText: null,
    })
  })

  it('gère les accents et les majuscules', () => {
    const document = createDocument(`
      <h1>
        VOTRE CANDIDATURE A BIEN ÉTÉ ENVOYÉE
      </h1>
    `)

    const result =
      detectApplicationSubmission(document)

    expect(result.detected).toBe(true)
  })
})