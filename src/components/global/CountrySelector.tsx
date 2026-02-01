import { useState } from 'react'
import { COUNTRIES, FEATURED_COUNTRIES, getCountry, type Country } from '../../config/countries'
import clsx from 'clsx'

interface CountrySelectorProps {
  selectedCountry: string
  onSelect: (countryCode: string) => void
  showAll?: boolean
}

export default function CountrySelector({
  selectedCountry,
  onSelect,
  showAll = false,
}: CountrySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const featuredCountries = FEATURED_COUNTRIES.map(
    (code) => getCountry(code)!
  ).filter(Boolean)

  const allCountries = showAll || isExpanded ? COUNTRIES : featuredCountries

  // Group by region when showing all
  const groupedCountries = (showAll || isExpanded)
    ? {
        americas: allCountries.filter((c) => c.region === 'americas'),
        europe: allCountries.filter((c) => c.region === 'europe'),
        asia: allCountries.filter((c) => c.region === 'asia'),
        africa: allCountries.filter((c) => c.region === 'africa'),
        oceania: allCountries.filter((c) => c.region === 'oceania'),
      }
    : null

  const renderCountryButton = (country: Country) => (
    <button
      key={country.code}
      onClick={() => onSelect(country.code)}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all',
        selectedCountry === country.code
          ? 'bg-ink-900 text-white shadow-sm'
          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-sm'
      )}
    >
      <span className="text-base">{country.flag}</span>
      <span className="hidden sm:inline">{country.name}</span>
    </button>
  )

  if (groupedCountries) {
    return (
      <div className="space-y-3">
        {Object.entries(groupedCountries).map(([region, countries]) => (
          countries.length > 0 && (
            <div key={region}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {region.charAt(0).toUpperCase() + region.slice(1)}
              </h4>
              <div className="flex flex-wrap gap-2">
                {countries.map(renderCountryButton)}
              </div>
            </div>
          )
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {featuredCountries.map(renderCountryButton)}
        <button
          onClick={() => setIsExpanded(true)}
          className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          + More
        </button>
      </div>
    </div>
  )
}
