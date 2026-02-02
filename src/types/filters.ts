import type { ArticleSource } from './article'

export type DateRange = 'today' | 'week' | 'month' | 'all' | 'custom'
export type SortBy = 'date' | 'relevance'

export type DateRangeCustom = {
  start: string // yyyy-MM-dd
  end: string // yyyy-MM-dd
}

export interface FilterState {
  selectedTopics: string[]
  dateRange: DateRange
  dateRangeCustom: DateRangeCustom | null
  sortBy: SortBy
  sources: ArticleSource[]
  searchQuery: string
}

export interface FilterActions {
  setTopics: (topics: string[]) => void
  toggleTopic: (topic: string) => void
  setDateRange: (range: DateRange) => void
  setDateRangeCustom: (range: DateRangeCustom | null) => void
  setSortBy: (sort: SortBy) => void
  setSources: (sources: ArticleSource[]) => void
  toggleSource: (source: ArticleSource) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}
