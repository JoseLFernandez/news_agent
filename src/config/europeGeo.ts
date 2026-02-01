// ISO 3166-1 numeric to alpha-2 code mapping for European countries
// Used for mapping GeoJSON country IDs to our country codes

export const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '008': 'AL', // Albania
  '020': 'AD', // Andorra
  '040': 'AT', // Austria
  '112': 'BY', // Belarus
  '056': 'BE', // Belgium
  '070': 'BA', // Bosnia and Herzegovina
  '100': 'BG', // Bulgaria
  '191': 'HR', // Croatia
  '196': 'CY', // Cyprus
  '203': 'CZ', // Czech Republic
  '208': 'DK', // Denmark
  '233': 'EE', // Estonia
  '246': 'FI', // Finland
  '250': 'FR', // France
  '276': 'DE', // Germany
  '300': 'GR', // Greece
  '348': 'HU', // Hungary
  '352': 'IS', // Iceland
  '372': 'IE', // Ireland
  '380': 'IT', // Italy
  '-99': 'XK', // Kosovo (no official ISO numeric)
  '428': 'LV', // Latvia
  '438': 'LI', // Liechtenstein
  '440': 'LT', // Lithuania
  '442': 'LU', // Luxembourg
  '807': 'MK', // North Macedonia
  '470': 'MT', // Malta
  '498': 'MD', // Moldova
  '492': 'MC', // Monaco
  '499': 'ME', // Montenegro
  '528': 'NL', // Netherlands
  '578': 'NO', // Norway
  '616': 'PL', // Poland
  '620': 'PT', // Portugal
  '642': 'RO', // Romania
  '643': 'RU', // Russia (partial in Europe)
  '674': 'SM', // San Marino
  '688': 'RS', // Serbia
  '703': 'SK', // Slovakia
  '705': 'SI', // Slovenia
  '724': 'ES', // Spain
  '752': 'SE', // Sweden
  '756': 'CH', // Switzerland
  '804': 'UA', // Ukraine
  '826': 'GB', // United Kingdom
  '336': 'VA', // Vatican City
}

// Reverse mapping: alpha-2 to numeric
export const ALPHA2_TO_ISO_NUMERIC: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_NUMERIC_TO_ALPHA2).map(([num, alpha]) => [alpha, num])
)

// European country codes for filtering world map
export const EUROPE_COUNTRY_CODES = [
  'AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ',
  'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT',
  'XK', 'LV', 'LI', 'LT', 'LU', 'MK', 'MT', 'MD', 'MC', 'ME',
  'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SK', 'SI', 'ES', 'SE',
  'CH', 'UA', 'GB',
]

// Map center and zoom for Europe view
export const EUROPE_MAP_CONFIG = {
  center: [15, 54] as [number, number], // Longitude, Latitude
  scale: 700,
  rotate: [-10, 0, 0] as [number, number, number],
}

// Check if a country code is European
export function isEuropeanCountry(code: string): boolean {
  return EUROPE_COUNTRY_CODES.includes(code.toUpperCase())
}

// Get alpha-2 code from ISO numeric (as used in TopoJSON)
export function numericToAlpha2(numericCode: string): string | undefined {
  return ISO_NUMERIC_TO_ALPHA2[numericCode]
}
