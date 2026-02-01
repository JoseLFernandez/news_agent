import { useQuery } from '@tanstack/react-query'
import type { PerplexityResponse } from '../types/article'

interface PerplexitySearchResult {
  content: string
  citations: string[]
  relatedQuestions: string[]
}

/**
 * Search Perplexity for news on a topic
 */
async function searchPerplexity(query: string): Promise<PerplexitySearchResult> {
  const response = await fetch('/.netlify/functions/perplexity-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Perplexity search failed')
  }

  const data: PerplexityResponse = await response.json()

  return {
    content: data.choices?.[0]?.message?.content || '',
    citations: data.citations || [],
    relatedQuestions: data.related_questions || [],
  }
}

/**
 * Search for news on a specific topic
 */
async function searchTopicNews(topic: string): Promise<PerplexitySearchResult> {
  const response = await fetch('/.netlify/functions/perplexity-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Perplexity search failed')
  }

  const data: PerplexityResponse = await response.json()

  return {
    content: data.choices?.[0]?.message?.content || '',
    citations: data.citations || [],
    relatedQuestions: data.related_questions || [],
  }
}

/**
 * React Query hook for Perplexity search
 */
export function usePerplexitySearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['perplexity', 'search', query],
    queryFn: () => searchPerplexity(query),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * React Query hook for Perplexity topic news
 */
export function usePerplexityTopicNews(topic: string, enabled = true) {
  return useQuery({
    queryKey: ['perplexity', 'topic', topic],
    queryFn: () => searchTopicNews(topic),
    enabled: enabled && topic.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export { searchPerplexity, searchTopicNews }
