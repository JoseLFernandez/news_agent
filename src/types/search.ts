import type { Article } from './article'

export interface SearchResult extends Article {
  score: number
}

export interface SearchFilters {
  topics?: string[]
  sources?: string[]
  countries?: string[]
  dateFrom?: string  // ISO date string
  dateTo?: string    // ISO date string
}

export interface SemanticSearchState {
  query: string
  results: SearchResult[]
  isSearching: boolean
  error: string | null
  isOpen: boolean
}

export interface SearchActions {
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
  findSimilar: (articleId: string) => Promise<SearchResult[]>
  clearResults: () => void
  setOpen: (open: boolean) => void
}
