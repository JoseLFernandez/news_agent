# News Aggregator - Project Context

## Overview
A React-based news aggregator with global intelligence features, built with Vite and deployed on Netlify.

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, React Query
- **Backend**: Netlify Functions (serverless)
- **APIs**: GDELT (news data), MyMemory (translation), Pinecone (semantic search)
- **Routing**: React Router v6

## Project Structure
```
src/
├── api/           # API hooks (React Query)
├── components/
│   ├── articles/  # Article display components
│   ├── filters/   # Topic and date filters
│   ├── global/    # Global intelligence widgets
│   ├── layout/    # Header, Sidebar, MainLayout
│   └── search/    # Search modal
├── config/        # Country configurations
├── hooks/         # Custom React hooks
├── pages/         # Route pages (HomePage, GlobalDashboard, TopicPage)
├── types/         # TypeScript type definitions
└── utils/         # Utility functions

netlify/functions/  # Serverless functions (.cjs files)
```

## Key Features

### Global News Tab (`/global`)
- **Components**: `GlobalDashboard.tsx`, `TrendingByCountry.tsx`, `RegulatoryRadar.tsx`, `EuropeMap.tsx`
- **API**: `global-intel.cjs` serverless function
- **Actions**:
  - `trending` - Fetches trending topics for a country from GDELT
  - `regulatory` - Fetches regulatory news for a country/topic
  - `trending-batch` - Returns pre-computed heat data for Europe map (optimized for speed)

### Language & Translation
- Language selector supports: EN, FR, DE, ES, IT, PT, NL, PL
- Each language has domain-specific news sources (e.g., lemonde.fr for French)
- Translation toggle uses MyMemory API to translate titles to English
- Original titles preserved in `article.originalTitle`

### Topic Categories
Valid `TrendingCategory` values: `technology`, `business`, `politics`, `science`, `culture`, `sports`

## Netlify Functions

| Function | Purpose |
|----------|---------|
| `global-intel.cjs` | Global trending, regulatory data, batch map data |
| `rss-proxy.cjs` | RSS feed proxy |
| `gdelt-proxy.cjs` | GDELT API proxy |
| `pinecone-search.cjs` | Semantic search via Pinecone |
| `ft-scraper.cjs` | Financial Times scraping |
| `finance-scraper.cjs` | Finance data scraping |

## Environment Variables
Required in `.env.local`:
- `PERPLEXITY_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_HOST`
- `FT_MYFT_RSS_URL`
- `FT_SESSION_COOKIE`

## Development Commands
```bash
npm run dev          # Start Vite dev server (port 5173)
npx netlify dev      # Start with Netlify functions (port 8888)
npm run build        # Production build
```

## Common Patterns

### GDELT Filtering
Articles are filtered for language using:
1. URL path patterns (e.g., `/afrique/`, `/mundo/`)
2. Character detection (non-Latin scripts)
3. Common word matching (language-specific)

### Category Priority
Articles are assigned ONE category based on priority order:
`politics > technology > business > science > sports > culture`

## Known Considerations
- GDELT has a 250 record limit per request
- Netlify functions have 30-second timeout
- Europe map uses pre-computed heat values (not real-time) for performance
- Translation limited to 5 articles per topic to avoid rate limits
