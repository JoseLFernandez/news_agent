import { useEffect, useRef } from 'react'
import { useIndexArticles } from '../api/search'
import type { Article } from '../types/article'

/**
 * Hook that automatically indexes articles to Pinecone for semantic search.
 * Uses a Set to track indexed article IDs and avoid duplicates.
 */
export function useAutoIndex(articles: Article[], enabled = true) {
  const indexMutation = useIndexArticles()
  const indexedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled || articles.length === 0) return

    // Filter out already indexed articles
    const newArticles = articles.filter(
      (article) => !indexedIds.current.has(article.id)
    )

    if (newArticles.length === 0) return

    // Mark as indexed (optimistically)
    newArticles.forEach((article) => {
      indexedIds.current.add(article.id)
    })

    // Index in background
    indexMutation.mutate(newArticles, {
      onError: (error) => {
        console.error('Failed to index articles:', error)
        // Remove from indexed set on error so they can be retried
        newArticles.forEach((article) => {
          indexedIds.current.delete(article.id)
        })
      },
      onSuccess: (result) => {
        console.log(`Indexed ${result.upserted} articles to Pinecone`)
      },
    })
  }, [articles, enabled, indexMutation])

  return {
    isIndexing: indexMutation.isPending,
    indexError: indexMutation.error,
    indexedCount: indexedIds.current.size,
  }
}
