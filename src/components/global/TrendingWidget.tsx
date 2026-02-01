import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrendingTopics } from '../../api/globalIntel'
import { getCountry, FEATURED_COUNTRIES } from '../../config/countries'
import clsx from 'clsx'

export default function TrendingWidget() {
  const [selectedCountry, setSelectedCountry] = useState('US')
  const country = getCountry(selectedCountry)

  const { data, isLoading } = useTrendingTopics(
    country?.name || 'United States'
  )

  const topCountries = FEATURED_COUNTRIES.slice(0, 5).map(
    (code) => getCountry(code)!
  )

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif font-bold text-lg border-b-2 border-ink-900 pb-2">
          🌍 Trending
        </h3>
      </div>

      {/* Country Quick Select */}
      <div className="flex gap-1 mb-3">
        {topCountries.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={clsx(
              'px-2 py-0.5 rounded text-xs transition-colors',
              selectedCountry === c.code
                ? 'bg-ink-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            title={c.name}
          >
            {c.flag}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      )}

      {/* Topics */}
      {!isLoading && data?.topics && (
        <ul className="space-y-2">
          {data.topics.slice(0, 4).map((topic, index) => (
            <li key={index} className="text-sm">
              <span className="text-gray-400 mr-1">{index + 1}.</span>
              <span className="text-gray-700 line-clamp-1">{topic.title}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Link to full dashboard */}
      <Link
        to="/global"
        className="inline-block mt-3 text-xs text-accent-blue hover:underline"
      >
        View Global Dashboard →
      </Link>
    </section>
  )
}
