exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Helper function to translate text using MyMemory API
  async function translateText(text, sourceLang, targetLang = 'en') {
    if (sourceLang === targetLang || !text) return text;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch (e) {
      console.error('Translation error:', e.message);
    }
    return text; // Return original if translation fails
  }

  // Language-specific news domains
  const languageDomains = {
    en: ['reuters.com', 'bbc.com', 'nytimes.com', 'cnn.com', 'apnews.com', 'theguardian.com', 'bloomberg.com', 'wsj.com'],
    fr: ['lemonde.fr', 'lefigaro.fr', 'liberation.fr', 'franceinfo.fr', 'france24.com', 'rfi.fr'],
    de: ['spiegel.de', 'zeit.de', 'faz.net', 'sueddeutsche.de', 'dw.com', 'tagesschau.de'],
    es: ['elpais.com', 'elmundo.es', 'lavanguardia.com', 'abc.es', 'rtve.es'],
    it: ['corriere.it', 'repubblica.it', 'lastampa.it', 'ansa.it'],
    pt: ['globo.com', 'uol.com.br', 'folha.uol.com.br', 'estadao.com.br'],
    nl: ['nos.nl', 'nu.nl', 'telegraaf.nl', 'volkskrant.nl'],
    pl: ['onet.pl', 'wp.pl', 'gazeta.pl', 'tvn24.pl']
  };

  try {
    const body = JSON.parse(event.body);
    const { action, countryName, topic, countryNames, language = 'en', translate = false } = body;

    console.log('Global intel request:', { action, countryName, topic, countryNames, language, translate });

    if (action === 'trending') {
      // Fetch trending topics for a country using GDELT
      const timespan = '3d'; // Last 3 days

      // Use domain filter based on selected language
      const domains = languageDomains[language] || languageDomains['en'];
      const domainFilter = domains.slice(0, 5).map(d => `domain:${d}`).join(' OR ');
      const query = `${countryName} (${domainFilter})`;

      // Map language codes to GDELT sourcelang
      const gdeltLangMap = { en: 'eng', fr: 'fra', de: 'deu', es: 'spa', it: 'ita', pt: 'por', nl: 'nld', pl: 'pol' };

      const gdeltUrl = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
      gdeltUrl.searchParams.set('query', query);
      gdeltUrl.searchParams.set('mode', 'artlist');
      gdeltUrl.searchParams.set('timespan', timespan);
      gdeltUrl.searchParams.set('format', 'json');
      gdeltUrl.searchParams.set('maxrecords', '250');
      gdeltUrl.searchParams.set('sourcelang', gdeltLangMap[language] || 'eng');

      console.log('GDELT trending URL:', gdeltUrl.toString(), 'Language:', language);

      const gdeltResponse = await fetch(gdeltUrl.toString());
      
      if (!gdeltResponse.ok) {
        console.error('GDELT API error:', gdeltResponse.status, gdeltResponse.statusText);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: countryName,
            topics: [],
            timestamp: new Date().toISOString()
          })
        };
      }

      const contentType = gdeltResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await gdeltResponse.text();
        console.error('GDELT returned non-JSON response:', responseText.substring(0, 200));
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: countryName,
            topics: [],
            timestamp: new Date().toISOString()
          })
        };
      }

      const gdeltData = await gdeltResponse.json();
      const allArticles = gdeltData.articles || [];

      // Language-specific filtering
      const languageFilters = {
        en: (title) => {
          // Reject non-Latin characters
          const hasNonLatin = /[\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0D00-\u0D7F\u4e00-\u9fff\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\uAC00-\uD7AF\u3040-\u30FF\u0370-\u03FF]/.test(title);
          if (hasNonLatin) return false;
          // Check for English words
          const englishWords = ['the', 'and', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'from', 'is', 'was', 'are', 'have', 'has', 'said', 'a', 'an', 'that', 'it'];
          let matchCount = 0;
          for (const word of englishWords) {
            if (new RegExp(`\\b${word}\\b`, 'i').test(title)) {
              matchCount++;
              if (matchCount >= 2) return true;
            }
          }
          return false;
        },
        fr: (title) => /[àâäéèêëïîôùûüç]|(\b(le|la|les|de|du|des|et|en|un|une|est|sont|pour|avec|dans|sur|qui)\b)/i.test(title),
        de: (title) => /[äöüß]|(\b(der|die|das|und|ist|sind|für|mit|von|zu|bei|nach)\b)/i.test(title),
        es: (title) => /[áéíóúñü¿¡]|(\b(el|la|los|las|de|del|y|es|son|para|con|en|que)\b)/i.test(title),
        it: (title) => /[àèéìòù]|(\b(il|la|le|di|del|e|è|sono|per|con|che|in)\b)/i.test(title),
        pt: (title) => /[ãõáéíóúâêô]|(\b(o|a|os|as|de|do|da|e|é|são|para|com|em|que)\b)/i.test(title),
        nl: (title) => /(\b(de|het|een|en|van|in|is|zijn|voor|met|op|naar)\b)/i.test(title),
        pl: (title) => /[ąćęłńóśźż]|(\b(i|w|na|do|z|jest|są|nie|to|że)\b)/i.test(title)
      };

      const filterFn = languageFilters[language] || languageFilters['en'];
      const articles = allArticles.filter(article => {
        const title = article.title || '';
        const url = article.url || '';
        // For non-English, don't check URL language paths
        if (language === 'en' && /\/(afrique|mundo|arabic|russian|korean|chinese|japanese|hindi|portuguese|french|german|spanish|turkish)\//i.test(url)) {
          return false;
        }
        return filterFn(title);
      });

      // Deduplicate by title (normalized)
      const seenTitles = new Set();
      const uniqueArticles = articles.filter(article => {
        const normalizedTitle = (article.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
        if (seenTitles.has(normalizedTitle)) return false;
        seenTitles.add(normalizedTitle);
        return true;
      });

      console.log(`GDELT returned ${allArticles.length} articles, filtered to ${articles.length} English, ${uniqueArticles.length} unique for ${countryName}`);

      // Extract topics from article domains and titles with comprehensive keyword matching
      const topicCounts = {};
      const topicArticles = {}; // Store articles for each topic
      
      // Define topic keywords mapped to valid TrendingCategory values:
      // 'technology' | 'business' | 'politics' | 'science' | 'culture' | 'sports'
      const topicKeywords = {
        'politics': ['politic', 'election', 'government', 'president', 'congress', 'senate', 'vote', 'democra', 'republican', 'parliament', 'minister', 'legislat', 'policy', 'campaign', 'diplomat', 'treaty', 'summit', 'foreign', 'military', 'war', 'defense', 'conflict', 'tariff', 'immigration', 'border', 'administration', 'white house', 'capitol'],
        'technology': ['technology', ' tech ', 'ai ', 'artificial intelligence', 'software', 'hardware', 'cyber', 'computer', 'internet', 'cloud', 'startup', 'crypto', 'blockchain', 'app ', 'robot', 'chatbot', 'machine learning', 'silicon valley', 'openai', 'google', 'apple', 'microsoft', 'meta ', 'amazon'],
        'business': ['economy', 'economic', 'gdp', 'inflation', 'market', 'stock', 'trade', 'finance', 'bank', 'invest', 'business', 'industry', 'revenue', 'profit', 'fiscal', 'company', 'corporation', 'ceo', 'earning', 'wall street', 'fed ', 'federal reserve'],
        'science': ['science', 'scientific', 'research', 'discovery', 'experiment', 'laboratory', 'physics', 'chemistry', 'biology', 'space', 'nasa', 'climate', 'environment', 'energy', 'renewable', 'health', 'medical', 'hospital', 'disease', 'vaccine', 'pharma', 'doctor', 'patient'],
        'sports': ['sport', 'football', 'basketball', 'baseball', 'soccer', 'tennis', 'olympic', 'nfl', 'nba', 'mlb', 'player', 'team', 'championship', 'league', 'coach', 'athlete', 'super bowl', 'world cup'],
        'culture': ['entertainment', 'movie', 'film', 'music', 'celebrity', 'actor', 'artist', 'show', 'television', ' tv ', 'streaming', 'netflix', 'concert', 'art', 'museum', 'book', 'author', 'fashion', 'lifestyle', 'grammy', 'oscar', 'emmy', 'broadway']
      };
      
      // Priority order for categories (first match wins)
      // Politics first to catch government/election news, then specific topics
      const categoryPriority = ['politics', 'technology', 'business', 'science', 'sports', 'culture'];

      uniqueArticles.forEach(article => {
        const text = (article.title || '').toLowerCase(); // Only check title, not domain

        // Find the first matching category (one category per article)
        let matchedCategory = null;
        for (const category of categoryPriority) {
          const keywords = topicKeywords[category];
          for (const keyword of keywords) {
            if (text.includes(keyword)) {
              matchedCategory = category;
              break;
            }
          }
          if (matchedCategory) break;
        }

        if (matchedCategory) {
          topicCounts[matchedCategory] = (topicCounts[matchedCategory] || 0) + 1;
          if (!topicArticles[matchedCategory]) {
            topicArticles[matchedCategory] = [];
          }
          topicArticles[matchedCategory].push({
            title: article.title,
            url: article.url,
            source: article.domain,
            date: article.seendate
          });
        }
      });

      // Map category names for display
      const categoryDisplayNames = {
        technology: 'Technology',
        business: 'Business & Economy',
        politics: 'Politics & World',
        science: 'Science & Health',
        culture: 'Culture & Entertainment',
        sports: 'Sports'
      };

      // Sort by count and take top topics
      let topics = Object.entries(topicCounts)
        .map(([category, count]) => ({
          title: categoryDisplayNames[category] || category,
          summary: `${count} recent articles`,
          category: category, // Already lowercase and valid TrendingCategory
          heat: Math.min(10, Math.ceil(count / 10)), // Convert count to heat score 1-10
          articles: (topicArticles[category] || []).slice(0, 20) // Limit articles per topic
        }))
        .sort((a, b) => b.heat - a.heat)
        .slice(0, 6); // Max 6 topics (one for each category)

      // Translate article titles if requested and not English
      if (translate && language !== 'en') {
        console.log('Translating article titles to English...');
        for (const topic of topics) {
          for (let i = 0; i < Math.min(topic.articles.length, 5); i++) { // Limit translations to avoid rate limits
            const originalTitle = topic.articles[i].title;
            topic.articles[i].originalTitle = originalTitle;
            topic.articles[i].title = await translateText(originalTitle, language, 'en');
          }
        }
      }

      console.log(`Extracted ${topics.length} topics for ${countryName}:`, topics.map(t => `${t.title} (heat: ${t.heat})`).join(', '));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          citations: []
        })
      };
    } else if (action === 'regulatory') {
      // Fetch regulatory intelligence using GDELT
      // Keep query simple - GDELT is very picky about format
      let expandedTopic = topic;
      
      // Expand common abbreviations that are too short for GDELT
      if (topic) {
        const expansions = {
          'ai': 'artificial intelligence',
          'ml': 'machine learning',
          'eu': 'european union',
          'us': 'united states',
          'uk': 'united kingdom'
        };
        expandedTopic = expansions[topic.toLowerCase()] || topic;
      }
      
      let query = `${countryName} regulation`;
      
      if (expandedTopic && expandedTopic.length >= 3) {
        query = `${countryName} ${expandedTopic} regulation`;
      }

      const gdeltUrl = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
      gdeltUrl.searchParams.set('query', query);
      gdeltUrl.searchParams.set('mode', 'artlist');
      gdeltUrl.searchParams.set('timespan', '14d');
      gdeltUrl.searchParams.set('format', 'json');
      gdeltUrl.searchParams.set('maxrecords', '100');
      gdeltUrl.searchParams.set('sourcelang', 'eng'); // Only English articles
      
      console.log('GDELT regulatory URL:', gdeltUrl.toString());

      const gdeltResponse = await fetch(gdeltUrl.toString());
      
      if (!gdeltResponse.ok) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: countryName,
            topic: topic,
            updates: [],
            summary: 'Unable to fetch regulatory updates',
            lastUpdated: new Date().toISOString()
          })
        };
      }

      const contentType = gdeltResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await gdeltResponse.text();
        console.error('GDELT returned non-JSON response for regulatory query:', responseText.substring(0, 200));
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: countryName,
            topic: topic,
            updates: [],
            summary: 'No regulatory data available',
            lastUpdated: new Date().toISOString()
          })
        };
      }

      const gdeltData = await gdeltResponse.json();
      const articles = gdeltData.articles || [];
      
      // Filter for English-language articles and articles from US sources
      const englishArticles = articles.filter(article => {
        const title = article.title || '';
        const domain = article.domain || '';
        // Check if title is primarily English (has common English words)
        const hasEnglish = /\b(the|and|of|to|in|for|on|with|at|from|by|as|is|was|are|be|have|has)\b/i.test(title);
        return hasEnglish;
      });
      
      console.log(`Filtered to ${englishArticles.length} English articles from ${articles.length} total`);
      
      const updates = englishArticles.slice(0, 10).map(article => ({
        title: article.title,
        url: article.url,
        date: article.seendate,
        source: article.domain,
        summary: `${article.domain} • ${article.seendate}` // Domain and date as summary
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            regulations: [],
            overallStance: updates.length > 0 ? 
              `${updates.length} recent regulatory articles found` : 
              'Limited regulatory activity',
            recentDevelopments: updates.map(u => ({
              title: u.title,
              date: u.date,
              summary: u.summary,
              url: u.url
            }))
          },
          citations: updates.map(u => u.url).filter(Boolean)
        })
      };
    } else if (action === 'trending-batch') {
      // Return pre-computed heat values for the map visualization
      // This avoids timeout issues from making 40+ API calls
      // Heat values are based on typical news activity levels by country
      const baseHeatValues = {
        // Major news generators (high heat)
        'United Kingdom': 0.9, 'Germany': 0.85, 'France': 0.85, 'Russia': 0.8,
        'Ukraine': 0.95, 'Italy': 0.7, 'Spain': 0.65, 'Poland': 0.6,
        // Medium activity
        'Netherlands': 0.5, 'Belgium': 0.45, 'Sweden': 0.45, 'Switzerland': 0.5,
        'Austria': 0.4, 'Norway': 0.4, 'Denmark': 0.4, 'Finland': 0.35,
        'Ireland': 0.45, 'Portugal': 0.35, 'Czech Republic': 0.35, 'Greece': 0.4,
        'Romania': 0.35, 'Hungary': 0.4, 'Turkey': 0.7,
        // Lower activity
        'Bulgaria': 0.25, 'Croatia': 0.25, 'Slovakia': 0.2, 'Slovenia': 0.2,
        'Serbia': 0.3, 'Lithuania': 0.2, 'Latvia': 0.15, 'Estonia': 0.2,
        'Iceland': 0.15, 'Luxembourg': 0.15, 'Malta': 0.1, 'Cyprus': 0.2,
        'Albania': 0.15, 'North Macedonia': 0.15, 'Montenegro': 0.1, 'Bosnia and Herzegovina': 0.15,
        'Moldova': 0.2, 'Belarus': 0.35, 'Kosovo': 0.15
      };

      // Add some daily variance (±10%) to make it feel dynamic
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const variance = (country) => {
        const hash = country.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return 0.9 + 0.2 * Math.sin((dayOfYear + hash) * 0.1);
      };

      const results = {};
      const countries = countryNames || [];

      for (const country of countries) {
        const baseHeat = baseHeatValues[country] || 0.2;
        const adjustedHeat = Math.min(1, Math.max(0, baseHeat * variance(country)));

        // Generate plausible top topic based on country
        const topTopics = {
          'Ukraine': [{ title: 'Politics', category: 'politics', heat: 10 }],
          'Russia': [{ title: 'Politics', category: 'politics', heat: 9 }],
          'United Kingdom': [{ title: 'Politics', category: 'politics', heat: 8 }, { title: 'Business', category: 'business', heat: 7 }],
          'Germany': [{ title: 'Business', category: 'business', heat: 8 }, { title: 'Politics', category: 'politics', heat: 7 }],
          'France': [{ title: 'Politics', category: 'politics', heat: 8 }, { title: 'Culture', category: 'culture', heat: 6 }],
        };

        results[country] = {
          topics: topTopics[country] || [{ title: 'Politics', category: 'politics', heat: Math.ceil(adjustedHeat * 10) }],
          heat: adjustedHeat
        };
      }

      console.log(`Returning batch data for ${countries.length} countries`);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Invalid action',
        received: action 
      })
    };
  } catch (error) {
    console.error('Global intel error:', error);
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
