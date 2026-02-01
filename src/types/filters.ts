import type { ArticleSource } from './article'

export type DateRange = 'today' | 'week' | 'month' | 'all'
export type SortBy = 'date' | 'relevance'

export interface FilterState {
  selectedTopics: string[]
  dateRange: DateRange
  sortBy: SortBy
  sources: ArticleSource[]
  searchQuery: string
}

export interface FilterActions {
  setTopics: (topics: string[]) => void
  toggleTopic: (topic: string) => void
  setDateRange: (range: DateRange) => void
  setSortBy: (sort: SortBy) => void
  setSources: (sources: ArticleSource[]) => void
  toggleSource: (source: ArticleSource) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}
