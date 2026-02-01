import { useArticles } from '../hooks/useArticles'
import { useAutoIndex } from '../hooks/useAutoIndex'
import ArticleGrid from '../components/articles/ArticleGrid'
import TopicFilter from '../components/filters/TopicFilter'
import DateFilter from '../components/filters/DateFilter'

export default function HomePage() {
  const { articles, isLoading, isError, error, refetch } = useArticles()

  // Auto-index articles to Pinecone for semantic search
  const { isIndexing } = useAutoIndex(articles, !isLoading && articles.length > 0)

  return (
    <div>
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <TopicFilter />
        <div className="flex items-center gap-4">
          <DateFilter />
          <button
            onClick={refetch}
            className="text-sm text-gray-500 hover:text-ink-900 transition-colors"
            title="Refresh articles"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
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

      {/* Article Grid */}
      <ArticleGrid articles={articles} isLoading={isLoading} />

      {/* Article Count & Index Status */}
      {!isLoading && articles.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Showing {articles.length} articles</p>
          {isIndexing && (
            <p className="text-xs text-accent-blue mt-1 animate-pulse">
              Indexing for semantic search...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
