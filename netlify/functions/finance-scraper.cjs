const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['dc:creator', 'creator']
    ]
  }
});

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { action = 'news', category = 'all', limit = 30 } = body;

    if (action === 'news') {
      console.log(`Fetching finance news: category=${category}, limit=${limit}`);
      
      // Finance RSS feed sources - using more reliable feeds
      const feeds = [
        { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'markets' },
        { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', category: 'markets' },
        { url: 'https://seekingalpha.com/market_currents.xml', source: 'Seeking Alpha', category: 'investing' },
        { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', category: 'crypto' },
        { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', category: 'crypto' },
        { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch', category: 'markets' },
        { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', category: 'markets' }
      ];

      // Filter feeds by category
      const filteredFeeds = category === 'all' 
        ? feeds 
        : feeds.filter(f => f.category === category);

      console.log(`Fetching from ${filteredFeeds.length} feeds`);
      const allArticles = [];

      // Fetch all feeds in parallel with timeout
      const results = await Promise.allSettled(
        filteredFeeds.map(async (feedConfig) => {
          try {
            console.log(`Fetching ${feedConfig.source}...`);
            const feed = await parser.parseURL(feedConfig.url);
            console.log(`Got ${feed.items?.length || 0} items from ${feedConfig.source}`);
            
            const articles = (feed.items || []).slice(0, 10).map((item, idx) => {
              const id = item.guid || item.link || `${feedConfig.source}-${idx}-${Date.now()}`;
              
              return {
                id: id.replace(/[^a-zA-Z0-9-_]/g, '-'),
                title: item.title || 'Untitled',
                summary: item.contentSnippet || item.content || item.description || '',
                url: item.link || '',
                image: item.enclosure?.url || item.image?.url || '',
                author: item.creator || item.author || feedConfig.source,
                publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
                source: 'finance',
                topics: [feedConfig.category],
                category: feedConfig.category
              };
            });

            return articles;
          } catch (error) {
            console.error(`Error fetching ${feedConfig.source}:`, error.message);
            return [];
          }
        })
      );

      // Collect all successful results
      results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allArticles.push(...result.value);
        }
      });

      console.log(`Total articles collected: ${allArticles.length}`);

      // Sort by date and limit
      const sortedArticles = allArticles
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sortedArticles)
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid action' })
    };
  } catch (error) {
    console.error('Finance scraper error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
