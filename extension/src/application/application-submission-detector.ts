export interface SubmissionDetectionResult {
    detected: boolean
    matchedText: string | null
  }
  
  const SUCCESS_PATTERNS = [
    'merci pour votre candidature',
    'merci d avoir postule',
    'votre candidature a bien ete envoyee',
    'votre candidature a ete envoyee',
    'votre candidature a bien ete transmise',
    'nous avons bien recu votre candidature',
    'candidature envoyee avec succes',
    'candidature envoyee',
    'application successfully submitted',
    'application submitted successfully',
    'your application has been submitted',
    'thank you for applying',
    'thanks for applying',
    'we have received your application',
    'your application has been received',
  ]
  
  const NEGATIVE_PATTERNS = [
    'envoyer votre candidature',
    'envoyer ma candidature',
    'soumettre votre candidature',
    'finaliser votre candidature',
    'verifier votre candidature',
    'complete your application',
    'review your application',
    'submit your application',
    'application form',
  ]
  
  function normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[’']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  function containsNegativePattern(pageText: string): boolean {
    return NEGATIVE_PATTERNS.some((pattern) =>
      pageText.includes(pattern),
    )
  }
  
  export function detectApplicationSubmission(
    document: Document,
  ): SubmissionDetectionResult {
    const pageText = normalizeText(
      [
        document.title,
        document.querySelector('h1')?.textContent ?? '',
        document.querySelector('h2')?.textContent ?? '',
        document.querySelector('[role="alert"]')?.textContent ?? '',
        document.querySelector('[role="status"]')?.textContent ?? '',
        document.body.textContent ?? '',
      ].join(' '),
    )
  
    if (containsNegativePattern(pageText)) {
      return {
        detected: false,
        matchedText: null,
      }
    }
  
    for (const pattern of SUCCESS_PATTERNS) {
      if (pageText.includes(pattern)) {
        return {
          detected: true,
          matchedText: pattern,
        }
      }
    }
  
    return {
      detected: false,
      matchedText: null,
    }
  }