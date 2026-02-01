import type { Article } from '../../types/article'
import { formatArticleDate } from '../../utils/dateUtils'
import { getTopicColor } from '../../config/topics'
import ArticleImage from './ArticleImage'

interface ArticleCardMediumProps {
  article: Article
}

export default function ArticleCardMedium({ article }: ArticleCardMediumProps) {
  const primaryTopic = article.topics[0]

  return (
    <article className="group border-b border-gray-200 pb-4 last:border-b-0">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-4"
      >
        {/* Image */}
        <div className="flex-shrink-0 w-32">
          <ArticleImage
            src={article.image}
            alt={article.title}
            aspectRatio="square"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Topic indicator */}
          {primaryTopic && (
            <div
              className="w-8 h-1 mb-2"
              style={{ backgroundColor: getTopicColor(primaryTopic) }}
            />
          )}

          {/* Headline */}
          <h3 className="headline-small mb-2 group-hover:text-accent-red transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Summary - only first sentence */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {article.summary}
          </p>

          {/* Meta */}
          <div className="meta-text">
            {formatArticleDate(article.publishedAt)}
            {article.readTime && ` • ${article.readTime} min`}
          </div>
        </div>
      </a>
    </article>
  )
}
