import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import type { Article } from '../../types/article'
import { groupByDate, formatSectionDate } from '../../utils/dateUtils'
import ArticleCardSmall from './ArticleCardSmall'

interface ArticleTimelineProps {
  articles: Article[]
}

export default function ArticleTimeline({ articles }: ArticleTimelineProps) {
  const groups = useMemo(() => groupByDate(articles), [articles])

  const sortedDays = useMemo(() => {
    return Array.from(groups.keys()).sort((a, b) => b.localeCompare(a))
  }, [groups])

  if (articles.length === 0) return null

  return (
    <div className="space-y-10">
      {sortedDays.map((day) => {
        const dayArticles = groups.get(day) || []
        const label = formatSectionDate(parseISO(day))

        return (
          <section key={day}>
            <div className="section-divider">
              <h2 className="font-serif font-bold text-xl mb-4">{label}</h2>
              <p className="text-xs text-gray-500 -mt-2 mb-3">{format(parseISO(day), 'MMM d, yyyy')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dayArticles.map((article) => (
                <ArticleCardSmall key={article.url} article={article} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
