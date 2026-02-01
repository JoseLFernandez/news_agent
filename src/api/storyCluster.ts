import { useQuery } from '@tanstack/react-query'
import type {
  StoryCluster,
  StoryClusterRequest,
  StoryClusterResponse,
} from '../types/storyCluster'
import { toArticleSource } from '../utils/articleSource'

interface RawArticle {
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

interface RawStoryCluster {
  clusterId: string
  canonicalTitle: string
  eventSummary: string
  articles: RawArticle[]
  biasProfiles: Record<string, any>
  sourceDiversity: number
  regionalCoverage: Record<string, number>
  headlineVariations: string[]
  framingComparison: string
}

interface RawStoryClusterResponse {
  clusters: RawStoryCluster[]
  totalArticlesAnalyzed: number
  queryArticleId: string | null
}

/**
 * Transform raw API response to typed StoryCluster
 */
function transformCluster(raw: RawStoryCluster): StoryCluster {
  return {
    ...raw,
    articles: raw.articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      url: a.url,
      image: a.image,
      author: a.author,
      publishedAt: new Date(a.publishedAt),
      source: toArticleSource(a.source),
      topics: a.topics || [],
      country: a.country,
      score: a.score,
    })),
  }
}

/**
 * Find story clusters for an article or text query.
 * Returns groups of articles covering the same story with bias analysis.
 */
export async function findStoryClusters(
  request: StoryClusterRequest
): Promise<StoryClusterResponse> {
  const response = await fetch('/.netlify/functions/story-clusters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Story cluster search failed')
  }

  const data: RawStoryClusterResponse = await response.json()

  return {
    clusters: data.clusters.map(transformCluster),
    totalArticlesAnalyzed: data.totalArticlesAnalyzed,
    queryArticleId: data.queryArticleId,
  }
}

/**
 * Find story clusters for a specific article ID.
 */
export async function findStoryClustersForArticle(
  articleId: string,
  options?: { topK?: number; includeBiasAnalysis?: boolean }
): Promise<StoryClusterResponse> {
  return findStoryClusters({
    articleId,
    topK: options?.topK ?? 30,
    includeBiasAnalysis: options?.includeBiasAnalysis ?? true,
  })
}

/**
 * Find story clusters for a text query.
 */
export async function findStoryClustersForText(
  text: string,
  options?: { topK?: number; includeBiasAnalysis?: boolean }
): Promise<StoryClusterResponse> {
  return findStoryClusters({
    text,
    topK: options?.topK ?? 30,
    includeBiasAnalysis: options?.includeBiasAnalysis ?? true,
  })
}

/**
 * Hook for finding story clusters for an article.
 * Returns clusters of articles covering the same story with bias analysis.
 *
 * @param articleId - The article to find clusters for
 * @param enabled - Whether to run the query
 */
export function useStoryClusters(
  articleId: string | null,
  enabled = false
) {
  return useQuery({
    queryKey: ['story-clusters', articleId],
    queryFn: () => findStoryClustersForArticle(articleId!),
    enabled: enabled && !!articleId,
    staleTime: 1000 * 60 * 15, // 15 minutes - bias analysis is expensive
    gcTime: 1000 * 60 * 60, // 1 hour cache
  })
}

/**
 * Hook for finding story clusters for a text query.
 */
export function useStoryClustersByText(
  text: string | null,
  enabled = false
) {
  return useQuery({
    queryKey: ['story-clusters-text', text],
    queryFn: () => findStoryClustersForText(text!),
    enabled: enabled && !!text && text.length > 10,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  })
}
