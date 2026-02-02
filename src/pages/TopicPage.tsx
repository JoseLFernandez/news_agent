import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import { useFilterStore } from '../stores/filterStore'
import { TOPICS } from '../config/topics'
import ArticleGrid from '../components/articles/ArticleGrid'
import ArticleTimeline from '../components/articles/ArticleTimeline'
import DateFilter from '../components/filters/DateFilter'

export default function TopicPage() {
  const { topic } = useParams<{ topic: string }>()
  const { setTopics } = useFilterStore()
  const { articles, isLoading, isError, error, refetch } = useArticles()
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  // Set the topic filter when the page loads
  useEffect(() => {
    if (topic) {
      setTopics([topic])
    }
    return () => {
      // Don't clear on unmount to preserve state during navigation
    }
  }, [topic, setTopics])

  const topicData = TOPICS.find((t) => t.id === topic)
  const topicLabel = topicData?.label || topic || 'Unknown'
  const topicColor = topicData?.color || '#6b7280'

  return (
    <div>
      {/* Topic Header */}
      <header className="mb-6 pb-4 border-b-2" style={{ borderColor: topicColor }}>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-ink-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span>{topicLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h1
            className="font-serif text-3xl md:text-4xl font-bold"
            style={{ color: topicColor }}
          >
            {topicLabel}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-ink-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-ink-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Timeline
              </button>
            </div>
            <DateFilter />
          </div>
        </div>
      </header>

      {/* Related Topics */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm text-gray-500 mr-2">Related:</span>
        {TOPICS.filter((t) => t.id !== topic)
          .slice(0, 4)
          .map((t) => (
            <Link
              key={t.id}
              to={`/topic/${t.id}`}
              className="text-sm text-gray-600 hover:text-ink-900 transition-colors"
            >
              {t.label}
            </Link>
          ))}
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">
            Failed to load articles: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={refetch}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Articles */}
      {viewMode === 'timeline' && !isLoading ? (
        <ArticleTimeline articles={articles} />
      ) : (
        <ArticleGrid articles={articles} isLoading={isLoading} />
      )}

      {/* Article Count */}
      {!isLoading && articles.length > 0 && (
        <p className="mt-8 text-center text-sm text-gray-500">
          Showing {articles.length} articles about {topicLabel}
        </p>
      )}
    </div>
  )
}
