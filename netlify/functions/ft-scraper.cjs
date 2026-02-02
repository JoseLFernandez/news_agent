const Parser = require('rss-parser');
const parser = new Parser();

const FT_RSS_FEEDS = {
  all: 'https://www.ft.com/?format=rss',
  markets: 'https://www.ft.com/markets?format=rss',
  companies: 'https://www.ft.com/companies?format=rss',
  world: 'https://www.ft.com/world?format=rss',
  opinion: 'https://www.ft.com/opinion?format=rss',
  lex: 'https://www.ft.com/lex?format=rss',
  tech: 'https://www.ft.com/technology?format=rss',
};

function generateId(url, title) {
  return `ft-${Buffer.from(url || title).toString('base64').slice(0, 16)}`;
}

function inferTopics(title, category) {
  const topics = [];
  const text = (title || '').toLowerCase();
  
  if (/(tech|ai|digital|software|cyber)/.test(text)) topics.push('technology');
  if (/(market|stock|trading|investor)/.test(text)) topics.push('finance');
  if (/(business|company|corporate)/.test(text)) topics.push('business');
  if (category) topics.push(category);
  
  return topics.length ? topics : ['finance'];
}

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const action = body.action || 'news';
  const category = body.category || 'all';
  const limit = body.limit || 20;

  try {
    if (action === 'myft') {
      // MyFT requires authentication - return empty for now
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      };
    }

    const feedUrl = FT_RSS_FEEDS[category] || FT_RSS_FEEDS.all;
    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.slice(0, limit).map((item) => ({
      id: generateId(item.link, item.title),
      title: item.title || 'Untitled',
      summary: item.contentSnippet || item.content?.substring(0, 200) || '',
      url: item.link,
      image: item.enclosure?.url,
      author: item.creator || item['dc:creator'],
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      source: 'Financial Times',
      topics: inferTopics(item.title, category !== 'all' ? category : null),
      category: category !== 'all' ? category : undefined,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify(articles),
    };
  } catch (error) {
    console.error('FT scraper error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch FT news',
        details: error.message,
      }),
    };
  }
};
