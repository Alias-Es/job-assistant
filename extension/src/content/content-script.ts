import { findBestApplicationAction } from '../application/application-action-detector'
import { autofillForm } from '../form-autofill/form-autofill'
import { extractJobOfferFromJsonLd } from '../job-offer/json-ld-job-extractor'
import { inspectFormFields } from '../form-detection/field-inspector'
import { mapField } from '../form-detection/field-mapper'
import { createSubmittedApplication } from '../application/submitted-application'
import { saveSubmittedApplication } from '../application/submitted-application-storage'

import type { CandidateProfile } from '../profile/candidate-profile'
import type {
  AutofillFormResponse,
  ExtensionRequest,
  OpenApplicationActionResponse,
  PageInformationResponse,
} from '../shared/messages'
import { detectApplicationSubmission } from '../application/application-submission-detector'
import {
  clearPendingApplication,
  getPendingApplication,
} from '../application/pending-application-storage'



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
interface CreateSubmittedApplicationResponse {
  success: boolean
}
async function detectSubmittedApplication(): Promise<boolean> {
  const pendingApplication =
    await getPendingApplication()

  if (pendingApplication === null) {
    return false
  }

  const submissionResult =
    detectApplicationSubmission(document)

  if (!submissionResult.detected) {
    return false
  }

  const submittedApplication =
    createSubmittedApplication(pendingApplication)

  /*
   * On conserve d'abord la candidature localement.
   * Ainsi, elle n'est pas perdue si le backend est arrêté.
   */
  await saveSubmittedApplication(submittedApplication)
  await clearPendingApplication()

  /*
   * L'entreprise peut parfois ne pas être extraite.
   * On n'invente pas de valeur dans ce cas.
   */
  if (pendingApplication.offer.company === null) {
    console.warn(
      '[Job Assistant] Candidature conservée localement : entreprise absente.',
    )

    return true
  }

  try {
    const backendResponse = (
      await chrome.runtime.sendMessage({
        type: 'CREATE_SUBMITTED_APPLICATION',
        payload: {
          title: pendingApplication.offer.title,
          company: pendingApplication.offer.company,
          offerUrl: pendingApplication.offer.url,
          appliedAt: new Date(
            submittedApplication.submittedAt,
          ).toISOString(),
        },
      })
    ) as CreateSubmittedApplicationResponse

    if (backendResponse.success) {
      console.log(
        '[Job Assistant] Candidature enregistrée dans le backend.',
      )
    } else {
      console.warn(
        '[Job Assistant] Le backend n’a pas enregistré la candidature.',
      )
    }
  } catch (error: unknown) {
    console.error(
      '[Job Assistant] Impossible de contacter le backend :',
      error,
    )
  }

  console.log(
    '[Job Assistant] Candidature envoyée détectée :',
    submissionResult.matchedText,
  )

  return true
}
async function initializeSubmissionDetection(): Promise<void> {
  const pendingApplication =
    await getPendingApplication()

  // On ne surveille rien sans candidature active.
  if (pendingApplication === null) {
    return
  }

  let checkTimer: number | null = null
  let detectionFinished = false

  async function checkPage(): Promise<void> {
    if (detectionFinished) {
      return
    }

    const detected =
      await detectSubmittedApplication()

    if (detected) {
      detectionFinished = true
      observer.disconnect()

      if (checkTimer !== null) {
        window.clearTimeout(checkTimer)
      }
    }
  }

  const observer = new MutationObserver(() => {
    if (detectionFinished) {
      return
    }

    /*
     * Une page dynamique peut faire plusieurs changements
     * successifs. On attend un peu avant de l’analyser.
     */
    if (checkTimer !== null) {
      window.clearTimeout(checkTimer)
    }

    checkTimer = window.setTimeout(() => {
      void checkPage()
    }, 300)
  })

  /*
   * Premier contrôle immédiat si la confirmation
   * est déjà visible au chargement.
   */
  await checkPage()

  if (detectionFinished) {
    return
  }

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  /*
   * On arrête automatiquement en quittant la page.
   */
  window.addEventListener(
    'pagehide',
    () => observer.disconnect(),
    { once: true },
  )
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
/*
 * À chaque nouvelle page :
 * 1. on vérifie si une confirmation d’envoi est affichée ;
 * 2. puis on tente le remplissage automatique.
 */
void initializeSubmissionDetection()
void initializeAutomaticAutofill()