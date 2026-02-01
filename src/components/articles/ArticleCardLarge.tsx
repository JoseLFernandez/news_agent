import type { Article } from '../../types/article'
import { formatArticleDate } from '../../utils/dateUtils'
import { getTopicLabel, getTopicColor } from '../../config/topics'
import ArticleImage from './ArticleImage'

interface ArticleCardLargeProps {
  article: Article
}

export default function ArticleCardLarge({ article }: ArticleCardLargeProps) {
  const primaryTopic = article.topics[0]

  return (
    <article className="group">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Image */}
        <ArticleImage
          src={article.image}
          alt={article.title}
          aspectRatio="wide"
          className="mb-4"
        />

        {/* Topic Badge */}
        {primaryTopic && (
          <span
            className="inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white mb-2"
            style={{ backgroundColor: getTopicColor(primaryTopic) }}
          >
            {getTopicLabel(primaryTopic)}
          </span>
        )}

        {/* Headline */}
        <h2 className="headline-large mb-3 group-hover:text-accent-red transition-colors">
          {article.title}
        </h2>

        {/* Summary */}
        <p className="body-text mb-3 line-clamp-3">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {article.author && (
            <>
              <span className="font-medium text-ink-900">{article.author}</span>
              <span>•</span>
            </>
          )}
          <span>{formatArticleDate(article.publishedAt)}</span>
          {article.readTime && (
            <>
              <span>•</span>
              <span>{article.readTime} min read</span>
            </>
          )}
          <span>•</span>
          <span className="uppercase">{article.source}</span>
        </div>
      </a>
    </article>
  )
}
