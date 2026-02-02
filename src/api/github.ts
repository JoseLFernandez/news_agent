import { useQuery } from '@tanstack/react-query'
import type {
  GitHubTopic,
  GitHubRepository,
  GitHubRateLimit,
  GitHubTopicsResponse,
  GitHubReposResponse
} from '../types/github'

const API_BASE = '/.netlify/functions/github-topics'

async function fetchGitHubAPI<T>(params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`${API_BASE}?${searchParams}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Failed to fetch GitHub data')
  }

  return response.json()
}

export function useGitHubTopics(query: string = '') {
  return useQuery({
    queryKey: ['github', 'topics', query],
    queryFn: () => fetchGitHubAPI<GitHubTopicsResponse>({
      action: 'search-topics',
      query
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function useGitHubReposByTopic(
  topic: string,
  sort: 'stars' | 'forks' | 'updated' = 'stars',
  page: number = 1
) {
  return useQuery({
    queryKey: ['github', 'repos', topic, sort, page],
    queryFn: () => fetchGitHubAPI<GitHubReposResponse>({
      action: 'get-repos',
      topic,
      sort,
      page: String(page)
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!topic
  })
}

export function useGitHubTrending(since: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  return useQuery({
    queryKey: ['github', 'trending', since],
    queryFn: () => fetchGitHubAPI<GitHubReposResponse>({
      action: 'trending',
      since
    }),
    staleTime: 1000 * 60 * 10, // 10 minutes for trending
    refetchOnWindowFocus: false
  })
}

export type { GitHubTopic, GitHubRepository, GitHubRateLimit }
