import './style.css'
import { createPageInformation } from './page/page-information'

function getRequiredElement<TElement extends HTMLElement>(
  selector: string,
): TElement {
  const element = document.querySelector<TElement>(selector)

  if (element === null) {
    throw new Error(`L'élément ${selector} est introuvable dans index.html`)
  }

  return element
}

const appElement = getRequiredElement<HTMLElement>('#app')

function displayLoadingState(): void {
  appElement.replaceChildren()

  const section = document.createElement('section')
  section.className = 'popup'

  const heading = document.createElement('h1')
  heading.textContent = 'Job Assistant'

  const status = document.createElement('p')
  status.className = 'status'
  status.textContent = 'Lecture de la page en cours...'

  section.append(heading, status)
  appElement.append(section)
}

function displayPageInformation(title: string, url: string): void {
  appElement.replaceChildren()

  const section = document.createElement('section')
  section.className = 'popup'

  const heading = document.createElement('h1')
  heading.textContent = 'Job Assistant'

  const informationContainer = document.createElement('div')
  informationContainer.className = 'page-information'

  const titleLabel = document.createElement('p')
  titleLabel.className = 'label'
  titleLabel.textContent = 'Titre de la page'

  const titleValue = document.createElement('p')
  titleValue.className = 'value'
  titleValue.textContent = title

  const urlLabel = document.createElement('p')
  urlLabel.className = 'label'
  urlLabel.textContent = 'URL'

  const urlValue = document.createElement('p')
  urlValue.className = 'value url'
  urlValue.textContent = url

  informationContainer.append(
    titleLabel,
    titleValue,
    urlLabel,
    urlValue,
  )

  section.append(heading, informationContainer)
  appElement.append(section)
}

function displayError(message: string): void {
  appElement.replaceChildren()

  const section = document.createElement('section')
  section.className = 'popup'

  const heading = document.createElement('h1')
  heading.textContent = 'Job Assistant'

  const errorMessage = document.createElement('p')
  errorMessage.className = 'error'
  errorMessage.textContent = message

  section.append(heading, errorMessage)
  appElement.append(section)
}

async function loadActiveTab(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    const activeTab = tabs[0]

    if (activeTab === undefined) {
      displayError("Aucun onglet actif n'a été trouvé.")
      return
    }

    const pageInformation = createPageInformation(activeTab)

displayPageInformation(
  pageInformation.title,
  pageInformation.url,
)
  } catch (error: unknown) {
    console.error("Impossible de lire l'onglet actif :", error)

    displayError(
      'Impossible de récupérer les informations de cette page.',
    )
  }
}

displayLoadingState()
void loadActiveTab()