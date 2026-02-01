import { useQuery } from '@tanstack/react-query'
import type { Article } from '../types/article'
import { toArticleSource } from '../utils/articleSource'

export type FinanceCategory = 'investing' | 'markets' | 'crypto' | 'fintech' | 'economy' | 'all'

interface FinanceArticle {
  id: string
  title: string
  summary: string
  url: string
  image?: string
  author?: string
  publishedAt: string
  source: string
  topics: string[]
  category?: string
}

interface MarketIndex {
  name: string
  value: string
  change: string
  changePercent: string
}

interface SectorPerformance {
  name: string
  performance: string
}

interface MarketSummary {
  overview: string
  indices?: MarketIndex[]
  sectors?: SectorPerformance[]
  outlook?: string
  citations?: string[]
  error?: string
}

interface Conference {
  name: string
  date: string
  location: string
  url: string
  description: string
  topics: string[]
}

/**
 * Fetch finance news from multiple sources
 */
async function fetchFinanceNews(
  category: FinanceCategory = 'all',
  limit: number = 30
): Promise<Article[]> {
  const response = await fetch('/.netlify/functions/finance-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'news', category, limit }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch finance news')
  }

  const articles: FinanceArticle[] = await response.json()

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    image: article.image,
    author: article.author,
    publishedAt: new Date(article.publishedAt),
    source: toArticleSource(article.source),
    topics: article.topics,
    country: undefined,
  }))
}

/**
 * Fetch finance conferences
 */
async function fetchConferences(limit: number = 10): Promise<Conference[]> {
  const response = await fetch('/.netlify/functions/finance-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'conferences', limit }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch conferences')
  }

  return response.json()
}

/**
 * Fetch market summary
 */
async function fetchMarketSummary(): Promise<MarketSummary> {
  const response = await fetch('/.netlify/functions/finance-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markets' }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch market summary')
  }

  return response.json()
}

/**
 * Hook for fetching finance news
 */
export function useFinanceNews(
  category: FinanceCategory = 'all',
  limit: number = 30,
  enabled = true
) {
  return useQuery({
    queryKey: ['finance-news', category, limit],
    queryFn: () => fetchFinanceNews(category, limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook for fetching finance conferences
 */
export function useFinanceConferences(limit: number = 10, enabled = true) {
  return useQuery({
    queryKey: ['finance-conferences', limit],
    queryFn: () => fetchConferences(limit),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

/**
 * Hook for fetching market summary
 */
export function useMarketSummary(enabled = true) {
  return useQuery({
    queryKey: ['market-summary'],
    queryFn: fetchMarketSummary,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

export { fetchFinanceNews, fetchConferences, fetchMarketSummary }
export type { MarketSummary, Conference, MarketIndex, SectorPerformance }
