import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Article } from '../types/article'
import type { SearchResult, SearchFilters } from '../types/search'
import { toArticleSource } from '../utils/articleSource'

interface PineconeSearchResponse {
  id: string
  score: number
  title: string
  summary: string
  url: string
  image?: string
  author?: string
  publishedAt: string
  source: string
  topics: string[]
  country?: string
}

interface SearchOptions {
  topK?: number
  filters?: SearchFilters
  useHybrid?: boolean
  recencyBoost?: boolean
}

/**
 * Search articles semantically using Pinecone
 * Supports filters, hybrid search, and recency boosting
 */
async function semanticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    topK = 10,
    filters,
    useHybrid = true,
    recencyBoost = true,
  } = options

  const response = await fetch('/.netlify/functions/pinecone-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'search',
      query,
      topK,
      filters,
      useHybrid,
      recencyBoost,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Search failed')
  }

  const results: PineconeSearchResponse[] = await response.json()

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    url: r.url,
    image: r.image,
    author: r.author,
    publishedAt: new Date(r.publishedAt),
    source: toArticleSource(r.source),
    topics: r.topics || [],
    country: r.country,
    score: r.score,
  }))
}

/**
 * Find articles similar to a given article
 */
async function findSimilarArticles(articleId: string, topK = 5): Promise<SearchResult[]> {
  const response = await fetch('/.netlify/functions/pinecone-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'similar', articleId, topK }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Similar search failed')
  }

  const results: PineconeSearchResponse[] = await response.json()

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    url: r.url,
    image: r.image,
    author: r.author,
    publishedAt: new Date(r.publishedAt),
    source: toArticleSource(r.source),
    topics: r.topics || [],
    country: r.country,
    score: r.score,
  }))
}

/**
 * Index articles in Pinecone for semantic search
 */
async function indexArticles(articles: Article[]): Promise<{ upserted: number }> {
  const response = await fetch('/.netlify/functions/pinecone-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upsert',
      articles: articles.map((a) => ({
        ...a,
        publishedAt: a.publishedAt.toISOString(),
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Indexing failed')
  }

  return response.json()
}

/**
 * Hook for semantic search with filters
 */
export function useSemanticSearch(
  query: string,
  options: SearchOptions = {},
  enabled = false
) {
  return useQuery({
    queryKey: ['semantic-search', query, options],
    queryFn: () => semanticSearch(query, options),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook for finding similar articles
 */
export function useSimilarArticles(articleId: string | null, enabled = false) {
  return useQuery({
    queryKey: ['similar-articles', articleId],
    queryFn: () => findSimilarArticles(articleId!),
    enabled: enabled && !!articleId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook for indexing articles (mutation)
 */
export function useIndexArticles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: indexArticles,
    onSuccess: () => {
      // Invalidate search queries after indexing
      queryClient.invalidateQueries({ queryKey: ['semantic-search'] })
    },
  })
}

export { semanticSearch, findSimilarArticles, indexArticles }
