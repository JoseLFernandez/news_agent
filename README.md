# Ball News

A modern news aggregator with a **timeline view**, **date-range filtering**, and a **Global Intelligence** dashboard.

- Frontend: React 18 + TypeScript + Vite + Tailwind
- Data: GDELT (news), plus additional sources (Medium/FT/Finance)
- Serverless: Netlify Functions (also runnable in Docker)

## Features

- **Home feed** with topic filters, date range (including an inclusive *between dates* selector), and Grid/Timeline views
- **Global Intelligence** (`/global`): trending topics by country + regulatory radar + Europe heat map
- **Language filtering**
  - **Header** language dropdown controls the main feed language (currently applied to the GDELT source)
  - Global Intelligence has its own language selector (includes **Local / Any language**)
- **Docker-ready**: `docker compose up` runs the built SPA and routes `/.netlify/functions/*` to the bundled Netlify Functions

## Project Structure

```
src/
  api/           React Query hooks
  components/
    articles/    Article UI (grid/timeline)
    filters/     Topic/date/language filters
    global/      Global intelligence widgets
    layout/      Header/Sidebar/MainLayout
    search/      Search modal
  pages/         Routes (Home, Topic, Global, GitHub)
netlify/functions/  Netlify Functions (.cjs)
backend/             Local/Docker function router server
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

Create `.env.local` if you want to enable optional integrations:

- `PERPLEXITY_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_HOST`
- `FT_MYFT_RSS_URL`
- `FT_SESSION_COOKIE`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
