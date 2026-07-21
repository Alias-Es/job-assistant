import type { SubmittedApplication } from './submitted-application'

const STORAGE_KEY = 'lastSubmittedApplication'

export async function saveSubmittedApplication(
  application: SubmittedApplication,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: application,
  })
}

export async function getSubmittedApplication(): Promise<
  SubmittedApplication | null
> {
  const storedData = await chrome.storage.local.get(STORAGE_KEY)

  const application = storedData[STORAGE_KEY] as
    | SubmittedApplication
    | undefined

  return application ?? null
}

export async function clearSubmittedApplication(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY)
}