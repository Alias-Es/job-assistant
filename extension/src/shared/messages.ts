import type { ExtractedJobOffer } from '../job-offer/job-offer'

export interface PageInformationRequest {
  type: 'GET_PAGE_INFORMATION'
}

export interface PageInformationResponse {
  title: string
  url: string
  jobOffer: ExtractedJobOffer | null
}