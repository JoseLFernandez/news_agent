import { useEffect, useRef, useState } from 'react'
import { useSearchStore } from '../../stores/searchStore'
import { formatArticleDate } from '../../utils/dateUtils'
import { getTopicColor, TOPICS } from '../../config/topics'
import clsx from 'clsx'

const SOURCES = [
  { id: 'medium', label: 'Medium' },
  { id: 'gdelt', label: 'GDELT' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'finance', label: 'Finance' },
]

const DATE_PRESETS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: 'week', label: 'Past Week', days: 7 },
  { id: 'month', label: 'Past Month', days: 30 },
  { id: 'all', label: 'All Time', days: 0 },
]

export default function SearchModal() {
  const {
    isOpen,
    setOpen,
    query,
    search,
    results,
    isSearching,
    error,
    recentSearches,
    clearResults,
    filters,
    setFilters,
    clearFilters,
  } = useSearchStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const [localQuery, setLocalQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [datePreset, setDatePreset] = useState('all')

  const hasActiveFilters = !!(
    filters.topics?.length ||
    filters.sources?.length ||
    filters.dateFrom
  )

  const toggleTopic = (topicId: string) => {
    const currentTopics = filters.topics || []
    const newTopics = currentTopics.includes(topicId)
      ? currentTopics.filter(t => t !== topicId)
      : [...currentTopics, topicId]
    setFilters({ ...filters, topics: newTopics.length ? newTopics : undefined })
  }

  const toggleSource = (sourceId: string) => {
    const currentSources = filters.sources || []
    const newSources = currentSources.includes(sourceId)
      ? currentSources.filter(s => s !== sourceId)
      : [...currentSources, sourceId]
    setFilters({ ...filters, sources: newSources.length ? newSources : undefined })
  }

  const setDateRange = (days: number) => {
    if (days === 0) {
      setFilters({ ...filters, dateFrom: undefined, dateTo: undefined })
      setDatePreset('all')
    } else {
      const date = new Date()
      date.setDate(date.getDate() - days)
      setFilters({ ...filters, dateFrom: date.toISOString(), dateTo: undefined })
      setDatePreset(days === 1 ? 'today' : days === 7 ? 'week' : 'month')
    }
  }

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setLocalQuery(query)
    }
  }, [isOpen, query])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, setOpen])

  // Debounced search (re-run when filters change)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.length > 2) {
        search(localQuery, filters)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery, filters, search])

  const handleClose = () => {
    setOpen(false)
    clearResults()
    clearFilters()
    setLocalQuery('')
    setShowFilters(false)
    setDatePreset('all')
  }

  const handleRecentSearch = (recentQuery: string) => {
    setLocalQuery(recentQuery)
    search(recentQuery)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-16 px-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={clsx(
                'h-5 w-5 transition-colors',
                isSearching ? 'text-accent-blue animate-pulse' : 'text-gray-400'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search articles semantically... (e.g., 'AI regulation in Europe')"
              className="flex-1 text-lg outline-none placeholder:text-gray-400"
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery('')
                  clearResults()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors',
                hasActiveFilters
                  ? 'bg-accent-blue text-white border-accent-blue'
                  : 'text-gray-400 bg-gray-100 border-gray-200 hover:bg-gray-200'
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white text-accent-blue rounded-full">
                  {(filters.topics?.length || 0) + (filters.sources?.length || 0) + (filters.dateFrom ? 1 : 0)}
                </span>
              )}
            </button>
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
              ESC
            </kbd>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 space-y-3">
              {/* Topics */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Topics
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={clsx(
                        'px-2 py-1 text-xs rounded-full transition-colors',
                        filters.topics?.includes(topic.id)
                          ? 'text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                      style={filters.topics?.includes(topic.id) ? { backgroundColor: topic.color } : undefined}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Sources
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCES.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className={clsx(
                        'px-2 py-1 text-xs rounded-full transition-colors',
                        filters.sources?.includes(source.id)
                          ? 'bg-ink-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Time Range
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setDateRange(preset.days)}
                      className={clsx(
                        'px-2 py-1 text-xs rounded-full transition-colors',
                        datePreset === preset.id
                          ? 'bg-ink-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters()
                    setDatePreset('all')
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading */}
            {isSearching && (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Searching semantically...</span>
                </div>
              </div>
            )}

            {/* Results */}
            {!isSearching && results.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {results.length} results found
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {results.map((result) => (
                    <li key={result.id}>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Topic indicator */}
                          {result.topics[0] && (
                            <div
                              className="w-1 h-12 rounded-full flex-shrink-0 mt-1"
                              style={{
                                backgroundColor: getTopicColor(result.topics[0]),
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-semibold text-ink-900 line-clamp-2">
                              {result.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {result.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <span className="uppercase">{result.source}</span>
                              <span>•</span>
                              <span>{formatArticleDate(result.publishedAt)}</span>
                              <span>•</span>
                              <span className="text-accent-blue">
                                {Math.round(result.score * 100)}% match
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No Results */}
            {!isSearching && localQuery.length > 2 && results.length === 0 && !error && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No articles found for "{localQuery}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {/* Recent Searches / Suggestions */}
            {!isSearching && localQuery.length <= 2 && (
              <div className="px-4 py-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((recent) => (
                        <button
                          key={recent}
                          onClick={() => handleRecentSearch(recent)}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {recent}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Try searching for
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'AI regulation in Europe',
                      'LLM inference optimizations',
                      'React performance tips',
                      'Startup funding trends',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleRecentSearch(suggestion)}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Powered by Pinecone semantic search</span>
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↑</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↓</kbd> to navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd> to select
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
