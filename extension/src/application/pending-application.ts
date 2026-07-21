import type { ExtractedJobOffer } from '../job-offer/job-offer'

export type PendingApplicationStatus =
  | 'STARTED'
  | 'WAITING_FOR_AUTH'
  | 'FORM_READY'

export interface PendingApplication {
  id: string
  offer: ExtractedJobOffer
  startedAt: number
  status: PendingApplicationStatus
}

export function createPendingApplication(
  offer: ExtractedJobOffer,
): PendingApplication {
  return {
    id: crypto.randomUUID(),
    offer,
    startedAt: Date.now(),
    status: 'STARTED',
  }
}
