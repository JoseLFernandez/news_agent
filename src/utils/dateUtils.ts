import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfDay,
  subWeeks,
  subMonths,
  parseISO,
  startOfDay as startOfDayFn,
} from 'date-fns'
import type { DateRange, DateRangeCustom } from '../types/filters'

/**
 * Format a date for display in article cards
 */
export function formatArticleDate(date: Date): string {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE') // Day name
  }

  if (isThisMonth(date)) {
    return format(date, 'MMM d')
  }

  return format(date, 'MMM d, yyyy')
}

/**
 * Format date for section headers
 */
export function formatSectionDate(date: Date): string {
  if (isToday(date)) {
    return "Today's Stories"
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  return format(date, 'EEEE, MMMM d')
}

/**
 * Get the start date for a date range filter
 */
export function getDateRangeStart(range: DateRange): Date | null {
  const now = new Date()

  switch (range) {
    case 'today':
      return startOfDay(now)
    case 'week':
      return subWeeks(now, 1)
    case 'month':
      return subMonths(now, 1)
    case 'all':
    case 'custom':
      return null
  }
}

export function isWithinCustomDateRange(
  date: Date,
  range: DateRangeCustom
): boolean {
  const start = startOfDayFn(parseISO(range.start))
  const end = startOfDayFn(parseISO(range.end))

  // If user picked them backwards, treat it as inclusive between.
  const min = start <= end ? start : end
  const max = start <= end ? end : start

  const day = startOfDayFn(date)
  return day >= min && day <= max
}

/**
 * Check if a date falls within a date range
 */
export function isWithinDateRange(date: Date, range: DateRange): boolean {
  const rangeStart = getDateRangeStart(range)

  if (!rangeStart) return true // 'all' and 'custom' handled elsewhere

  return date >= rangeStart
}

/**
 * Group articles by date for display
 */
export function groupByDate<T extends { publishedAt: Date }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const key = format(item.publishedAt, 'yyyy-MM-dd')
    const existing = groups.get(key) || []
    groups.set(key, [...existing, item])
  }

  return groups
}
