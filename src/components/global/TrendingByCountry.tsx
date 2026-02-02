import { useState, useEffect, useRef } from 'react'
import { useTrendingTopics } from '../../api/globalIntel'
import { getCountry, FEATURED_COUNTRIES, COUNTRIES, getCountriesByRegion } from '../../config/countries'
import type { TrendingCategory } from '../../types/globalIntel'
import type { Country } from '../../config/countries'
import clsx from 'clsx'

const REGIONS: { id: Country['region']; label: string }[] = [
  { id: 'americas', label: 'Americas' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia', label: 'Asia' },
  { id: 'africa', label: 'Africa' },
  { id: 'oceania', label: 'Oceania' },
]

const LANGUAGES = [
  { code: 'any', label: 'Local (Any language)', flag: '🌐' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', label: 'Polish', flag: '🇵🇱' },
]

const CATEGORY_COLORS: Record<TrendingCategory, string> = {
  technology: 'bg-blue-500',
  business: 'bg-emerald-500',
  politics: 'bg-red-500',
  science: 'bg-purple-500',
  culture: 'bg-pink-500',
  sports: 'bg-orange-500',
}

const CATEGORY_ICONS: Record<TrendingCategory, string> = {
  technology: '💻',
  business: '📈',
  politics: '🏛️',
  science: '🔬',
  culture: '🎭',
  sports: '⚽',
}

interface TrendingByCountryProps {
  initialCountry?: string // Country name from map selection
}

export default function TrendingByCountry({ initialCountry }: TrendingByCountryProps) {
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null)
  const [language, setLanguage] = useState('en')
  const [translate, setTranslate] = useState(false)

  // Translation is only applicable for specific (non-English) languages.
  useEffect(() => {
    if (language === 'en' || language === 'any') setTranslate(false)
  }, [language])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)

  // Sync with map selection
  useEffect(() => {
    if (initialCountry) {
      const country = COUNTRIES.find((c) => c.name === initialCountry)
      if (country) {
        setSelectedCountry(country.code)
      }
    }
  }, [initialCountry])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const country = getCountry(selectedCountry)
  const selectedLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  const { data, isLoading, error, refetch } = useTrendingTopics(
    country?.name || 'United States',
    language,
    translate
  )

  const featuredCountries = FEATURED_COUNTRIES.map(
    (code) => getCountry(code)!
  ).filter(Boolean)

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code)
    setShowDropdown(false)
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-ink-900">
            🌍 Global Trending
          </h2>
          <button
            onClick={() => refetch()}
            className="text-xs text-gray-500 hover:text-ink-900 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Country Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          {featuredCountries.slice(0, 6).map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                selectedCountry === c.code
                  ? 'bg-ink-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{c.flag}</span>
              <span className="hidden sm:inline">{c.name}</span>
            </button>
          ))}

          {/* More Countries Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                showDropdown || !FEATURED_COUNTRIES.slice(0, 6).includes(selectedCountry)
                  ? 'bg-ink-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {!FEATURED_COUNTRIES.slice(0, 6).includes(selectedCountry) && country && (
                <span>{country.flag}</span>
              )}
              <span>More ▾</span>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {REGIONS.map((region) => {
                  const regionCountries = getCountriesByRegion(region.id)
                  return (
                    <div key={region.id}>
                      <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
                        {region.label}
                      </div>
                      <div className="py-1">
                        {regionCountries.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleCountrySelect(c.code)}
                            className={clsx(
                              'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors',
                              selectedCountry === c.code && 'bg-gray-100 font-medium'
                            )}
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Language Controls */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          {/* Language Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                showLangDropdown
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              <span>{selectedLang.flag}</span>
              <span>{selectedLang.label}</span>
              <span className="text-[10px]">▾</span>
            </button>

            {showLangDropdown && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setShowLangDropdown(false)
                    }}
                    className={clsx(
                      'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors',
                      language === lang.code && 'bg-gray-100 font-medium'
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Translation Toggle */}
          {language !== 'en' && language !== 'any' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={translate}
                onChange={(e) => setTranslate(e.target.checked)}
                className="w-3.5 h-3.5 text-accent-blue rounded border-gray-300 focus:ring-accent-blue"
              />
              <span className="text-xs text-gray-600">Translate to English</span>
            </label>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Current Country Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{country?.flag}</span>
          <div>
            <h3 className="font-semibold text-ink-900">
              What's trending in {country?.name}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'any'
                ? 'Local headlines (any language)'
                : language === 'en'
                  ? 'Real-time trending topics'
                  : `${selectedLang.label} sources${translate ? ' (translated)' : ''}`}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm mb-2">Failed to load trending topics</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-accent-blue hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Topics */}
        {!isLoading && data?.topics && (
          <div className="space-y-3">
            {data.topics.map((topic, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Topic Header - Clickable */}
                <button
                  onClick={() => setExpandedTopic(expandedTopic === index ? null : index)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Heat Indicator */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                    {CATEGORY_ICONS[topic.category] || '📰'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-ink-900 text-sm line-clamp-1">
                        {topic.title}
                      </h4>
                      {/* Heat bar */}
                      <div className="flex-shrink-0 flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={clsx(
                              'w-1 h-3 rounded-full transition-colors',
                              i < Math.ceil(topic.heat / 2)
                                ? 'bg-orange-400'
                                : 'bg-gray-200'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {topic.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={clsx(
                          'inline-block px-1.5 py-0.5 text-[10px] font-medium text-white rounded',
                          CATEGORY_COLORS[topic.category] || 'bg-gray-500'
                        )}
                      >
                        {topic.category}
                      </span>
                      {topic.articles && topic.articles.length > 0 && (
                        <span className="text-[10px] text-accent-blue">
                          Click to view {topic.articles.length} articles →
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Articles */}
                {expandedTopic === index && topic.articles && topic.articles.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <div className="space-y-2">
                      {topic.articles.slice(0, 10).map((article, artIndex) => (
                        <a
                          key={artIndex}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-white border border-gray-200 rounded hover:border-accent-blue transition-colors"
                        >
                          <h5 className="text-sm font-medium text-ink-900 line-clamp-2 mb-1 hover:text-accent-blue">
                            {article.title}
                          </h5>
                          {article.originalTitle && (
                            <p className="text-xs text-gray-400 italic line-clamp-1 mb-1">
                              {article.originalTitle}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {article.source} • {article.date}
                          </p>
                        </a>
                      ))}
                      {topic.articles.length > 10 && (
                        <p className="text-xs text-gray-500 text-center pt-1">
                          +{topic.articles.length - 10} more articles
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data?.topics?.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No trending topics available
          </p>
        )}
      </div>
    </section>
  )
}
