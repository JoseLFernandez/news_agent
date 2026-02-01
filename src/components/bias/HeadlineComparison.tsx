import type { SearchResult } from '../../types/search'
import type { ArticleBiasProfile } from '../../types/storyCluster'

interface HeadlineComparisonProps {
  articles: SearchResult[]
  profiles: Record<string, ArticleBiasProfile>
}

/**
 * Side-by-side comparison of headlines from different sources.
 * Highlights framing keywords and shows sentiment indicators.
 */
export default function HeadlineComparison({
  articles,
  profiles,
}: HeadlineComparisonProps) {
  // Get all framing keywords across articles
  const allKeywords = new Set<string>()
  for (const profile of Object.values(profiles)) {
    profile.framingKeywords.forEach((k) => allKeywords.add(k.toLowerCase()))
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Headline Comparison
      </h4>

      <div className="space-y-2">
        {articles.map((article) => {
          const profile = profiles[article.id]
          const sentiment = profile?.sentimentScore ?? 0

          return (
            <div
              key={article.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Sentiment indicator */}
              <div
                className="flex-shrink-0 w-1 self-stretch rounded-full"
                style={{ backgroundColor: getSentimentColor(sentiment) }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Source badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {article.source}
                  </span>
                  {sentiment !== 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        sentiment > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sentiment > 0 ? '+' : ''}{sentiment.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Headline with highlighted keywords */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {highlightKeywords(article.title, allKeywords)}
                </a>

                {/* Framing keywords */}
                {profile && profile.framingKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.framingKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getSentimentColor(score: number): string {
  if (score < -0.2) return '#ef4444' // red
  if (score < -0.05) return '#f97316' // orange
  if (score > 0.2) return '#22c55e' // green
  if (score > 0.05) return '#84cc16' // lime
  return '#d1d5db' // gray-300
}

function highlightKeywords(
  text: string,
  keywords: Set<string>
): React.ReactNode {
  if (keywords.size === 0) return text

  const regex = new RegExp(
    `\\b(${Array.from(keywords).join('|')})\\b`,
    'gi'
  )

  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (keywords.has(part.toLowerCase())) {
      return (
        <mark
          key={index}
          className="bg-amber-200 text-amber-900 px-0.5 rounded"
        >
          {part}
        </mark>
      )
    }
    return part
  })
}
