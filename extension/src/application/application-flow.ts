import type { ExtractedJobOffer } from '../job-offer/job-offer'

import {
  createPendingApplication,
  type PendingApplication,
} from './pending-application'
import {
  clearPendingApplication,
  getPendingApplication,
  savePendingApplication,
} from './pending-application-storage'

export interface StartApplicationResult {
  pendingApplication: PendingApplication
  alreadyRunning: boolean
  sameOffer: boolean
}

function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)

    parsedUrl.hash = ''

    return parsedUrl.href.replace(/\/$/, '')
  } catch {
    return url.replace(/\/$/, '')
  }
}

function isSameOffer(
  existingApplication: PendingApplication,
  currentOffer: ExtractedJobOffer,
): boolean {
  return (
    normalizeUrl(existingApplication.offer.url) ===
    normalizeUrl(currentOffer.url)
  )
}

export async function startApplication(
  offer: ExtractedJobOffer,
): Promise<StartApplicationResult> {
  const existingApplication = await getPendingApplication()

  if (existingApplication !== null) {
    return {
      pendingApplication: existingApplication,
      alreadyRunning: true,
      sameOffer: isSameOffer(existingApplication, offer),
    }
  }

  const pendingApplication = createPendingApplication(offer)

  await savePendingApplication(pendingApplication)

  return {
    pendingApplication,
    alreadyRunning: false,
    sameOffer: false,
  }
}

export async function replacePendingApplication(
  offer: ExtractedJobOffer,
): Promise<PendingApplication> {
  await clearPendingApplication()

  const pendingApplication = createPendingApplication(offer)

  await savePendingApplication(pendingApplication)

  return pendingApplication
}

export async function getResumeUrl(): Promise<string | null> {
  const pendingApplication = await getPendingApplication()

  return pendingApplication?.offer.url ?? null
}

export async function abandonPendingApplication(): Promise<void> {
  await clearPendingApplication()
}