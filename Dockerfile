# Use official Node.js image for frontend and backend
# Using slim (Debian-based) instead of Alpine for glibc compatibility with Deno/Edge Functions

FROM node:20-slim AS base
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --legacy-peer-deps

# Copy all source code (including .env if present)
COPY . .


# If .env.local exists, copy it
RUN if [ -f .env.local ]; then cp .env.local .env.production; fi


# Ensure netlify/functions has package.json and install rss-parser for Netlify CLI
RUN cd netlify/functions && [ ! -f package.json ] && npm init -y; npm install rss-parser

# Build frontend (Vite)
RUN npm run build

# Install backend Python dependencies
FROM python:3.11-slim AS backend
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./

# Final image: serve built frontend + lightweight functions router
FROM node:20-slim AS final
WORKDIR /app

# Copy built frontend + functions
COPY --from=base /app/dist ./dist
COPY --from=base /app/netlify ./netlify
COPY --from=backend /app/backend ./backend

# Minimal deps for functions + static serve
RUN npm install -g serve && npm install express rss-parser

EXPOSE 3030

CMD ["node", "./backend/docker-functions-server.cjs"]
