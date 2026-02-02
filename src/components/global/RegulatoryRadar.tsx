import { useState, useEffect } from 'react'
import { useRegulatoryIntel } from '../../api/globalIntel'
import { getCountry, EU_ENTITY, COUNTRIES } from '../../config/countries'
import { REGULATORY_TOPICS, type RegulatoryTopic, type RegulationStatus } from '../../types/globalIntel'
import clsx from 'clsx'

const STATUS_CONFIG: Record<RegulationStatus, { label: string; color: string; bg: string }> = {
  proposed: { label: 'Proposed', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  in_committee: { label: 'In Committee', color: 'text-orange-700', bg: 'bg-orange-100' },
  passed: { label: 'Passed', color: 'text-blue-700', bg: 'bg-blue-100' },
  enacted: { label: 'Enacted', color: 'text-purple-700', bg: 'bg-purple-100' },
  in_effect: { label: 'In Effect', color: 'text-green-700', bg: 'bg-green-100' },
}

const IMPACT_CONFIG: Record<string, { color: string; icon: string }> = {
  high: { color: 'text-red-600', icon: '🔴' },
  medium: { color: 'text-yellow-600', icon: '🟡' },
  low: { color: 'text-green-600', icon: '🟢' },
}

interface RegulatoryRadarProps {
  selectedCountry?: string // Country name from parent selection
}

export default function RegulatoryRadar({ selectedCountry: initialCountry }: RegulatoryRadarProps) {
  const [countryCode, setCountryCode] = useState('US')
  const [selectedTopic, setSelectedTopic] = useState<RegulatoryTopic>('ai')

  // Sync with parent country selection
  useEffect(() => {
    if (initialCountry) {
      const foundCountry = COUNTRIES.find((c) => c.name === initialCountry)
      if (foundCountry) {
        setCountryCode(foundCountry.code)
      }
    }
  }, [initialCountry])

  const country = countryCode === 'EU'
    ? EU_ENTITY
    : getCountry(countryCode)

  const { data, isLoading, error, refetch } = useRegulatoryIntel(
    country?.name || 'United States',
    selectedTopic
  )

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-ink-900">
            📋 Regulatory Radar
          </h2>
          <button
            onClick={() => refetch()}
            className="text-xs text-gray-500 hover:text-ink-900 transition-colors"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Track tech regulation across major jurisdictions
        </p>

        {/* Topic Selector */}
        <div className="flex gap-2">
          {REGULATORY_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                selectedTopic === topic.id
                  ? 'bg-ink-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Country Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <span className="text-3xl">{country?.flag}</span>
          <div>
            <h3 className="font-semibold text-ink-900 text-lg">
              {country?.name}
            </h3>
            <p className="text-xs text-gray-500">
              {REGULATORY_TOPICS.find((t) => t.id === selectedTopic)?.label} Regulation
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-6">
            <p className="text-red-500 text-sm mb-2">
              Failed to load regulatory data
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs text-accent-blue hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Regulatory Data */}
        {!isLoading && data?.data && (
          <div className="space-y-6">
            {/* Overall Stance */}
            {data.data.overallStance && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Regulatory Stance
                </h4>
                <p className="text-sm text-ink-900">
                  {data.data.overallStance}
                </p>
              </div>
            )}

            {/* Regulations List */}
            {data.data.regulations.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Key Regulations
                </h4>
                <div className="space-y-3">
                  {data.data.regulations.map((reg, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-medium text-ink-900 text-sm">
                          {reg.name}
                        </h5>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Impact */}
                          <span
                            className="text-xs"
                            title={`${reg.impact} impact`}
                          >
                            {IMPACT_CONFIG[reg.impact]?.icon || '⚪'}
                          </span>
                          {/* Status Badge */}
                          <span
                            className={clsx(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              STATUS_CONFIG[reg.status]?.bg || 'bg-gray-100',
                              STATUS_CONFIG[reg.status]?.color || 'text-gray-700'
                            )}
                          >
                            {STATUS_CONFIG[reg.status]?.label || reg.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {reg.summary}
                      </p>
                      {reg.lastUpdate && (
                        <p className="text-[10px] text-gray-400">
                          Last updated: {reg.lastUpdate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Developments */}
            {data.data.recentDevelopments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Recent Articles ({data.data.recentDevelopments.length})
                </h4>
                <div className="space-y-3">
                  {data.data.recentDevelopments.map((dev, index) => {
                    const devObj = typeof dev === 'string' ? { title: dev } : dev
                    return (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        {devObj.url ? (
                          <a
                            href={devObj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-ink-900 hover:text-accent-blue font-medium line-clamp-2 mb-1 block"
                          >
                            {devObj.title}
                          </a>
                        ) : (
                          <p className="text-sm text-ink-900 font-medium line-clamp-2 mb-1">
                            {devObj.title}
                          </p>
                        )}
                        {devObj.summary && (
                          <p className="text-xs text-gray-500">
                            {devObj.summary}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Citations */}
            {data.citations && data.citations.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">
                  Sources: {data.citations.slice(0, 3).join(', ')}
                  {data.citations.length > 3 && ` +${data.citations.length - 3} more`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data?.data?.regulations?.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No regulatory data available for this selection
          </p>
        )}
      </div>
    </section>
  )
}
