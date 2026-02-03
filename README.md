# Ball News

A modern news intelligence platform combining news aggregation, bias analysis, and global trending intelligence across multiple sources.

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- TanStack React Query for data fetching
- Zustand for state management
- React Router for navigation

**Backend:**
- FastAPI (Python) for API services
- Pinecone for vector search and similarity
- Serverless: Netlify Functions (Node.js)
- Docker support for local development

**Data Sources:**
- GDELT (global news events)
- Financial Times
- Medium articles
- GitHub trending repositories
- Finance news feeds

## Features

### News Aggregation & Views
- **Home feed** with topic-based filtering
- **Date range filtering** (between dates selector)
- **Grid and Timeline views** for article browsing
- **Language filtering** for international news

### Intelligent Analysis
- **Story clustering** - Group related articles using semantic similarity
- **Bias analysis** - Detect and visualize bias in news coverage
- **Headline comparison** - Compare how different outlets cover the same story
- **Sentiment analysis** - Gauge article sentiment with visual indicators
- **Perspective generation** - Generate global perspectives on news topics

### Global Intelligence Dashboard (`/global`)
- **Trending topics by country** with interactive selection
- **Regulatory radar** - Track emerging regulations and policy changes
- **Europe heat map** - Visualize trending topics across European countries
- **Multi-language support** with local/any language toggle

### Additional Features
- **GitHub Dashboard** (`/github`) - Browse trending repositories by topic
- **Sources page** (`/sources`) - Curated links to security and dev news
- **Semantic search** - Search articles using vector similarity
- **Auto-indexing** - Automatically index articles to Pinecone for search

## Project Structure

```
src/                          # Frontend React application
  api/                        # API client and React Query hooks
  components/
    articles/                 # Article display components (cards, grids, timeline)
    bias/                     # Bias analysis UI (sentiment gauge, headline comparison)
    filters/                  # Filtering controls (topic, date, language)
    global/                   # Global intelligence widgets
    github/                   # GitHub trending components
    layout/                   # App layout and navigation
    search/                   # Search modal
  pages/                      # Route pages (Home, Topic, Global, GitHub, Sources)
  stores/                     # Zustand state stores
  types/                      # TypeScript type definitions
  utils/                      # Utility functions

backend/                      # Python FastAPI backend
  app/
    api/                      # API routes and models
    core/                     # Configuration
    services/                 # Business logic services
      bias_analyzer.py        # Bias detection service
      clustering.py           # Article clustering algorithms
      global_perspective.py   # Global perspective generation
      perspective_generator.py # Perspective text generation
      pinecone_search.py      # Vector search integration
      story_cluster.py        # Story clustering service
    utils/                    # Utility functions

netlify/functions/            # Serverless functions (.cjs)
  finance-scraper.cjs         # Finance news scraping
  ft-scraper.cjs              # Financial Times integration
  gdelt-proxy.cjs             # GDELT API proxy
  github-topics.cjs           # GitHub trending topics
  global-intel.cjs            # Global intelligence data
  pinecone-search.cjs         # Pinecone search proxy
  rss-proxy.cjs               # RSS feed proxy
```

## Getting Started (local)

```bash
npm install
npm run dev
```

For Netlify functions locally:

```bash
npx netlify dev
```

## Docker

Run the app (SPA + functions router) on http://localhost:3030:

```bash
docker compose up --build
```

To force a fresh image build (useful when UI changes aren’t showing up):

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

## Environment Variables

Create a `.env.local` file in the project root to enable optional integrations:

```bash
# Perplexity API for enhanced search
PERPLEXITY_API_KEY=your_api_key_here

# Pinecone for vector search and similarity matching
PINECONE_API_KEY=your_api_key_here
PINECONE_INDEX_HOST=your_index_host_here

# Financial Times integration
FT_MYFT_RSS_URL=your_ft_rss_url
FT_SESSION_COOKIE=your_ft_cookie
```

## Available Scripts

```bash
npm run dev       # Start development server (Vite)
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## API Endpoints

### FastAPI Backend
- `POST /api/global-perspective` - Generate global perspectives on news topics

### Netlify Functions
- `/.netlify/functions/gdelt-proxy` - Proxy to GDELT API
- `/.netlify/functions/pinecone-search` - Vector search interface
- `/.netlify/functions/finance-scraper` - Finance news aggregation
- `/.netlify/functions/ft-scraper` - Financial Times articles
- `/.netlify/functions/github-topics` - GitHub trending data
- `/.netlify/functions/global-intel` - Global intelligence data
- `/.netlify/functions/rss-proxy` - Generic RSS feed proxy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
