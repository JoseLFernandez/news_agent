import { useQuery } from '@tanstack/react-query'
import type { Article } from '../types/article'

interface GdeltProxyResponse {
  articles: Array<{
    url: string
    title: string
    seendate: string
    socialimage?: string
    domain?: string
    language?: string
    sourcecountry?: string
  }>
}

function inferTopicsFromText(text: string): string[] {
  const t = text.toLowerCase()
  const topics: string[] = []
  if (/(ai|artificial intelligence|llm|model|openai|anthropic)/.test(t)) topics.push('ai')
  if (/(startup|venture|funding|series [a-z]|seed round)/.test(t)) topics.push('startups')
  if (/(programming|typescript|javascript|python|react|node\.js)/.test(t)) topics.push('programming')
  if (/(design|ux|ui)/.test(t)) topics.push('design')
  if (/(business|earnings|market|stocks)/.test(t)) topics.push('business')
  if (/(science|research|study)/.test(t)) topics.push('science')
  return topics.length ? topics : ['technology']
}

async function fetchGdeltArticles(query: string, maxrecords = 50): Promise<Article[]> {
  const url = `/.netlify/functions/gdelt-proxy?query=${encodeURIComponent(query)}&maxrecords=${maxrecords}`
  const resp = await fetch(url)
  const text = await resp.text()

  let data: GdeltProxyResponse
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(text || 'Failed to fetch GDELT')
  }

  if (!resp.ok) {
    throw new Error((data as any)?.error || 'Failed to fetch GDELT')
  }

  return (data.articles || []).map((a) => {
    const title = a.title || 'Untitled'
    // Ensure publishedAt is always a valid Date object
    let publishedAt: Date
    if (a.seendate) {
      // Robust parse for GDELT seendate (YYYYMMDDTHHmmssZ)
      const match = a.seendate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
      if (match) {
        const [_, y, m, d, h, min, s] = match;
        const iso = `${y}-${m}-${d}T${h}:${min}:${s}Z`;
        publishedAt = new Date(iso);
      } else {
        const fallback = new Date(a.seendate)
        publishedAt = isNaN(fallback.getTime()) ? new Date() : fallback
      }
    } else {
      publishedAt = new Date()
    }
    return {
      id: a.url,
      title,
      summary: a.domain ? `Source: ${a.domain}` : 'From global news sources',
      url: a.url,
      image: a.socialimage,
      publishedAt,
      source: 'gdelt',
      topics: inferTopicsFromText(title),
      country: a.sourcecountry,
    }
  })
}

export function useGdeltArticles(topicFilters: string[] = []) {
  const query = topicFilters.length === 0
    ? '(technology OR business OR science)'
    : topicFilters.length === 1
      ? topicFilters[0]
      : `(${topicFilters.join(' OR ')})`

  return useQuery({
    queryKey: ['gdelt', 'articles', query],
    queryFn: () => fetchGdeltArticles(query, 50),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export { fetchGdeltArticles }
