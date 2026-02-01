import { useQuery } from '@tanstack/react-query'
import type { Article, RSSFeed, RSSFeedItem } from '../types/article'
import { getFeedsForTopics } from '../config/sources'
import {
  extractFirstImage,
  extractSummary,
  estimateReadTime,
} from '../utils/imageExtractor'

/**
 * Fetch and parse a Medium RSS feed via our proxy
 */
async function fetchMediumFeed(feedUrl: string): Promise<RSSFeed> {
  const proxyUrl = `/.netlify/functions/rss-proxy?url=${encodeURIComponent(feedUrl)}`

  const response = await fetch(proxyUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Transform an RSS feed item into our Article format
 */
function transformRSSItem(item: RSSFeedItem, feedTopics: string[]): Article {
  const content = item.content || item.contentSnippet || ''

  return {
    id: item.id || item.link,
    title: item.title || 'Untitled',
    summary: extractSummary(content, 200),
    content,
    url: item.link,
    image: extractFirstImage(content) || item.enclosure?.url,
    author: item.creator,
    publishedAt: new Date(item.pubDate),
    source: 'medium',
    topics: item.categories.length > 0
      ? item.categories.map(c => c.toLowerCase())
      : feedTopics,
    readTime: estimateReadTime(content),
  }
}

/**
 * Fetch all Medium articles for given topics
 */
async function fetchMediumArticles(topics: string[]): Promise<Article[]> {
  const feeds = getFeedsForTopics(topics)

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const rss = await fetchMediumFeed(feed.url)
      return rss.items.map((item) => transformRSSItem(item, feed.topics))
    })
  )

  const articles: Article[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      console.warn('Failed to fetch feed:', result.reason)
    }
  }

  // Deduplicate by ID and sort by date
  const seen = new Set<string>()
  const unique = articles.filter((article) => {
    if (seen.has(article.id)) return false
    seen.add(article.id)
    return true
  })

  return unique.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  )
}

/**
 * React Query hook for fetching Medium articles
 */
export function useMediumArticles(topics: string[] = []) {
  return useQuery({
    queryKey: ['medium', 'articles', topics.sort().join(',')],
    queryFn: () => fetchMediumArticles(topics),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
