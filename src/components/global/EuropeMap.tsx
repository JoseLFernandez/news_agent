import { useState, useMemo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import { useEuropeTrending } from '../../api/globalIntel'
import { getCountriesByRegion, getCountry } from '../../config/countries'
import { EUROPE_MAP_CONFIG, ISO_NUMERIC_TO_ALPHA2 } from '../../config/europeGeo'
import type { TrendingTopic } from '../../types/globalIntel'

// World TopoJSON URL (we filter to Europe)
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'

// Heat color scale: gray → amber → orange → red
const heatColorScale = scaleLinear<string>()
  .domain([0, 0.3, 0.5, 0.7, 1])
  .range(['#e5e7eb', '#fef3c7', '#fcd34d', '#f97316', '#dc2626'])

interface EuropeMapProps {
  onCountryClick?: (countryCode: string, countryName: string) => void
  selectedCountry?: string | null
  className?: string
}

interface TooltipState {
  show: boolean
  x: number
  y: number
  countryCode: string
  countryName: string
  topTopic?: TrendingTopic
  heat: number
}

export default function EuropeMap({
  onCountryClick,
  selectedCountry,
  className = '',
}: EuropeMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    countryCode: '',
    countryName: '',
    heat: 0,
  })
  const [zoom, setZoom] = useState(1)

  // Get all European country names for batch fetch
  const europeCountries = useMemo(() => getCountriesByRegion('europe'), [])
  const countryNames = useMemo(
    () => europeCountries.map((c) => c.name),
    [europeCountries]
  )

  // Fetch trending data for all European countries
  const { data: trendingData, isLoading } = useEuropeTrending(countryNames)

  // Get heat value for a country (by name or code)
  const getCountryHeat = (countryName: string): number => {
    if (!trendingData) return 0
    return trendingData[countryName]?.heat || 0
  }

  // Get top topic for a country
  const getTopTopic = (countryName: string): TrendingTopic | undefined => {
    if (!trendingData) return undefined
    return trendingData[countryName]?.topics?.[0]
  }

  // Convert ISO numeric code to alpha-2
  const numericToAlpha2 = (numericCode: string): string | undefined => {
    return ISO_NUMERIC_TO_ALPHA2[numericCode]
  }

  // Handle mouse move for tooltip
  const handleMouseMove = (
    event: React.MouseEvent,
    geo: any
  ) => {
    const numericCode = geo.id
    const alpha2Code = numericToAlpha2(numericCode)
    if (!alpha2Code) return

    const country = getCountry(alpha2Code)
    if (!country) return

    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      countryCode: alpha2Code,
      countryName: country.name,
      topTopic: getTopTopic(country.name),
      heat: getCountryHeat(country.name),
    })
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }))
  }

  const handleClick = (geo: any) => {
    const numericCode = geo.id
    const alpha2Code = numericToAlpha2(numericCode)
    if (!alpha2Code) return

    const country = getCountry(alpha2Code)
    if (!country) return

    onCountryClick?.(alpha2Code, country.name)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.5, 4))}
          className="w-8 h-8 bg-white rounded shadow border border-gray-200 hover:bg-gray-50 text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          className="w-8 h-8 bg-white rounded shadow border border-gray-200 hover:bg-gray-50 text-lg font-bold"
        >
          -
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Loading trending data...
          </div>
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: EUROPE_MAP_CONFIG.center,
          scale: EUROPE_MAP_CONFIG.scale,
        }}
        style={{ width: '100%', height: '400px' }}
      >
        <ZoomableGroup zoom={zoom} center={EUROPE_MAP_CONFIG.center}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies
                .filter((geo: any) => {
                  // Only show European countries
                  const alpha2 = numericToAlpha2(geo.id)
                  return alpha2 && getCountry(alpha2)?.region === 'europe'
                })
                .map((geo: any) => {
                  const alpha2 = numericToAlpha2(geo.id)
                  const country = alpha2 ? getCountry(alpha2) : null
                  const heat = country ? getCountryHeat(country.name) : 0
                  const isSelected = selectedCountry === alpha2

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseMove={(e: React.MouseEvent) => handleMouseMove(e, geo)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                      style={{
                        default: {
                          fill: heatColorScale(heat),
                          stroke: isSelected ? '#1d4ed8' : '#94a3b8',
                          strokeWidth: isSelected ? 1.5 : 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: heatColorScale(Math.min(heat + 0.2, 1)),
                          stroke: '#1d4ed8',
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: heatColorScale(heat),
                          stroke: '#1d4ed8',
                          strokeWidth: 1.5,
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
        <span>Low activity</span>
        <div className="flex">
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <div
              key={v}
              className="w-6 h-4"
              style={{ backgroundColor: heatColorScale(v) }}
            />
          ))}
        </div>
        <span>High activity</span>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            maxWidth: '250px',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {getCountry(tooltip.countryCode)?.flag}
            </span>
            <span className="font-semibold text-gray-900">
              {tooltip.countryName}
            </span>
          </div>

          {/* Heat bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">Activity:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-3 rounded-sm ${
                    tooltip.heat >= i / 5
                      ? 'bg-orange-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Top topic */}
          {tooltip.topTopic && (
            <div className="text-xs">
              <span className="text-gray-500">Top topic: </span>
              <span className="text-gray-700">{tooltip.topTopic.title}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
