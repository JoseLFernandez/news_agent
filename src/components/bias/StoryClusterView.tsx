import { useState } from 'react'
import type { StoryCluster } from '../../types/storyCluster'
import BiasIndicatorBadge from './BiasIndicatorBadge'
import SentimentGauge from './SentimentGauge'
import HeadlineComparison from './HeadlineComparison'

interface StoryClusterViewProps {
  cluster: StoryCluster
  mode?: 'compact' | 'expanded' | 'full'
  onClose?: () => void
}

/**
 * Main component for displaying a story cluster with bias analysis.
 *
 * Modes:
 * - compact: Shows headline variations and source count
 * - expanded: Adds sentiment gauge and framing comparison
 * - full: Complete analysis with all bias indicators
 */
export default function StoryClusterView({
  cluster,
  mode = 'expanded',
  onClose,
}: StoryClusterViewProps) {
  const [activeTab, setActiveTab] = useState<'headlines' | 'analysis'>('headlines')

  const sourceCount = new Set(cluster.articles.map((a) => a.source)).size

  // Compact mode - minimal display
  if (mode === 'compact') {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {sourceCount} sources covering this story
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-1">
          {cluster.headlineVariations.slice(0, 3).map((headline, i) => (
            <div key={i} className="text-xs text-gray-600 truncate">
              • {headline}
            </div>
          ))}
          {cluster.headlineVariations.length > 3 && (
            <div className="text-xs text-gray-400">
              +{cluster.headlineVariations.length - 3} more variations
            </div>
          )}
        </div>
      </div>
    )
  }

  // Expanded and Full modes
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {sourceCount} sources
              </span>
              <span className="text-xs text-gray-500">
                {cluster.articles.length} articles
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">
              {cluster.canonicalTitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {cluster.eventSummary}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Diversity indicator */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500">Source diversity:</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[120px]">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${cluster.sourceDiversity * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {Math.round(cluster.sourceDiversity * 100)}%
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('headlines')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'headlines'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Headlines
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'analysis'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bias Analysis
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'headlines' ? (
          <HeadlineComparison
            articles={cluster.articles}
            profiles={cluster.biasProfiles}
          />
        ) : (
          <div className="space-y-6">
            {/* Sentiment Gauge */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Sentiment Distribution
              </h4>
              <SentimentGauge
                articles={cluster.articles}
                profiles={cluster.biasProfiles}
              />
            </div>

            {/* Framing Comparison */}
            {cluster.framingComparison && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Coverage Analysis
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                  {cluster.framingComparison}
                </div>
              </div>
            )}

            {/* Bias Indicators (full mode only) */}
            {mode === 'full' && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  All Bias Indicators
                </h4>
                <div className="space-y-4">
                  {cluster.articles.map((article) => {
                    const profile = cluster.biasProfiles[article.id]
                    if (!profile || profile.indicators.length === 0) return null

                    return (
                      <div key={article.id}>
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {article.source}
                        </div>
                        <div className="space-y-1">
                          {profile.indicators.map((indicator, i) => (
                            <BiasIndicatorBadge
                              key={i}
                              indicator={indicator}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
