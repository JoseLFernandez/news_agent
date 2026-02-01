import { useState } from 'react'
import TrendingByCountry from '../components/global/TrendingByCountry'
import RegulatoryRadar from '../components/global/RegulatoryRadar'
import EuropeMap from '../components/global/EuropeMap'

export default function GlobalDashboard() {
  const [selectedMapCountry, setSelectedMapCountry] = useState<{
    code: string
    name: string
  } | null>(null)

  const handleCountryClick = (code: string, name: string) => {
    setSelectedMapCountry({ code, name })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="border-b-2 border-ink-900 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-900">
          Global Intelligence
        </h1>
        <p className="mt-1 text-gray-600">
          Real-time trending topics and regulatory tracking worldwide
        </p>
      </header>

      {/* Europe Map Section */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink-900">
            Europe Trending Map
          </h2>
          {selectedMapCountry && (
            <button
              onClick={() => setSelectedMapCountry(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          )}
        </div>
        <div className="p-4">
          <EuropeMap
            onCountryClick={handleCountryClick}
            selectedCountry={selectedMapCountry?.code}
          />
          {selectedMapCountry && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected: <strong>{selectedMapCountry.name}</strong> - See
                trending topics in the widget below or click another country.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <TrendingByCountry initialCountry={selectedMapCountry?.name} />

        {/* Regulatory Radar */}
        <RegulatoryRadar selectedCountry={selectedMapCountry?.name} />
      </div>

      {/* Info Footer */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        <p>
          Data powered by Perplexity AI • Updated every 5 minutes •{' '}
          <span className="text-accent-blue">
            Regulatory data is for informational purposes only
          </span>
        </p>
      </div>
    </div>
  )
}
