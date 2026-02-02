import { useQuery } from '@tanstack/react-query'
import type {
  TrendingResponse,
  RegulatoryResponse,
  RegulatoryTopic,
  TrendingBatchResponse,
} from '../types/globalIntel'

/**
 * Fetch trending topics for a country
 */
async function fetchTrendingTopics(
  countryName: string,
  language: string = 'en',
  translate: boolean = false
): Promise<TrendingResponse> {
  const response = await fetch('/.netlify/functions/global-intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'trending',
      countryName,
      language,
      translate,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch trending topics')
  }

  return response.json()
}

/**
 * Fetch regulatory intelligence for a country and topic
 */
async function fetchRegulatoryIntel(
  countryName: string,
  topic: RegulatoryTopic
): Promise<RegulatoryResponse> {
  const response = await fetch('/.netlify/functions/global-intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'regulatory',
      countryName,
      topic,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch regulatory data')
  }

  return response.json()
}

/**
 * Hook for trending topics by country
 */
export function useTrendingTopics(
  countryName: string,
  language: string = 'en',
  translate: boolean = false,
  enabled = true
) {
  return useQuery({
    queryKey: ['trending', countryName, language, translate],
    queryFn: () => fetchTrendingTopics(countryName, language, translate),
    enabled: enabled && countryName.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook for regulatory intelligence
 */
export function useRegulatoryIntel(
  countryName: string,
  topic: RegulatoryTopic,
  enabled = true
) {
  return useQuery({
    queryKey: ['regulatory', countryName, topic],
    queryFn: () => fetchRegulatoryIntel(countryName, topic),
    enabled: enabled && countryName.length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes (regulatory data changes less frequently)
    gcTime: 1000 * 60 * 60, // 1 hour
  })
}

/**
 * Fetch trending topics for multiple countries (for Europe map)
 */
async function fetchTrendingBatch(countryNames: string[]): Promise<TrendingBatchResponse> {
  const response = await fetch('/.netlify/functions/global-intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'trending-batch',
      countryNames,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to fetch batch trending')
  }

  return response.json()
}

/**
 * Hook for batch trending data (Europe map)
 */
export function useEuropeTrending(countryNames: string[], enabled = true) {
  return useQuery({
    queryKey: ['trending-batch', ...countryNames],
    queryFn: () => fetchTrendingBatch(countryNames),
    enabled: enabled && countryNames.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

export { fetchTrendingTopics, fetchRegulatoryIntel, fetchTrendingBatch }
