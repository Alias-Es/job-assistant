import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PendingApplication } from './pending-application'
import {
  clearPendingApplication,
  getPendingApplication,
  savePendingApplication,
} from './pending-application-storage'

const setMock = vi.fn()
const getMock = vi.fn()
const removeMock = vi.fn()

beforeEach(() => {
  setMock.mockReset()
  getMock.mockReset()
  removeMock.mockReset()

  vi.stubGlobal('chrome', {
    storage: {
      local: {
        set: setMock,
        get: getMock,
        remove: removeMock,
      },
    },
  })
})

function createTestApplication(): PendingApplication {
  return {
    id: 'application-123',
    offer: {
      title: 'Développeur Java',
      company: 'Entreprise Test',
      location: 'Paris',
      employmentType: 'CDI',
      description: 'Une offre utilisée pour les tests.',
      url: 'https://example.com/jobs/java',
    },
    startedAt: 1_784_148_400_000,
    status: 'STARTED',
  }
}

describe('pending application storage', () => {
  it('enregistre une candidature temporaire', async () => {
    const application = createTestApplication()

    await savePendingApplication(application)

    expect(setMock).toHaveBeenCalledWith({
      pendingApplication: application,
    })
  })

  it('récupère une candidature temporaire', async () => {
    const application = createTestApplication()

    getMock.mockResolvedValue({
      pendingApplication: application,
    })

    const result = await getPendingApplication()

    expect(getMock).toHaveBeenCalledWith('pendingApplication')
    expect(result).toEqual(application)
  })

  it('retourne null si aucune candidature existe', async () => {
    getMock.mockResolvedValue({})

    const result = await getPendingApplication()

    expect(result).toBeNull()
  })

  it('supprime la candidature temporaire', async () => {
    await clearPendingApplication()

    expect(removeMock).toHaveBeenCalledWith(
      'pendingApplication',
    )
  })
})