import { extractJobOfferFromJsonLd } from '../job-offer/json-ld-job-extractor'

import type {
  PageInformationRequest,
  PageInformationResponse,
} from '../shared/messages'

function isPageInformationRequest(
  message: unknown,
): message is PageInformationRequest {
  if (typeof message !== 'object' || message === null) {
    return false
  }

  return (
    'type' in message &&
    message.type === 'GET_PAGE_INFORMATION'
  )
}

function extractJobOfferFromPage() {
  const jsonLdElements =
    document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    )

  for (const jsonLdElement of jsonLdElements) {
    const jsonLdContent = jsonLdElement.textContent

    if (jsonLdContent === null) {
      continue
    }

    const jobOffer = extractJobOfferFromJsonLd(
      jsonLdContent,
      window.location.href,
    )

    if (jobOffer !== null) {
      return jobOffer
    }
  }

  return null
}

chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (
      response: PageInformationResponse,
    ) => void,
  ) => {
    if (!isPageInformationRequest(message)) {
      return
    }

    sendResponse({
      title: document.title,
      url: window.location.href,
      jobOffer: extractJobOfferFromPage(),
    })
  },
)