import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import SearchBar from '../search/SearchBar'
import LanguageFilter from '../filters/LanguageFilter'

export default function Header() {
  const todayLong = format(new Date(), 'EEEE, MMMM d, yyyy')
  const todayShort = format(new Date(), 'MMM d, yyyy')

  return (
    <header className="border-b-2 border-ink-900 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top bar with date and language */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-500 mb-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{todayLong}</span>
            <span className="sm:hidden">{todayShort}</span>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <LanguageFilter />
          </div>
        </div>

        {/* Logo / Title */}
        <div className="text-center border-y border-gray-200 py-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Ball News"
              className="h-10 w-10"
            />
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-ink-900">
              Ball News
            </h1>
          </Link>
          <p className="mt-1 text-sm text-gray-600">
            Curated from Medium & Perplexity
          </p>
        </div>

        {/* Navigation + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3">
          <nav className="flex justify-center md:justify-start flex-wrap gap-4 md:gap-6 text-sm font-semibold uppercase tracking-wide">
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
            to="/github"
            className="text-gray-600 hover:text-ink-900 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </Link>
          <Link
            to="/sources"
            className="text-gray-600 hover:text-ink-900 transition-colors"
          >
            Sources
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
          <div className="flex justify-center md:justify-end">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  )
}
