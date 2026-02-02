const GITHUB_API_BASE = 'https://api.github.com';

// Popular topics to show by default (reduces API calls)
const POPULAR_TOPICS = [
  'javascript', 'python', 'react', 'typescript', 'machine-learning',
  'nodejs', 'docker', 'kubernetes', 'rust', 'go', 'vue', 'angular',
  'artificial-intelligence', 'deep-learning', 'data-science', 'devops',
  'security', 'blockchain', 'web-development', 'mobile-development',
  'api', 'database', 'linux', 'aws', 'cloud', 'graphql', 'nextjs',
  'tailwindcss', 'svelte', 'flutter', 'android', 'ios'
];

async function fetchGitHub(endpoint, headers = {}) {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'NewsAggregator/1.0',
      ...headers
    }
  });

  const rateLimit = {
    remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '60'),
    limit: parseInt(response.headers.get('x-ratelimit-limit') || '60'),
    resetAt: new Date(parseInt(response.headers.get('x-ratelimit-reset') || '0') * 1000).toISOString()
  };

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { data, rateLimit };
}

async function searchTopics(query) {
  if (!query || query.trim() === '') {
    // Return popular topics without API call
    return {
      topics: POPULAR_TOPICS.map(name => ({
        name,
        displayName: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        shortDescription: `Explore ${name} repositories`,
        description: '',
        createdBy: '',
        relatedTopics: [],
        featured: true
      })),
      rateLimit: null
    };
  }

  const { data, rateLimit } = await fetchGitHub(
    `/search/topics?q=${encodeURIComponent(query)}&per_page=20`
  );

  const topics = (data.items || []).map(item => ({
    name: item.name,
    displayName: item.display_name || item.name,
    shortDescription: item.short_description || '',
    description: item.description || '',
    createdBy: item.created_by || '',
    relatedTopics: item.related || [],
    featured: item.featured || false
  }));

  return { topics, rateLimit };
}

async function getReposByTopic(topic, sort = 'stars', page = 1) {
  const { data, rateLimit } = await fetchGitHub(
    `/search/repositories?q=topic:${encodeURIComponent(topic)}&sort=${sort}&order=desc&per_page=30&page=${page}`
  );

  const repositories = (data.items || []).map(repo => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: {
      login: repo.owner?.login || 'unknown',
      avatarUrl: repo.owner?.avatar_url || ''
    },
    description: repo.description || '',
    url: repo.html_url,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    language: repo.language,
    topics: repo.topics || [],
    updatedAt: repo.updated_at
  }));

  return {
    repositories,
    totalCount: data.total_count || 0,
    rateLimit
  };
}

async function getTrendingRepos(since = 'weekly') {
  // Calculate date for trending period
  const date = new Date();
  if (since === 'daily') {
    date.setDate(date.getDate() - 1);
  } else if (since === 'weekly') {
    date.setDate(date.getDate() - 7);
  } else {
    date.setMonth(date.getMonth() - 1);
  }
  const dateStr = date.toISOString().split('T')[0];

  const { data, rateLimit } = await fetchGitHub(
    `/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=30`
  );

  const repositories = (data.items || []).map(repo => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: {
      login: repo.owner?.login || 'unknown',
      avatarUrl: repo.owner?.avatar_url || ''
    },
    description: repo.description || '',
    url: repo.html_url,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    language: repo.language,
    topics: repo.topics || [],
    updatedAt: repo.updated_at
  }));

  return {
    repositories,
    totalCount: data.total_count || 0,
    rateLimit
  };
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const action = params.action;

  try {
    let result;

    switch (action) {
      case 'search-topics':
        result = await searchTopics(params.query || '');
        break;

      case 'get-repos':
        if (!params.topic) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'topic parameter required' })
          };
        }
        result = await getReposByTopic(
          params.topic,
          params.sort || 'stars',
          parseInt(params.page || '1')
        );
        break;

      case 'trending':
        result = await getTrendingRepos(params.since || 'weekly');
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action. Use: search-topics, get-repos, trending' })
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('GitHub Topics API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
