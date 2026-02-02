exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { action, query, topK = 10, filters, useHybrid, recencyBoost } = body;

    console.log('Pinecone search request:', { action, query, topK, filters });

    // Get Pinecone credentials from environment
    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
    const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST;

    // If no action specified but query exists, default to search
    const searchAction = action || (query ? 'search' : null);

    if (!searchAction) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing action or query parameter' })
      };
    }

    // Temporarily disable Pinecone functionality due to API endpoint issues
    console.log('Pinecone functionality temporarily disabled');
    if (searchAction === 'search') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: [] })
      };
    } else if (searchAction === 'similar') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    } else if (searchAction === 'upsert' || searchAction === 'index' || searchAction === 'bulk-index') {
      const { articles, article } = body;
      const count = articles?.length || (article ? 1 : 0);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upserted: count, success: true, indexed: count })
      };
    }
    
    /* Disabled until API endpoint is fixed
    if (!PINECONE_API_KEY || !PINECONE_INDEX_HOST) {
      console.warn('Pinecone not configured - returning empty results');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchAction === 'search' ? { matches: [] } : searchAction === 'similar' ? [] : { upserted: 0 })
      };
    }
    */

    // Helper to generate embeddings using Pinecone's inference API
    async function generateEmbedding(text) {
      const embeddingResponse = await fetch('https://api.pinecone.io/inference/embed', {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
          'X-Pinecone-API-Version': '2024-10'
        },
        body: JSON.stringify({
          model: 'multilingual-e5-large',
          parameters: {
            input_type: 'passage',
            truncate: 'END'
          },
          inputs: [{ text: text }]
        })
      });

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        console.error('Embedding API error:', errorText);
        throw new Error(`Embedding generation failed: ${embeddingResponse.statusText}`);
      }

      const embeddingData = await embeddingResponse.json();
      return embeddingData.data[0].values;
    }

    if (searchAction === 'search') {
      // Semantic search using Pinecone
      const embedding = await generateEmbedding(query);
      
      const searchResponse = await fetch(`${PINECONE_INDEX_HOST}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector: embedding,
          topK: topK,
          includeMetadata: true,
          filter: filters || {}
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`Pinecone search failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      const matches = (searchData.matches || []).map(match => ({
        id: match.id,
        score: match.score,
        ...match.metadata
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches })
      };
    } else if (searchAction === 'similar') {
      // Find similar articles by ID
      const { articleId } = body;
      
      // Fetch the article vector from Pinecone
      const fetchResponse = await fetch(`${PINECONE_INDEX_HOST}/vectors/fetch?ids=${articleId}`, {
        method: 'GET',
        headers: {
          'Api-Key': PINECONE_API_KEY
        }
      });

      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch article: ${fetchResponse.statusText}`);
      }

      const fetchData = await fetchResponse.json();
      const vector = fetchData.vectors?.[articleId]?.values;

      if (!vector) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([])
        };
      }

      // Search for similar articles
      const searchResponse = await fetch(`${PINECONE_INDEX_HOST}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector: vector,
          topK: topK + 1, // +1 to exclude the article itself
          includeMetadata: true
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`Similar search failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      const matches = (searchData.matches || [])
        .filter(match => match.id !== articleId) // Exclude the article itself
        .slice(0, topK)
        .map(match => ({
          id: match.id,
          score: match.score,
          ...match.metadata
        }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matches)
      };
    } else if (searchAction === 'upsert' || searchAction === 'index') {
      // Index/upsert articles
      const { articles, article } = body;
      const articlesToIndex = articles || (article ? [article] : []);
      
      if (articlesToIndex.length === 0) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upserted: 0 })
        };
      }

      // Generate embeddings for all articles
      const texts = articlesToIndex.map(a => `${a.title}. ${a.summary || ''}`);
      const embeddingResponse = await fetch('https://api.pinecone.io/inference/embed', {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
          'X-Pinecone-API-Version': '2024-10'
        },
        body: JSON.stringify({
          model: 'multilingual-e5-large',
          parameters: {
            input_type: 'passage',
            truncate: 'END'
          },
          inputs: texts.map(text => ({ text }))
        })
      });

      if (!embeddingResponse.ok) {
        throw new Error(`Embedding generation failed: ${embeddingResponse.statusText}`);
      }

      const embeddingData = await embeddingResponse.json();
      
      // Prepare vectors for upsert
      const vectors = articlesToIndex.map((article, idx) => ({
        id: article.id,
        values: embeddingData.data[idx].values,
        metadata: {
          title: article.title,
          summary: article.summary || '',
          url: article.url,
          image: article.image || '',
          author: article.author || '',
          publishedAt: article.publishedAt,
          source: article.source,
          topics: article.topics || [],
          country: article.country || ''
        }
      }));

      // Upsert to Pinecone
      const upsertResponse = await fetch(`${PINECONE_INDEX_HOST}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vectors })
      });

      if (!upsertResponse.ok) {
        throw new Error(`Pinecone upsert failed: ${upsertResponse.statusText}`);
      }

      const upsertData = await upsertResponse.json();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upserted: upsertData.upsertedCount || vectors.length
        })
      };
    } else if (searchAction === 'bulk-index') {
      // Bulk index articles (same as upsert)
      const { articles } = body;
      
      if (!articles || articles.length === 0) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            indexed: 0
          })
        };
      }

      // Process in batches of 100
      const batchSize = 100;
      let totalIndexed = 0;

      for (let i = 0; i < articles.length; i += batchSize) {
        const batch = articles.slice(i, i + batchSize);
        const texts = batch.map(a => `${a.title}. ${a.summary || ''}`);
        
        const embeddingResponse = await fetch('https://api.pinecone.io/inference/embed', {
          method: 'POST',
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json',
            'X-Pinecone-API-Version': '2024-10'
          },
          body: JSON.stringify({
            model: 'multilingual-e5-large',
            parameters: {
              input_type: 'passage',
              truncate: 'END'
            },
            inputs: texts.map(text => ({ text }))
          })
        });

        if (!embeddingResponse.ok) {
          console.error(`Batch ${i} embedding failed`);
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        
        const vectors = batch.map((article, idx) => ({
          id: article.id,
          values: embeddingData.data[idx].values,
          metadata: {
            title: article.title,
            summary: article.summary || '',
            url: article.url,
            image: article.image || '',
            author: article.author || '',
            publishedAt: article.publishedAt,
            source: article.source,
            topics: article.topics || [],
            country: article.country || ''
          }
        }));

        const upsertResponse = await fetch(`${PINECONE_INDEX_HOST}/vectors/upsert`, {
          method: 'POST',
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vectors })
        });

        if (upsertResponse.ok) {
          totalIndexed += batch.length;
        }
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          indexed: totalIndexed
        })
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Invalid action',
        received: searchAction 
      })
    };
  } catch (error) {
    console.error('Pinecone search error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
