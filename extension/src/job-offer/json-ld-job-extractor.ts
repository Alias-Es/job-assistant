import type { ExtractedJobOffer } from './job-offer'

interface JsonLdOrganization {
  name?: unknown
}

interface JsonLdPostalAddress {
  addressLocality?: unknown
  addressRegion?: unknown
  addressCountry?: unknown
}

interface JsonLdPlace {
  address?: unknown
}

interface JsonLdJobPosting {
  '@type'?: unknown
  title?: unknown
  description?: unknown
  employmentType?: unknown
  hiringOrganization?: unknown
  jobLocation?: unknown
  url?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function isJobPosting(value: unknown): value is JsonLdJobPosting {
  if (!isRecord(value)) {
    return false
  }

  const type = value['@type']

  if (type === 'JobPosting') {
    return true
  }

  return Array.isArray(type) && type.includes('JobPosting')
}

function extractCompany(value: unknown): string | null {
  if (!isRecord(value)) {
    return null
  }

  const organization = value as JsonLdOrganization

  return readString(organization.name)
}

function extractAddress(value: unknown): string | null {
  if (!isRecord(value)) {
    return null
  }

  const place = value as JsonLdPlace

  if (!isRecord(place.address)) {
    return null
  }

  const address = place.address as JsonLdPostalAddress

  const parts = [
    readString(address.addressLocality),
    readString(address.addressRegion),
    readString(address.addressCountry),
  ].filter((part): part is string => part !== null)

  return parts.length > 0 ? parts.join(', ') : null
}

function extractLocation(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const location of value) {
      const extractedLocation = extractAddress(location)

      if (extractedLocation !== null) {
        return extractedLocation
      }
    }

    return null
  }

  return extractAddress(value)
}

function findJobPosting(value: unknown): JsonLdJobPosting | null {
  if (isJobPosting(value)) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const jobPosting = findJobPosting(item)

      if (jobPosting !== null) {
        return jobPosting
      }
    }

    return null
  }

  if (!isRecord(value)) {
    return null
  }

  const graph = value['@graph']

  if (graph !== undefined) {
    return findJobPosting(graph)
  }

  return null
}

export function extractJobOfferFromJsonLd(
  jsonLdContent: string,
  currentPageUrl: string,
): ExtractedJobOffer | null {
  let parsedContent: unknown

  try {
    parsedContent = JSON.parse(jsonLdContent)
  } catch {
    return null
  }

  const jobPosting = findJobPosting(parsedContent)

  if (jobPosting === null) {
    return null
  }

  const title = readString(jobPosting.title)

  if (title === null) {
    return null
  }

  return {
    title,
    company: extractCompany(jobPosting.hiringOrganization),
    location: extractLocation(jobPosting.jobLocation),
    employmentType: readString(jobPosting.employmentType),
    description: readString(jobPosting.description),
    url: readString(jobPosting.url) ?? currentPageUrl,
  }
}