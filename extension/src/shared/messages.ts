import type { ExtractedJobOffer } from '../job-offer/job-offer'

export interface PageInformationRequest {
  type: 'GET_PAGE_INFORMATION'
}

export interface PageInformationResponse {
  title: string
  url: string
  jobOffer: ExtractedJobOffer | null
}

export interface OpenApplicationActionRequest {
  type: 'OPEN_APPLICATION_ACTION'
}

export type OpenApplicationActionStatus =
  | 'OPENED'
  | 'NOT_FOUND'

export interface OpenApplicationActionResponse {
  status: OpenApplicationActionStatus
  actionText: string | null
}

export type ExtensionRequest =
  | PageInformationRequest
  | OpenApplicationActionRequest