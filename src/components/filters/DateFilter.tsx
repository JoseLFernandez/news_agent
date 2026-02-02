import { useEffect, useMemo, useState } from 'react'
import { useFilterStore } from '../../stores/filterStore'
import type { DateRange } from '../../types/filters'
import clsx from 'clsx'

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Range' },
]

export default function DateFilter() {
  const { dateRange, dateRangeCustom, setDateRange, setDateRangeCustom } =
    useFilterStore()

  const [startValue, setStartValue] = useState(dateRangeCustom?.start || '')
  const [endValue, setEndValue] = useState(dateRangeCustom?.end || '')

  useEffect(() => {
    if (dateRangeCustom) {
      setStartValue(dateRangeCustom.start)
      setEndValue(dateRangeCustom.end)
    }
  }, [dateRangeCustom])

  const canClear = useMemo(
    () => dateRange === 'custom' || Boolean(dateRangeCustom),
    [dateRange, dateRangeCustom]
  )

  const updateCustom = (next: { start?: string; end?: string }) => {
    const start = next.start ?? startValue
    const end = next.end ?? endValue

    setDateRange('custom')

    if (start && end) {
      setDateRangeCustom({ start, end })
    } else {
      setDateRangeCustom(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        {DATE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() =>
              option.value === 'custom'
                ? setDateRange('custom')
                : setDateRange(option.value)
            }
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

      {dateRange === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startValue}
            onChange={(e) => {
              setStartValue(e.target.value)
              updateCustom({ start: e.target.value })
            }}
            className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-700"
            aria-label="Start date"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endValue}
            onChange={(e) => {
              setEndValue(e.target.value)
              updateCustom({ end: e.target.value })
            }}
            className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-700"
            aria-label="End date"
          />
          {canClear && (
            <button
              onClick={() => {
                setStartValue('')
                setEndValue('')
                setDateRangeCustom(null)
              }}
              className="text-xs text-gray-500 hover:text-ink-900"
              title="Clear range"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
