import { describe, expect, it, vi } from 'vitest'

import type { ExtractedJobOffer } from '../job-offer/job-offer'
import { createPendingApplication } from './pending-application'

describe('createPendingApplication', () => {
  it('crée une candidature temporaire à partir d’une offre', () => {
    const offer: ExtractedJobOffer = {
      title: 'Développeur Java',
      company: 'Entreprise Test',
      location: 'Paris',
      employmentType: 'CDI',
      description: 'Développement d’une application Java.',
      url: 'https://example.com/jobs/java-developer',
    }

    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '123e4567-e89b-12d3-a456-426614174000',
    )

    vi.spyOn(Date, 'now').mockReturnValue(1_784_148_400_000)

    const result = createPendingApplication(offer)

    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      offer,
      startedAt: 1_784_148_400_000,
      status: 'STARTED',
    })
  })
})