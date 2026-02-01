import { useQuery } from '@tanstack/react-query'
import type { Article } from '../types/article'
import { toArticleSource } from '../utils/articleSource'

export type FTCategory = 'markets' | 'companies' | 'world' | 'opinion' | 'lex' | 'tech' | 'all'

interface FTArticle {
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
  isPremium?: boolean
}

/**
 * Fetch Financial Times news
 */
async function fetchFTNews(
  category: FTCategory = 'all',
  limit: number = 20
): Promise<Article[]> {
  const response = await fetch('/.netlify/functions/ft-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'news', category, limit }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch FT news')
  }

  const articles: FTArticle[] = await response.json()

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    image: article.image,
    author: article.author,
    publishedAt: new Date(article.publishedAt),
    source: toArticleSource('finance'), // FT is under finance source
    topics: article.topics,
    country: 'GB', // FT is UK-based
  }))
}

/**
 * Fetch MyFT personalized feed (requires authentication)
 */
async function fetchMyFT(limit: number = 20): Promise<Article[]> {
  const response = await fetch('/.netlify/functions/ft-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'myft', limit }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch MyFT')
  }

  const articles: FTArticle[] = await response.json()

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    image: article.image,
    author: article.author,
    publishedAt: new Date(article.publishedAt),
    source: toArticleSource('finance'),
    topics: article.topics,
    country: 'GB',
  }))
}

/**
 * Search FT articles
 */
async function searchFT(query: string, limit: number = 20): Promise<Article[]> {
  const response = await fetch('/.netlify/functions/ft-scraper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'search', query, limit }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to search FT')
  }

  const articles: FTArticle[] = await response.json()

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    image: article.image,
    author: article.author,
    publishedAt: new Date(article.publishedAt),
    source: toArticleSource('finance'),
    topics: article.topics,
    country: 'GB',
  }))
}

/**
 * Hook for fetching FT news
 */
export function useFTNews(
  category: FTCategory = 'all',
  limit: number = 20,
  enabled = true
) {
  return useQuery({
    queryKey: ['ft-news', category, limit],
    queryFn: () => fetchFTNews(category, limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook for fetching MyFT personalized feed
 */
export function useMyFT(limit: number = 20, enabled = true) {
  return useQuery({
    queryKey: ['myft', limit],
    queryFn: () => fetchMyFT(limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook for searching FT articles
 */
export function useFTSearch(query: string, limit: number = 20, enabled = false) {
  return useQuery({
    queryKey: ['ft-search', query, limit],
    queryFn: () => searchFT(query, limit),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export { fetchFTNews, fetchMyFT, searchFT }
