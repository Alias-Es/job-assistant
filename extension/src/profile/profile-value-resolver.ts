import type { CandidateFieldType } from '../form-detection/field-mapper'
import type { CandidateProfile } from './candidate-profile'

export function resolveCandidateValue(
  profile: CandidateProfile,
  field: CandidateFieldType,
): string | null {
  switch (field) {
    case 'FIRST_NAME':
      return profile.firstName

    case 'LAST_NAME':
      return profile.lastName

    case 'EMAIL':
      return profile.email
    
      case 'CITY':
       return profile.city

    case 'PHONE':
      return profile.phone

    case 'LINKEDIN':
      return profile.linkedin
 
    

    case 'PORTFOLIO':
      return profile.portfolio

    default:
      return null
  }
}