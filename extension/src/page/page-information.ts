export interface PageInformation {
    title: string
    url: string
  }
  
  export interface BrowserTabInformation {
    title?: string
    url?: string
  }
  
  export function createPageInformation(
    tab: BrowserTabInformation,
  ): PageInformation {
    return {
      title: tab.title ?? 'Titre indisponible',
      url: tab.url ?? 'URL indisponible',
    }
  }