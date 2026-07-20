import { findBestApplicationAction } from '../application/application-action-detector'
import { autofillForm } from '../form-autofill/form-autofill'
import { extractJobOfferFromJsonLd } from '../job-offer/json-ld-job-extractor'
import { inspectFormFields } from '../form-detection/field-inspector'
import { mapField } from '../form-detection/field-mapper'
import type { PendingApplication } from '../application/pending-application'
import type { CandidateProfile } from '../profile/candidate-profile'
import type {
  AutofillFormResponse,
  ExtensionRequest,
  OpenApplicationActionResponse,
  PageInformationResponse,
} from '../shared/messages'

const PENDING_APPLICATION_STORAGE_KEY = 'pendingApplication'

/*
 * Profil temporaire pour nos tests.
 * Plus tard, il viendra du backend Spring Boot.
 */
const TEST_PROFILE: CandidateProfile = {
  firstName: 'Ali',
  lastName: 'Essaadaoui',
  email: 'aliessaadaoui10@gmail.com',
  phone: '0752022417',
  city: 'La Rochelle',
  linkedin: 'https://www.linkedin.com/in/TON-IDENTIFIANT',
  github: null,
  portfolio: null,
  cvFileName: null,
}

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

function autofillCurrentForm(): AutofillFormResponse {
  return autofillForm(document, TEST_PROFILE)
}

async function getPendingApplication(): Promise<
  PendingApplication | null
> {
  const storedData = await chrome.storage.local.get(
    PENDING_APPLICATION_STORAGE_KEY,
  )

  const application =
    storedData[PENDING_APPLICATION_STORAGE_KEY] as
      | PendingApplication
      | undefined

  return application ?? null
}



function countRecognizedCandidateFields(): number {
  const fields = inspectFormFields(document)

  return fields.filter((field) => {
    const mapping = mapField(field)

    return mapping.fieldType !== 'UNKNOWN'
  }).length
}

async function tryAutomaticAutofill(): Promise<number> {
  const pendingApplication = await getPendingApplication()

  if (pendingApplication === null) {
    return 0
  }

  /*
   * On ne remplit pas la page d’offre elle-même.
   */
  if (
    window.location.href === pendingApplication.offer.url
  ) {
    return 0
  }

  /*
   * Deux champs candidat reconnus suffisent pour considérer
   * qu’on est probablement sur une page de candidature.
   *
   * Exemple : email + téléphone, ou prénom + nom.
   */
  const recognizedFieldCount =
    countRecognizedCandidateFields()

  if (recognizedFieldCount < 2) {
    return 0
  }

  const result = autofillCurrentForm()

  return result.filledCount
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

async function initializeAutomaticAutofill(): Promise<void> {
  /*
   * Les ATS modernes chargent souvent le formulaire
   * progressivement après le chargement de la page.
   */
  const maximumAttempts = 20
  const delayBetweenAttempts = 500

  let totalFilledCount = 0
  let attemptsWithoutProgress = 0

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      const filledCount =
        await tryAutomaticAutofill()

      if (filledCount > 0) {
        totalFilledCount += filledCount
        attemptsWithoutProgress = 0

        console.log(
          `[Job Assistant] ${filledCount} nouveau(x) champ(s) rempli(s).`,
        )
      } else {
        attemptsWithoutProgress += 1
      }

      /*
       * Une fois des champs remplis, on laisse encore
       * trois tentatives pour détecter d’éventuels champs
       * chargés un peu plus tard.
       */
      if (
        totalFilledCount > 0 &&
        attemptsWithoutProgress >= 3
      ) {
        console.log(
          `[Job Assistant] Remplissage automatique terminé : ${totalFilledCount} champ(s).`,
        )

        return
      }
    } catch (error: unknown) {
      console.error(
        '[Job Assistant] Erreur pendant le remplissage automatique :',
        error,
      )
    }

    if (attempt < maximumAttempts) {
      await wait(delayBetweenAttempts)
    }
  }
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
      return
    }

    if (request.type === 'AUTOFILL_FORM') {
      sendResponse(autofillCurrentForm())
    }
  },
)

/*
 * Cette ligne s’exécute automatiquement à chaque nouvelle page.
 */
void initializeAutomaticAutofill()