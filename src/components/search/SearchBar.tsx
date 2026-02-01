import { useEffect } from 'react'
import { useSearchStore } from '../../stores/searchStore'
import clsx from 'clsx'

export default function SearchBar() {
  const { setOpen } = useSearchStore()

  const handleClick = () => {
    setOpen(true)
  }

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500',
        'border border-gray-300 rounded-lg bg-white',
        'hover:border-gray-400 hover:bg-gray-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent'
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span className="hidden sm:inline">Semantic search...</span>
      <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded border border-gray-200">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
