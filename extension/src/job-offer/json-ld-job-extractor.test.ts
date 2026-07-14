import { describe, expect, it } from 'vitest'

import { extractJobOfferFromJsonLd } from './json-ld-job-extractor'

describe('extractJobOfferFromJsonLd', () => {
  it('extrait une offre JobPosting complète', () => {
    const jsonLdContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: 'Développeur Java',
      description: 'Développement d’une API Spring Boot.',
      employmentType: 'FULL_TIME',
      url: 'https://example.com/jobs/123',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Entreprise ABC',
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'La Rochelle',
          addressRegion: 'Nouvelle-Aquitaine',
          addressCountry: 'France',
        },
      },
    })

    const result = extractJobOfferFromJsonLd(
      jsonLdContent,
      'https://fallback.example.com',
    )

    expect(result).toEqual({
      title: 'Développeur Java',
      company: 'Entreprise ABC',
      location: 'La Rochelle, Nouvelle-Aquitaine, France',
      employmentType: 'FULL_TIME',
      description: 'Développement d’une API Spring Boot.',
      url: 'https://example.com/jobs/123',
    })
  })

  it('retourne null lorsque le JSON est invalide', () => {
    const result = extractJobOfferFromJsonLd(
      '{ JSON invalide',
      'https://example.com',
    )

    expect(result).toBeNull()
  })

  it('retourne null lorsque le document ne contient pas de JobPosting', () => {
    const jsonLdContent = JSON.stringify({
      '@type': 'Organization',
      name: 'Entreprise ABC',
    })

    const result = extractJobOfferFromJsonLd(
      jsonLdContent,
      'https://example.com',
    )

    expect(result).toBeNull()
  })

  it('utilise l’URL courante lorsque le JSON-LD ne fournit pas d’URL', () => {
    const jsonLdContent = JSON.stringify({
      '@type': 'JobPosting',
      title: 'Développeur TypeScript',
    })

    const result = extractJobOfferFromJsonLd(
      jsonLdContent,
      'https://example.com/jobs/typescript',
    )

    expect(result?.url).toBe(
      'https://example.com/jobs/typescript',
    )
  })
})