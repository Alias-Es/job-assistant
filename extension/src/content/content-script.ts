import { findBestApplicationAction } from '../application/application-action-detector'
import { extractJobOfferFromJsonLd } from '../job-offer/json-ld-job-extractor'

import type {
  ExtensionRequest,
  OpenApplicationActionResponse,
  PageInformationResponse,
} from '../shared/messages'

function extractJobOfferFromPage(): PageInformationResponse['jobOffer'] {
  const jsonLdElements =
    document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    )

  for (const jsonLdElement of jsonLdElements) {
    const jsonLdContent = jsonLdElement.textContent

    if (jsonLdContent === null) {
      continue
    }

    const offer = extractJobOfferFromJsonLd(
      jsonLdContent,
      window.location.href,
    )

    if (offer !== null) {
      return offer
    }
  }

  return null
}

function getPageInformation(): PageInformationResponse {
  return {
    title: document.title,
    url: window.location.href,
    jobOffer: extractJobOfferFromPage(),
  }
}

function openApplicationAction(): OpenApplicationActionResponse {
  const action = findBestApplicationAction(document)

  if (action === null) {
    return {
      status: 'NOT_FOUND',
      actionText: null,
    }
  }

  const response: OpenApplicationActionResponse = {
    status: 'OPENED',
    actionText: action.text || 'Bouton de candidature',
  }

  window.setTimeout(() => {
    if (action.url !== null) {
      window.location.assign(action.url)
      return
    }

    action.element.click()
  }, 100)

  return response
}

chrome.runtime.onMessage.addListener(
  (
    request: ExtensionRequest,
    _sender,
    sendResponse,
  ) => {
    if (request.type === 'GET_PAGE_INFORMATION') {
      sendResponse(getPageInformation())
      return
    }

    if (request.type === 'OPEN_APPLICATION_ACTION') {
      sendResponse(openApplicationAction())
    }
  },
)