import type { PendingApplication } from './pending-application'

const STORAGE_KEY = 'pendingApplication'

export async function savePendingApplication(
  application: PendingApplication,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: application,
  })
}

export async function getPendingApplication(): Promise<
  PendingApplication | null
> {
  const storedData = await chrome.storage.local.get(STORAGE_KEY)

  const application = storedData[STORAGE_KEY] as
    | PendingApplication
    | undefined

  return application ?? null
}

export async function clearPendingApplication(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY)
}