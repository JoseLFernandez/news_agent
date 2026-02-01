import type { Article } from '../../types/article'
import ArticleCardLarge from './ArticleCardLarge'
import ArticleCardMedium from './ArticleCardMedium'
import ArticleCardSmall from './ArticleCardSmall'

interface ArticleGridProps {
  articles: Article[]
  isLoading?: boolean
}

export default function ArticleGrid({ articles, isLoading }: ArticleGridProps) {
  if (isLoading) {
    return <ArticleGridSkeleton />
  }

  // Filter out malformed articles (missing url or title)
  const safeArticles = articles.filter(a => a?.url && a?.title)

  if (safeArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No articles found. Try clearing topics, expanding the time period, or enabling Medium in Sources.
        </p>
      </div>
    )
  }

  // Split articles into sections
  const heroArticle = safeArticles[0]
  const secondaryArticles = safeArticles.slice(1, 4)
  const tertiaryArticles = safeArticles.slice(4, 12)
  const remainingArticles = safeArticles.slice(12)

  return (
    <div className="space-y-8">
      {/* Top Section: Hero + Secondary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hero Article */}
        <div className="md:col-span-2">
          <ArticleCardLarge article={heroArticle} />
        </div>

        {/* Secondary Articles */}
        <div className="space-y-4">
          {secondaryArticles.map((article) => (
            <ArticleCardMedium key={article.url} article={article} />
          ))}
        </div>
      </section>

      {/* Divider */}
      {tertiaryArticles.length > 0 && (
        <div className="section-divider">
          <h2 className="font-serif font-bold text-xl mb-4">More Stories</h2>
        </div>
      )}

      {/* Tertiary Grid */}
      {tertiaryArticles.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tertiaryArticles.map((article) => (
            <ArticleCardSmall key={article.url} article={article} />
          ))}
        </section>
      )}

      {/* Remaining Articles */}
      {remainingArticles.length > 0 && (
        <>
          <div className="section-divider">
            <h2 className="font-serif font-bold text-xl mb-4">Earlier</h2>
          </div>
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {remainingArticles.map((article) => (
              <ArticleCardSmall key={article.url} article={article} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function ArticleGridSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="aspect-[2/1] bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-32 aspect-square bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-1 w-8 bg-gray-200 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i}>
            <div className="h-0.5 w-6 bg-gray-200 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-full mb-1" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
