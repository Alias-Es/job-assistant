import './style.css'

const appElement = document.querySelector<HTMLElement>('#app')

if (appElement === null) {
  throw new Error("L'élément #app est introuvable dans index.html")
}

appElement.innerHTML = `
  <section class="popup">
    <h1>Job Assistant</h1>

    <p class="status">
      Job Assistant fonctionne
    </p>
  </section>
`