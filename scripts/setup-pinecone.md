# Pinecone Setup Guide

## 1. Create a Pinecone Account
1. Go to [pinecone.io](https://www.pinecone.io)
2. Sign up for a free account
3. Get your API key from the dashboard

## 2. Create the Index

You can create the index using the Pinecone console or API. The index needs **integrated inference** for automatic embeddings.

### Option A: Using Pinecone Console
1. Go to your Pinecone dashboard
2. Click "Create Index"
3. Select "Integrated Inference" option
4. Configure:
   - **Name**: `news-articles`
   - **Embedding Model**: `multilingual-e5-large` (or `llama-text-embed-v2`)
   - **Field Map**: `text` (this is the field that gets embedded)
   - **Cloud/Region**: Choose closest to your users (e.g., AWS us-east-1)

### Option B: Using Pinecone API (via curl)

```bash
export PINECONE_API_KEY="your-api-key"

curl -X POST "https://api.pinecone.io/indexes" \
  -H "Api-Key: $PINECONE_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Pinecone-API-Version: 2025-01" \
  -d '{
    "name": "news-articles",
    "spec": {
      "serverless": {
        "cloud": "aws",
        "region": "us-east-1"
      }
    },
    "embed": {
      "model": "multilingual-e5-large",
      "field_map": {
        "text": "text"
      }
    }
  }'
```

## 3. Get the Index Host

After creating the index, get the host URL:

```bash
curl -X GET "https://api.pinecone.io/indexes/news-articles" \
  -H "Api-Key: $PINECONE_API_KEY" \
  -H "X-Pinecone-API-Version: 2025-01"
```

The response will include a `host` field like:
```json
{
  "name": "news-articles",
  "host": "news-articles-xxxxxx.svc.aped-xxxx-xxxx.pinecone.io",
  ...
}
```

## 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
PERPLEXITY_API_KEY=pplx-xxxxx
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_HOST=https://news-articles-xxxxxx.svc.aped-xxxx-xxxx.pinecone.io
```

## 5. Deploy to Netlify

When deploying, add these environment variables in Netlify's dashboard:
- Settings → Environment Variables → Add variable

## 6. Test the Search

1. Run the app locally: `netlify dev`
2. Wait for articles to load (they auto-index to Pinecone)
3. Press `Cmd+K` (or `Ctrl+K`) to open search
4. Try queries like:
   - "AI regulation in Europe"
   - "React performance optimization"
   - "LLM inference techniques"

## Troubleshooting

### "Pinecone API key not configured"
- Make sure `PINECONE_API_KEY` is set in `.env.local`
- Restart the dev server after adding env vars

### "Pinecone index host not configured"
- Make sure `PINECONE_INDEX_HOST` is set
- The host should include the full URL with `https://`

### Search returns no results
- Articles need to be indexed first (happens automatically when loaded)
- Check browser console for indexing errors
- Wait a few seconds after articles load for indexing to complete
