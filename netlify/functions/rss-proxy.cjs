const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['dc:creator', 'creator'],
    ],
  },
});

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing url parameter' }),
    };
  }

  try {
    const feed = await parser.parseURL(url);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({
        title: feed.title,
        description: feed.description,
        link: feed.link,
        items: feed.items.map(item => ({
          id: item.guid || item.link,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate || item.isoDate,
          creator: item.creator || item['dc:creator'],
          content: item.content || item['content:encoded'],
          contentSnippet: item.contentSnippet,
          categories: item.categories || [],
          enclosure: item.enclosure,
        })),
      }),
    };
  } catch (error) {
    console.error('RSS fetch error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch RSS feed',
        details: error.message,
      }),
    };
  }
};
