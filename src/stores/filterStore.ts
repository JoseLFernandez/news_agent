import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ArticleSource } from '../types/article'
import type { DateRange, SortBy, FilterState, FilterActions } from '../types/filters'

type FilterStore = FilterState & FilterActions

const initialState: FilterState = {
  selectedTopics: [],
  dateRange: 'week',
  sortBy: 'date',
  // Article list supports Medium + GDELT + Finance + FT; MyFT requires auth (enable manually); Perplexity is used for intel widgets/search.
  sources: ['medium', 'gdelt', 'finance', 'ft'],
  searchQuery: '',
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...initialState,

      setTopics: (topics: string[]) =>
        set({ selectedTopics: topics }),

      toggleTopic: (topic: string) =>
        set((state) => ({
          selectedTopics: state.selectedTopics.includes(topic)
            ? state.selectedTopics.filter((t) => t !== topic)
            : [...state.selectedTopics, topic],
        })),

      setDateRange: (range: DateRange) =>
        set({ dateRange: range }),

      setSortBy: (sort: SortBy) =>
        set({ sortBy: sort }),

      setSources: (sources: ArticleSource[]) =>
        set({ sources }),

      toggleSource: (source: ArticleSource) =>
        set((state) => ({
          sources: state.sources.includes(source)
            ? state.sources.filter((s) => s !== source)
            : [...state.sources, source],
        })),

      setSearchQuery: (query: string) =>
        set({ searchQuery: query }),

      resetFilters: () =>
        set(initialState),
    }),
    {
      name: 'news-filters',
      partialize: (state) => ({
        selectedTopics: state.selectedTopics,
        dateRange: state.dateRange,
        sortBy: state.sortBy,
        sources: state.sources,
      }),
    }
  )
)
