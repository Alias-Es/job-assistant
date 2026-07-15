// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'

import {
  inspectField,
  inspectFormFields,
} from './field-inspector'

function createDocument(html: string): Document {
  const parser = new DOMParser()

  return parser.parseFromString(html, 'text/html')
}

describe('inspectField', () => {
  it('inspecte un champ e-mail', () => {
    const document = createDocument(`
      <form>
        <label for="email">Adresse e-mail</label>

        <input
          id="email"
          name="candidate_email"
          type="email"
          autocomplete="email"
          placeholder="nom@exemple.fr"
          aria-label="E-mail du candidat"
        />
      </form>
    `)

    const field =
      document.querySelector<HTMLInputElement>('#email')

    if (field === null) {
      throw new Error('Le champ e-mail est introuvable dans le test')
    }

    const result = inspectField(field)

    expect(result).toMatchObject({
      tagName: 'input',
      type: 'email',
      label: 'Adresse e-mail',
      name: 'candidate_email',
      id: 'email',
      placeholder: 'nom@exemple.fr',
      autocomplete: 'email',
      ariaLabel: 'E-mail du candidat',
    })
  })

  it('inspecte une question ouverte dans un textarea', () => {
    const document = createDocument(`
      <form>
        <label for="motivation">
          Pourquoi souhaitez-vous nous rejoindre ?
        </label>

        <textarea
          id="motivation"
          name="motivation"
          placeholder="Expliquez votre motivation"
        ></textarea>
      </form>
    `)

    const field =
      document.querySelector<HTMLTextAreaElement>('#motivation')

    if (field === null) {
      throw new Error(
        'Le champ de motivation est introuvable dans le test',
      )
    }

    const result = inspectField(field)

    expect(result).toMatchObject({
      tagName: 'textarea',
      type: 'textarea',
      label: 'Pourquoi souhaitez-vous nous rejoindre ?',
      name: 'motivation',
      id: 'motivation',
      placeholder: 'Expliquez votre motivation',
    })
  })

  it('inspecte une liste déroulante', () => {
    const document = createDocument(`
      <form>
        <label for="work-authorization">
          Autorisation de travail
        </label>

        <select
          id="work-authorization"
          name="work_authorization"
          aria-label="Droit de travailler en France"
        >
          <option value="">Sélectionner</option>
          <option value="yes">Oui</option>
          <option value="no">Non</option>
        </select>
      </form>
    `)

    const field =
      document.querySelector<HTMLSelectElement>(
        '#work-authorization',
      )

    if (field === null) {
      throw new Error(
        'Le champ d’autorisation est introuvable dans le test',
      )
    }

    const result = inspectField(field)

    expect(result).toMatchObject({
      tagName: 'select',
      type: 'select',
      label: 'Autorisation de travail',
      name: 'work_authorization',
      id: 'work-authorization',
      placeholder: '',
      ariaLabel: 'Droit de travailler en France',
    })
  })
})

describe('inspectFormFields', () => {
  it('retourne seulement les champs présents dans un formulaire', () => {
    const document = createDocument(`
      <input id="outside-form" type="text" />

      <form>
        <input id="first-name" name="first_name" type="text" />
        <textarea id="message" name="message"></textarea>
        <select id="country" name="country"></select>
      </form>
    `)

    const result = inspectFormFields(document)

    expect(result).toHaveLength(3)

    expect(result.map((field) => field.id)).toEqual([
      'first-name',
      'message',
      'country',
    ])
  })
})