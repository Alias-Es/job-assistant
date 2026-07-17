// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import {
  findApplicationActions,
  findBestApplicationAction,
} from './application-action-detector'

function createDocument(html: string): Document {
  const parser = new DOMParser()

  return parser.parseFromString(html, 'text/html')
}

describe('findApplicationActions', () => {
  it('détecte un bouton Postuler', () => {
    const document = createDocument(`
      <main>
        <button type="button">Postuler</button>
      </main>
    `)

    const actions = findApplicationActions(document)

    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      text: 'Postuler',
      url: null,
    })
  })

  it('détecte un lien Apply now', () => {
    const document = createDocument(`
      <main>
        <a href="https://company.example/jobs/123/apply">
          Apply now
        </a>
      </main>
    `)

    const action = findBestApplicationAction(document)

    expect(action).not.toBeNull()
    expect(action).toMatchObject({
      text: 'Apply now',
      url: 'https://company.example/jobs/123/apply',
    })
  })

  it('détecte un lien grâce à son URL', () => {
    const document = createDocument(`
      <main>
        <a href="https://company.example/application/start">
          Continuer
        </a>
      </main>
    `)

    const action = findBestApplicationAction(document)

    expect(action).not.toBeNull()
    expect(action?.url).toBe(
      'https://company.example/application/start',
    )
  })

  it('détecte un bouton grâce à aria-label', () => {
    const document = createDocument(`
      <main>
        <button
          type="button"
          aria-label="Commencer la candidature"
        >
          Continuer
        </button>
      </main>
    `)

    const action = findBestApplicationAction(document)

    expect(action).not.toBeNull()
    expect(action?.text).toBe('Continuer')
  })

  it('ignore un bouton de création d’alerte', () => {
    const document = createDocument(`
      <main>
        <button type="button">
          Créer une alerte emploi
        </button>
      </main>
    `)

    const actions = findApplicationActions(document)

    expect(actions).toHaveLength(0)
  })

  it('ignore un bouton caché', () => {
    const document = createDocument(`
      <main>
        <button type="button" hidden>
          Postuler
        </button>
      </main>
    `)

    const actions = findApplicationActions(document)

    expect(actions).toHaveLength(0)
  })

  it('choisit le bouton le plus fiable', () => {
    const document = createDocument(`
      <main>
        <button type="button">
          Candidature
        </button>

        <a href="https://company.example/jobs/123/apply">
          Apply now
        </a>

        <button type="button">
          Créer une alerte emploi
        </button>
      </main>
    `)

    const action = findBestApplicationAction(document)

    expect(action).not.toBeNull()
    expect(action).toMatchObject({
      text: 'Apply now',
      url: 'https://company.example/jobs/123/apply',
    })
  })

  it('retourne null lorsqu’aucune action fiable existe', () => {
    const document = createDocument(`
      <main>
        <a href="/company">Voir l’entreprise</a>
        <button type="button">Partager</button>
      </main>
    `)

    const action = findBestApplicationAction(document)

    expect(action).toBeNull()
  })
})