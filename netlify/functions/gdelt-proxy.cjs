exports.handler = async (event) => {
  const query = event.queryStringParameters?.query || 'technology';
  const maxrecords = event.queryStringParameters?.maxrecords || '50';
  const language = event.queryStringParameters?.language || 'any';

  try {
    const gdeltLangMap = { en: 'eng', fr: 'fra', de: 'deu', es: 'spa', it: 'ita', pt: 'por', nl: 'nld', pl: 'pol' };
    const sourcelang = gdeltLangMap[language];

    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    url.searchParams.set('query', query);
    url.searchParams.set('mode', 'artlist');
    url.searchParams.set('maxrecords', String(maxrecords));
    url.searchParams.set('format', 'json');
    if (language !== 'any' && sourcelang) {
      url.searchParams.set('sourcelang', sourcelang);
    }

    const response = await fetch(url.toString());
    
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
