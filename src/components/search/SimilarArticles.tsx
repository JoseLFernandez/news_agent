import { useState } from 'react'
import { useSimilarArticles } from '../../api/search'
import { useStoryClusters } from '../../api/storyCluster'
import { StoryClusterView } from '../bias'

interface SimilarArticlesProps {
  articleId: string
}

export default function SimilarArticles({ articleId }: SimilarArticlesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBiasAnalysis, setShowBiasAnalysis] = useState(false)

  const { data: similar, isLoading, error } = useSimilarArticles(
    articleId,
    isExpanded
  )

  // Fetch story clusters when bias analysis is requested
  const {
    data: clusterData,
    isLoading: clustersLoading,
    error: clustersError,
  } = useStoryClusters(articleId, showBiasAnalysis)

  // Check if there are multiple sources in similar articles
  const hasMultipleSources = similar
    ? new Set(similar.map((a) => a.source)).size >= 2
    : false

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-accent-blue transition-colors"
        title="Find similar articles"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span>Similar</span>
      </button>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Similar Articles
        </h5>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
      </div>

      {isLoading && (
        <div className="text-xs text-gray-400 animate-pulse">
          Finding similar articles...
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500">
          Failed to find similar articles
        </div>
      )}

      {similar && similar.length > 0 && (
        <>
          <ul className="space-y-2">
            {similar.map((article) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs hover:text-accent-blue transition-colors"
                >
                  <span className="line-clamp-2 font-medium text-gray-700">
                    {article.title}
                  </span>
                  <span className="text-gray-400 mt-0.5 block">
                    {Math.round(article.score * 100)}% similar
                    {article.source && ` • ${article.source}`}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* Compare Coverage button - show when multiple sources exist */}
          {hasMultipleSources && !showBiasAnalysis && (
            <button
              onClick={() => setShowBiasAnalysis(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Compare how sources cover this story
            </button>
          )}

          {/* Bias Analysis View */}
          {showBiasAnalysis && (
            <div className="mt-3">
              {clustersLoading && (
                <div className="text-xs text-gray-400 animate-pulse p-3 bg-gray-50 rounded-lg">
                  Analyzing coverage across sources...
                </div>
              )}

              {clustersError && (
                <div className="text-xs text-red-500 p-3 bg-red-50 rounded-lg">
                  Failed to analyze coverage
                  <button
                    onClick={() => setShowBiasAnalysis(false)}
                    className="ml-2 text-red-600 underline"
                  >
                    Close
                  </button>
                </div>
              )}

              {clusterData && clusterData.clusters.length > 0 && (
                <StoryClusterView
                  cluster={clusterData.clusters[0]}
                  mode="expanded"
                  onClose={() => setShowBiasAnalysis(false)}
                />
              )}

              {clusterData && clusterData.clusters.length === 0 && (
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                  No multi-source coverage found for this story.
                  <button
                    onClick={() => setShowBiasAnalysis(false)}
                    className="ml-2 text-blue-600 underline"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {similar && similar.length === 0 && (
        <div className="text-xs text-gray-400">
          No similar articles found
        </div>
      )}
    </div>
  )
}
