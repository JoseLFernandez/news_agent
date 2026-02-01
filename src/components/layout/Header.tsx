import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import SearchBar from '../search/SearchBar'

export default function Header() {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <header className="border-b-2 border-ink-900 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top bar with date and search */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <span>{today}</span>
          <SearchBar />
        </div>

        {/* Logo / Title */}
        <div className="text-center border-y border-gray-200 py-4">
          <Link to="/" className="inline-block">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-ink-900">
              The Daily Brief
            </h1>
          </Link>
          <p className="mt-1 text-sm text-gray-600">
            Curated from Medium & Perplexity
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center flex-wrap gap-4 md:gap-6 mt-4 text-sm font-semibold uppercase tracking-wide">
          <Link
            to="/"
            className="text-ink-900 hover:text-accent-red transition-colors"
          >
            Home
          </Link>
          <Link
            to="/global"
            className="text-accent-blue hover:text-ink-900 transition-colors flex items-center gap-1"
          >
            <span>🌍</span> Global
          </Link>
          <Link
            to="/topic/technology"
            className="text-gray-600 hover:text-ink-900 transition-colors"
          >
            Technology
          </Link>
          <Link
            to="/topic/ai"
            className="text-gray-600 hover:text-ink-900 transition-colors"
          >
            AI
          </Link>
          <Link
            to="/topic/programming"
            className="text-gray-600 hover:text-ink-900 transition-colors"
          >
            Programming
          </Link>
          <Link
            to="/topic/business"
            className="text-gray-600 hover:text-ink-900 transition-colors"
          >
            Business
          </Link>
        </nav>
      </div>
    </header>
  )
}
