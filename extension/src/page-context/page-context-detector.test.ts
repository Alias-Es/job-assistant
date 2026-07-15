// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import { detectPageContext } from './page-context-detector'

function createDocument(html: string): Document {
  const parser = new DOMParser()

  return parser.parseFromString(html, 'text/html')
}

describe('detectPageContext', () => {
  it('détecte une page avec une offre uniquement', () => {
    const document = createDocument(`
      <!doctype html>
      <html>
        <body>
          <h1>Développeur Java</h1>

          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "JobPosting",
              "title": "Développeur Java"
            }
          </script>
        </body>
      </html>
    `)

    const result = detectPageContext(document)

    expect(result).toBe('OFFER_PAGE')
  })

  it('détecte une page avec un formulaire de candidature', () => {
    const document = createDocument(`
      <!doctype html>
      <html>
        <body>
          <h1>Apply for this job</h1>

          <form>
            <label for="resume">Resume</label>
            <input
              id="resume"
              name="candidate_resume"
              type="file"
              accept=".pdf"
            />

            <label for="linkedin">LinkedIn</label>
            <input
              id="linkedin"
              name="linkedin_url"
              type="url"
            />
          </form>
        </body>
      </html>
    `)

    const result = detectPageContext(document)

    expect(result).toBe('APPLICATION_FORM_PAGE')
  })

  it('détecte une page avec une offre et un formulaire', () => {
    const document = createDocument(`
      <!doctype html>
      <html>
        <body>
          <h1>Candidature Développeur TypeScript</h1>

          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "JobPosting",
              "title": "Développeur TypeScript"
            }
          </script>

          <form>
            <label for="resume">CV</label>
            <input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf"
            />
          </form>
        </body>
      </html>
    `)

    const result = detectPageContext(document)

    expect(result).toBe('OFFER_AND_APPLICATION_FORM')
  })

  it('ignore une page ordinaire', () => {
    const document = createDocument(`
      <!doctype html>
      <html>
        <body>
          <h1>Inscription à la newsletter</h1>

          <form>
            <label for="newsletter-email">E-mail</label>
            <input
              id="newsletter-email"
              name="newsletter_email"
              type="email"
            />
          </form>
        </body>
      </html>
    `)

    const result = detectPageContext(document)

    expect(result).toBe('UNSUPPORTED_PAGE')
  })
})