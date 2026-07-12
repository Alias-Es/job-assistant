import { describe, expect, it } from 'vitest'

import { createPageInformation } from './page-information'

describe('createPageInformation', () => {
  it('conserve le titre et l’URL fournis par le navigateur', () => {
    const result = createPageInformation({
      title: 'Développeur Java - Entreprise ABC',
      url: 'https://example.com/jobs/123',
    })

    expect(result).toEqual({
      title: 'Développeur Java - Entreprise ABC',
      url: 'https://example.com/jobs/123',
    })
  })

  it('utilise des valeurs de remplacement lorsque les données manquent', () => {
    const result = createPageInformation({})

    expect(result).toEqual({
      title: 'Titre indisponible',
      url: 'URL indisponible',
    })
  })
})