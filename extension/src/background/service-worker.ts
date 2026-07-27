interface CreateApplicationMessage {
    type: 'CREATE_SUBMITTED_APPLICATION'
    payload: {
      title: string
      company: string
      offerUrl: string
      appliedAt: string
    }
  }
  
  chrome.runtime.onMessage.addListener(
    (
      message: CreateApplicationMessage,
      _sender,
      sendResponse,
    ) => {
      if (message.type !== 'CREATE_SUBMITTED_APPLICATION') {
        return
      }
  
      fetch('http://localhost:8080/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message.payload,
          status: 'APPLIED',
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(
              `Backend response: ${response.status}`,
            )
          }
  
          return response.json()
        })
        .then((application) => {
          sendResponse({
            success: true,
            application,
          })
        })
        .catch((error: unknown) => {
          console.error(
            '[Job Assistant] Backend error:',
            error,
          )
  
          sendResponse({
            success: false,
          })
        })
  
      return true
    },
  )