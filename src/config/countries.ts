export interface Country {
  code: string
  name: string
  flag: string
  region: 'americas' | 'europe' | 'asia' | 'africa' | 'oceania'
}

export const COUNTRIES: Country[] = [
  // Americas
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'americas' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'americas' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'americas' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'americas' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'americas' },

  // Europe - Western
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'europe' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'europe' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'europe' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'europe' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'europe' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'europe' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'europe' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', region: 'europe' },
  // Europe - Nordic
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'europe' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'europe' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'europe' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', region: 'europe' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', region: 'europe' },
  // Europe - Central & Eastern
  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'europe' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', region: 'europe' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', region: 'europe' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', region: 'europe' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', region: 'europe' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', region: 'europe' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', region: 'europe' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', region: 'europe' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', region: 'europe' },
  // Europe - Baltic
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', region: 'europe' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', region: 'europe' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', region: 'europe' },
  // Europe - Southern & Balkans
  { code: 'GR', name: 'Greece', flag: '🇬🇷', region: 'europe' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', region: 'europe' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', region: 'europe' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', region: 'europe' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'europe' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', region: 'europe' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', region: 'europe' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', region: 'europe' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', region: 'europe' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', region: 'europe' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', region: 'europe' },

  // Asia
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'asia' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'asia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'asia' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'asia' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'asia' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'asia' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'asia' },

  // Africa
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'africa' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'africa' },

  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'oceania' },
]

export const COUNTRY_MAP = new Map(COUNTRIES.map((c) => [c.code, c]))

export function getCountry(code: string): Country | undefined {
  return COUNTRY_MAP.get(code)
}

export function getCountriesByRegion(region: Country['region']): Country[] {
  return COUNTRIES.filter((c) => c.region === region)
}

// Featured countries for quick access
export const FEATURED_COUNTRIES = ['US', 'GB', 'DE', 'FR', 'JP', 'KR', 'CN', 'IN', 'BR', 'AU']

// Regulatory-focused countries (for the Regulatory Radar)
export const REGULATORY_COUNTRIES = [
  'US', 'GB', 'EU', 'DE', 'FR', 'CN', 'JP', 'KR', 'IN', 'AU', 'CA', 'BR', 'SG'
]

// Add EU as a special "country" for regulatory purposes
export const EU_ENTITY: Country = {
  code: 'EU',
  name: 'European Union',
  flag: '🇪🇺',
  region: 'europe',
}
