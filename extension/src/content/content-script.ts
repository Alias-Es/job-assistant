interface PageInformationRequest {
    type: 'GET_PAGE_INFORMATION'
  }
  
  interface PageInformationResponse {
    title: string
    url: string
  }
  
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
  
  chrome.runtime.onMessage.addListener(
    (
      message: unknown,
      _sender,
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
      })
    },
  )