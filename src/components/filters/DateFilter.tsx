import { useFilterStore } from '../../stores/filterStore'
import type { DateRange } from '../../types/filters'
import clsx from 'clsx'

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

export default function DateFilter() {
  const { dateRange, setDateRange } = useFilterStore()

  return (
    <div className="flex items-center gap-1">
      {DATE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => setDateRange(option.value)}
          className={clsx(
            'px-3 py-1 text-xs font-medium rounded transition-colors',
            dateRange === option.value
              ? 'bg-ink-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
