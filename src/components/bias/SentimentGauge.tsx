import type { ArticleBiasProfile } from '../../types/storyCluster'
import type { SearchResult } from '../../types/search'

interface SentimentGaugeProps {
  articles: SearchResult[]
  profiles: Record<string, ArticleBiasProfile>
}

/**
 * Visual gauge showing sentiment distribution across articles.
 * Displays articles as dots on a scale from negative to positive.
 */
export default function SentimentGauge({
  articles,
  profiles,
}: SentimentGaugeProps) {
  // Sort articles by sentiment for display
  const sortedArticles = [...articles].sort((a, b) => {
    const scoreA = profiles[a.id]?.sentimentScore ?? 0
    const scoreB = profiles[b.id]?.sentimentScore ?? 0
    return scoreA - scoreB
  })

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>

      {/* Gauge background */}
      <div className="relative h-8 rounded-full bg-gradient-to-r from-red-200 via-gray-100 to-green-200">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />

        {/* Article dots */}
        {sortedArticles.map((article) => {
          const score = profiles[article.id]?.sentimentScore ?? 0
          // Convert score (-1 to 1) to percentage (0 to 100)
          const position = ((score + 1) / 2) * 100

          return (
            <div
              key={article.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
              style={{ left: `${position}%` }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-help flex items-center justify-center text-xs font-bold text-white"
                style={{
                  backgroundColor: getScoreColor(score),
                }}
                title={`${article.source}: ${score.toFixed(2)}`}
              >
                {article.source?.[0].toUpperCase()}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {article.source}
                  <br />
                  Score: {score.toFixed(2)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {sortedArticles.map((article) => {
          const score = profiles[article.id]?.sentimentScore ?? 0
          return (
            <div
              key={article.id}
              className="flex items-center gap-1 text-xs"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getScoreColor(score) }}
              />
              <span className="text-gray-600">{article.source}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score < -0.3) return '#ef4444' // red-500
  if (score < -0.1) return '#f97316' // orange-500
  if (score > 0.3) return '#22c55e'  // green-500
  if (score > 0.1) return '#84cc16'  // lime-500
  return '#6b7280' // gray-500
}
