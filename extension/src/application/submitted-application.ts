import type { PendingApplication } from './pending-application'

export interface SubmittedApplication {
  title: string
  company: string | null
  submittedAt: number
}

export function createSubmittedApplication(
  pendingApplication: PendingApplication,
): SubmittedApplication {
  return {
    title: pendingApplication.offer.title,
    company: pendingApplication.offer.company,
    submittedAt: Date.now(),
  }
}