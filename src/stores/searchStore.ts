import { create } from 'zustand'
import type { SearchResult, SearchFilters } from '../types/search'
import { semanticSearch, findSimilarArticles } from '../api/search'

interface SearchStore {
  query: string
  results: SearchResult[]
  isSearching: boolean
  error: string | null
  isOpen: boolean
  recentSearches: string[]
  filters: SearchFilters

  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  search: (query: string, filters?: SearchFilters) => Promise<void>
  findSimilar: (articleId: string) => Promise<SearchResult[]>
  clearResults: () => void
  clearFilters: () => void
  setOpen: (open: boolean) => void
  addRecentSearch: (query: string) => void
}

const MAX_RECENT_SEARCHES = 5

const EMPTY_FILTERS: SearchFilters = {}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  error: null,
  isOpen: false,
  recentSearches: JSON.parse(localStorage.getItem('recent-searches') || '[]'),
  filters: EMPTY_FILTERS,

  setQuery: (query) => set({ query }),

  setFilters: (filters) => set({ filters }),

  search: async (query, filters) => {
    if (!query.trim()) {
      set({ results: [], error: null })
      return
    }

    const activeFilters = filters ?? get().filters
    set({ isSearching: true, error: null, query })

    try {
      const results = await semanticSearch(query, {
        topK: 15,
        filters: activeFilters,
        useHybrid: true,
        recencyBoost: true,
      })
      set({ results, isSearching: false })

      // Add to recent searches
      get().addRecentSearch(query)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Search failed',
        isSearching: false,
        results: [],
      })
    }
  },

  findSimilar: async (articleId) => {
    try {
      return await findSimilarArticles(articleId, 5)
    } catch (error) {
      console.error('Failed to find similar articles:', error)
      return []
    }
  },

  clearResults: () => set({ results: [], query: '', error: null }),

  clearFilters: () => set({ filters: EMPTY_FILTERS }),

  setOpen: (open) => set({ isOpen: open }),

  addRecentSearch: (query) => {
    const { recentSearches } = get()
    const trimmedQuery = query.trim()

    if (!trimmedQuery) return

    // Remove duplicate and add to front
    const updated = [
      trimmedQuery,
      ...recentSearches.filter((s) => s !== trimmedQuery),
    ].slice(0, MAX_RECENT_SEARCHES)

    localStorage.setItem('recent-searches', JSON.stringify(updated))
    set({ recentSearches: updated })
  },
}))
