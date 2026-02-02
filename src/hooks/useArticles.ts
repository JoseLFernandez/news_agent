import { useMemo } from 'react'
import { useMediumArticles } from '../api/medium'
import { useGdeltArticles } from '../api/gdelt'
import { useFinanceNews } from '../api/finance'
import { useFTNews, useMyFT } from '../api/ft'
import { useFilterStore } from '../stores/filterStore'
import { isWithinCustomDateRange, isWithinDateRange } from '../utils/dateUtils'
import type { Article } from '../types/article'

interface UseArticlesResult {
  articles: Article[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Combined hook that fetches, filters, and sorts articles from all sources
 */
export function useArticles(): UseArticlesResult {
  const { selectedTopics, dateRange, dateRangeCustom, sortBy, sources, language } = useFilterStore()

  // Fetch from all sources
  const mediumQuery = useMediumArticles(selectedTopics)
  const gdeltQuery = useGdeltArticles(selectedTopics, language)
  const financeQuery = useFinanceNews('all', 30, sources.includes('finance'))
  const ftQuery = useFTNews('all', 20, sources.includes('ft'))
  const myftQuery = useMyFT(20, sources.includes('myft'))

  // Combine loading states
  const isLoading =
    (sources.includes('medium') && mediumQuery.isLoading) ||
    (sources.includes('gdelt') && gdeltQuery.isLoading) ||
    (sources.includes('finance') && financeQuery.isLoading) ||
    (sources.includes('ft') && ftQuery.isLoading) ||
    (sources.includes('myft') && myftQuery.isLoading)

  // Combine error states
  const isError =
    (sources.includes('medium') && mediumQuery.isError) ||
    (sources.includes('gdelt') && gdeltQuery.isError) ||
    (sources.includes('finance') && financeQuery.isError) ||
    (sources.includes('ft') && ftQuery.isError) ||
    (sources.includes('myft') && myftQuery.isError)

  const error =
    (sources.includes('medium') ? (mediumQuery.error as Error | null) : null) ||
    (sources.includes('gdelt') ? (gdeltQuery.error as Error | null) : null) ||
    (sources.includes('finance') ? (financeQuery.error as Error | null) : null) ||
    (sources.includes('ft') ? (ftQuery.error as Error | null) : null) ||
    (sources.includes('myft') ? (myftQuery.error as Error | null) : null)

  // Combine and process articles
  const articles = useMemo(() => {
    const allArticles: Article[] = []

    // Add Medium articles if source is enabled
    if (sources.includes('medium') && mediumQuery.data) {
      allArticles.push(...mediumQuery.data)
    }

    if (sources.includes('gdelt') && gdeltQuery.data) {
      allArticles.push(...gdeltQuery.data)
    }

    // Add finance articles if source is enabled
    if (sources.includes('finance') && financeQuery.data) {
      allArticles.push(...financeQuery.data)
    }

    // Add FT articles if source is enabled
    if (sources.includes('ft') && ftQuery.data) {
      allArticles.push(...ftQuery.data)
    }

    // Add MyFT articles if source is enabled
    if (sources.includes('myft') && myftQuery.data) {
      allArticles.push(...myftQuery.data)
    }

    // Filter by date range
    const filtered = allArticles.filter((article) => {
      if (dateRange === 'custom' && dateRangeCustom) {
        return isWithinCustomDateRange(article.publishedAt, dateRangeCustom)
      }
      return isWithinDateRange(article.publishedAt, dateRange)
    })

    // Filter by selected topics (if any)
    const topicFiltered =
      selectedTopics.length > 0
        ? filtered.filter((article) =>
            article.topics.some((t) =>
              selectedTopics.includes(t.toLowerCase())
            )
          )
        : filtered

    // Sort articles
    return topicFiltered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.publishedAt.getTime() - a.publishedAt.getTime()
      }
      // For relevance, prioritize articles with more matching topics
      const aMatchCount = a.topics.filter((t) =>
        selectedTopics.includes(t)
      ).length
      const bMatchCount = b.topics.filter((t) =>
        selectedTopics.includes(t)
      ).length
      return bMatchCount - aMatchCount
    })
  }, [mediumQuery.data, gdeltQuery.data, financeQuery.data, ftQuery.data, myftQuery.data, sources, dateRange, dateRangeCustom, selectedTopics, sortBy, language])

  const refetch = () => {
    mediumQuery.refetch()
    gdeltQuery.refetch()
    financeQuery.refetch()
    ftQuery.refetch()
    myftQuery.refetch()
  }

  return {
    articles,
    isLoading,
    isError,
    error,
    refetch,
  }
}

/**
 * Hook to get featured articles (top 5 by date)
 */
export function useFeaturedArticles() {
  const { articles, isLoading, isError } = useArticles()

  const featured = useMemo(() => {
    return articles.slice(0, 5)
  }, [articles])

  return { featured, isLoading, isError }
}

/**
 * Hook to get articles grouped by topic
 */
export function useArticlesByTopic() {
  const { articles, isLoading, isError } = useArticles()

  const grouped = useMemo(() => {
    const map = new Map<string, Article[]>()

    for (const article of articles) {
      for (const topic of article.topics) {
        const existing = map.get(topic) || []
        if (!existing.some((a) => a.id === article.id)) {
          map.set(topic, [...existing, article])
        }
      }
    }

    return map
  }, [articles])

  return { grouped, isLoading, isError }
}
