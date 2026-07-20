import type { ExtractedJobOffer } from '../job-offer/job-offer'

import {
  createPendingApplication,
  type PendingApplication,
} from './pending-application'
import {
  getPendingApplication,
  savePendingApplication,
} from './pending-application-storage'

export interface StartApplicationResult {
  pendingApplication: PendingApplication
  alreadyRunning: boolean
}

export async function startApplication(
  offer: ExtractedJobOffer,
): Promise<StartApplicationResult> {
  const existingApplication = await getPendingApplication()

  if (existingApplication !== null) {
    return {
      pendingApplication: existingApplication,
      alreadyRunning: true,
    }
  }

  const pendingApplication =
    createPendingApplication(offer)

  await savePendingApplication(pendingApplication)

  return {
    pendingApplication,
    alreadyRunning: false,
  }
}