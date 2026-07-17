import './style.css'

import {
  createPendingApplication,
} from './application/pending-application'
import {
  savePendingApplication,
} from './application/pending-application-storage'
import type {
  OpenApplicationActionRequest,
  OpenApplicationActionResponse,
  PageInformationRequest,
  PageInformationResponse,
} from './shared/messages'

function getRequiredElement<TElement extends HTMLElement>(
  selector: string,
): TElement {
  const element = document.querySelector<TElement>(selector)

  if (element === null) {
    throw new Error(
      `L'élément ${selector} est introuvable dans index.html`,
    )
  }

  return element
}

const appElement = getRequiredElement<HTMLElement>('#app')

function createPopupSection(): {
  section: HTMLElement
  heading: HTMLHeadingElement
} {
  const section = document.createElement('section')
  section.className = 'popup'

  const heading = document.createElement('h1')
  heading.textContent = 'Job Assistant'

  return {
    section,
    heading,
  }
}

function createInformationRow(
  label: string,
  value: string,
): DocumentFragment {
  const fragment = document.createDocumentFragment()

  const labelElement = document.createElement('p')
  labelElement.className = 'label'
  labelElement.textContent = label

  const valueElement = document.createElement('p')
  valueElement.className = 'value'
  valueElement.textContent = value

  fragment.append(labelElement, valueElement)

  return fragment
}

function displayLoadingState(): void {
  appElement.replaceChildren()

  const { section, heading } = createPopupSection()

  const status = document.createElement('p')
  status.className = 'status'
  status.textContent = 'Analyse de la page en cours...'

  section.append(heading, status)
  appElement.append(section)
}

function displayPageInformation(
  response: PageInformationResponse,
  activeTabId: number,
): void {
  appElement.replaceChildren()

  const { section, heading } = createPopupSection()

  const informationContainer = document.createElement('div')
  informationContainer.className = 'page-information'

  informationContainer.append(
    createInformationRow('Titre de la page', response.title),
    createInformationRow('URL', response.url),
  )

  if (response.jobOffer === null) {
    const status = document.createElement('p')
    status.className = 'status'
    status.textContent =
      'Aucune offre JobPosting détectée sur cette page.'

    section.append(heading, informationContainer, status)
    appElement.append(section)
    return
  }

  const offer = response.jobOffer

  const offerHeading = document.createElement('h2')
  offerHeading.textContent = 'Offre détectée'

  informationContainer.append(
    offerHeading,
    createInformationRow('Poste', offer.title),
    createInformationRow(
      'Entreprise',
      offer.company ?? 'Non renseignée',
    ),
    createInformationRow(
      'Localisation',
      offer.location ?? 'Non renseignée',
    ),
    createInformationRow(
      'Type de contrat',
      offer.employmentType ?? 'Non renseigné',
    ),
  )

  const startButton = document.createElement('button')
  startButton.type = 'button'
  startButton.textContent = 'Commencer la candidature'

  const actionStatus = document.createElement('p')
  actionStatus.className = 'status'

  startButton.addEventListener('click', async () => {
    startButton.disabled = true
    startButton.textContent = 'Préparation...'

    try {
      const pendingApplication =
        createPendingApplication(offer)

      await savePendingApplication(pendingApplication)

      const request: OpenApplicationActionRequest = {
        type: 'OPEN_APPLICATION_ACTION',
      }

      const response = await chrome.tabs.sendMessage<
        OpenApplicationActionRequest,
        OpenApplicationActionResponse
      >(activeTabId, request)

      if (response.status === 'NOT_FOUND') {
        startButton.disabled = false
        startButton.textContent = 'Réessayer'

        actionStatus.textContent =
          'Offre mémorisée, mais aucun bouton Postuler fiable n’a été trouvé. Clique manuellement sur le bouton de la page.'
        return
      }

      startButton.textContent = 'Ouverture en cours...'
      actionStatus.textContent =
        `Action trouvée : ${response.actionText ?? 'Postuler'}`
    } catch (error: unknown) {
      console.error(
        'Impossible de démarrer la candidature :',
        error,
      )

      startButton.disabled = false
      startButton.textContent = 'Réessayer'
      actionStatus.textContent =
        "Impossible de démarrer la candidature."
    }
  })

  section.append(
    heading,
    informationContainer,
    startButton,
    actionStatus,
  )

  appElement.append(section)
}

function displayError(message: string): void {
  appElement.replaceChildren()

  const { section, heading } = createPopupSection()

  const errorMessage = document.createElement('p')
  errorMessage.className = 'error'
  errorMessage.textContent = message

  section.append(heading, errorMessage)
  appElement.append(section)
}

async function loadPageInformation(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    const activeTab = tabs[0]

    if (activeTab?.id === undefined) {
      displayError("Aucun onglet actif n'a été trouvé.")
      return
    }

    const request: PageInformationRequest = {
      type: 'GET_PAGE_INFORMATION',
    }

    const response = await chrome.tabs.sendMessage<
      PageInformationRequest,
      PageInformationResponse
    >(activeTab.id, request)

    displayPageInformation(response, activeTab.id)
  } catch (error: unknown) {
    console.error(
      'Impossible de communiquer avec le content script :',
      error,
    )

    displayError(
      'Impossible de lire cette page. Recharge-la puis réessaie.',
    )
  }
}

displayLoadingState()
void loadPageInformation()