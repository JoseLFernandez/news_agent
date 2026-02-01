import type { Article } from '../../types/article'
import { formatArticleDate } from '../../utils/dateUtils'
import { getTopicColor } from '../../config/topics'

interface ArticleCardSmallProps {
  article: Article
}

export default function ArticleCardSmall({
  article,
}: ArticleCardSmallProps) {
  const primaryTopic = article.topics[0]

  return (
    <article className="group">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Topic indicator line */}
        {primaryTopic && (
          <div
            className="w-6 h-0.5 mb-2"
            style={{ backgroundColor: getTopicColor(primaryTopic) }}
          />
        )}

        {/* Headline */}
        <h4 className="font-serif font-semibold text-base leading-snug mb-1 group-hover:text-accent-red transition-colors line-clamp-3">
          {article.title}
        </h4>

        {/* Meta */}
        <div className="meta-text">
          {article.author && (
            <span className="font-medium">{article.author} • </span>
          )}
          {formatArticleDate(article.publishedAt)}
        </div>
      </a>
    </article>
  )
}
