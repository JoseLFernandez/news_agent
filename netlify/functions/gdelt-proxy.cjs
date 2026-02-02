exports.handler = async (event) => {
  const query = event.queryStringParameters?.query || 'technology';
  const maxrecords = event.queryStringParameters?.maxrecords || '50';

  try {
    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxrecords}&format=json`;
    
    const response = await fetch(gdeltUrl);
    
    if (!response.ok) {
      throw new Error(`GDELT API returned ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({
        articles: data.articles || []
      }),
    };
  } catch (error) {
    console.error('GDELT fetch error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch from GDELT',
        details: error.message,
        articles: []
      }),
    };
  }
};
