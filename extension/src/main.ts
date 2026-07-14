import './style.css'

import type {
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

  const offerHeading = document.createElement('h2')
  offerHeading.textContent = 'Offre détectée'

  informationContainer.append(
    offerHeading,
    createInformationRow(
      'Poste',
      response.jobOffer.title,
    ),
    createInformationRow(
      'Entreprise',
      response.jobOffer.company ?? 'Non renseignée',
    ),
    createInformationRow(
      'Localisation',
      response.jobOffer.location ?? 'Non renseignée',
    ),
    createInformationRow(
      'Type de contrat',
      response.jobOffer.employmentType ?? 'Non renseigné',
    ),
  )

  section.append(heading, informationContainer)
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

    displayPageInformation(response)
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