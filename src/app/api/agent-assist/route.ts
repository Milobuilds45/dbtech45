import { NextRequest, NextResponse } from 'next/server';

const AGENT_ROLES: Record<string, { role: string; needs: string[]; searchTerms: string[] }> = {
  bobby: {
    role: 'Trading & financial markets analyst',
    needs: ['market data APIs', 'trading algorithms', 'portfolio analytics', 'options pricing', 'backtesting', 'risk management'],
    searchTerms: ['best trading API 2026', 'financial data python library', 'algorithmic trading tools', 'options analytics API', 'real-time stock data', 'crypto trading bot framework', 'portfolio optimization tools', 'market sentiment API', 'financial machine learning', 'quantitative finance tools'],
  },
  tony: {
    role: 'Restaurant operations & supply chain manager',
    needs: ['POS systems', 'inventory management', 'food cost tracking', 'scheduling', 'supply chain', 'restaurant analytics'],
    searchTerms: ['restaurant management API', 'food inventory tracking software', 'restaurant POS integration', 'supply chain management tools', 'food cost calculator', 'employee scheduling API', 'restaurant analytics platform', 'menu engineering tools', 'food waste tracking', 'kitchen display system API'],
  },
  paula: {
    role: 'UI/UX designer & frontend architect',
    needs: ['design systems', 'animation libraries', 'UI components', 'prototyping', 'accessibility', 'design tokens'],
    searchTerms: ['best React UI library 2026', 'CSS animation framework', 'design system tools', 'figma to code', 'accessibility testing tools', 'micro-interaction library', 'SVG animation', 'responsive design framework', 'color palette generator API', 'font pairing tools'],
  },
  anders: {
    role: 'Full-stack developer & deployment engineer',
    needs: ['deployment tools', 'database solutions', 'CI/CD', 'monitoring', 'auth systems', 'API frameworks'],
    searchTerms: ['best backend framework 2026', 'serverless deployment tools', 'database comparison', 'CI/CD pipeline tools', 'application monitoring', 'authentication service', 'API gateway solutions', 'edge computing platform', 'developer productivity tools', 'code review automation'],
  },
  dwight: {
    role: 'Intelligence analyst & research agent',
    needs: ['news APIs', 'web scraping', 'data analysis', 'research tools', 'OSINT', 'summarization'],
    searchTerms: ['news aggregation API', 'web scraping framework', 'OSINT tools 2026', 'text summarization API', 'competitive intelligence tools', 'social media monitoring API', 'fact checking tools', 'knowledge graph tools', 'research automation', 'data enrichment API'],
  },
  dax: {
    role: 'Data scientist & analytics engineer',
    needs: ['data visualization', 'ML frameworks', 'data pipelines', 'BI tools', 'statistical analysis', 'data quality'],
    searchTerms: ['data visualization library 2026', 'machine learning framework', 'ETL pipeline tools', 'business intelligence platform', 'statistical analysis API', 'data quality tools', 'feature engineering library', 'time series analysis', 'anomaly detection tools', 'data catalog solutions'],
  },
  milo: {
    role: 'Chief of staff & coordination agent',
    needs: ['workflow automation', 'project management', 'communication', 'scheduling', 'agent orchestration', 'knowledge management'],
    searchTerms: ['workflow automation platform', 'project management API', 'team communication tools', 'agent orchestration framework', 'knowledge base tools', 'task automation', 'calendar scheduling API', 'document collaboration', 'decision tracking tools', 'AI agent framework'],
  },
  remy: {
    role: 'Marketing & content strategist',
    needs: ['SEO tools', 'content generation', 'social media', 'email marketing', 'analytics', 'A/B testing'],
    searchTerms: ['SEO API tools 2026', 'content marketing platform', 'social media scheduling API', 'email marketing automation', 'marketing analytics tools', 'A/B testing framework', 'copywriting AI tools', 'influencer marketing API', 'brand monitoring tools', 'conversion optimization'],
  },
  wendy: {
    role: 'Personal assistant & lifestyle manager',
    needs: ['calendar APIs', 'weather data', 'reminder systems', 'health tracking', 'travel APIs', 'local search'],
    searchTerms: ['personal productivity API', 'weather data API', 'travel booking API', 'health tracking integration', 'local business search API', 'smart home automation', 'personal finance API', 'recipe and meal planning', 'fitness tracking API', 'event discovery API'],
  },
};

const CATEGORIES = ['api', 'tool', 'library', 'service', 'dataset', 'framework', 'reference', 'other'] as const;
const TYPES = ['open-source', 'free-tier', 'documentation', 'tutorial', 'reference'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentIds, existingTitles = [], creativity = 'creative', budget = 'any' } = body;

    // Build pricing filter for search queries
    const pricingModifier = {
      'open-source': 'open source free',
      'free-tier': 'free tier OR free trial',
      'budget-30': 'affordable under $30 per month',
      'budget-50': 'under $50 per month subscription',
      'budget-100': 'premium under $100 per month',
      'any': '',
    }[budget] || '';

    const results = [];

    for (const agentId of agentIds) {
      const agentInfo = AGENT_ROLES[agentId];
      if (!agentInfo) continue;

      // Pick a random search term, append budget filter
      const shuffled = [...agentInfo.searchTerms].sort(() => Math.random() - 0.5);
      const baseTerm = shuffled[0];
      const searchTerm = pricingModifier ? `${baseTerm} ${pricingModifier}` : baseTerm;

      // Search the web for fresh suggestions
      let webResults: Array<{ title: string; url: string; description: string }> = [];
      
      try {
        const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchTerm)}&count=5`;
        const searchRes = await fetch(searchUrl, {
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
          },
        });
        
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          webResults = (searchData.web?.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            description: r.description,
          }));
        }
      } catch (e) {
        // Fallback: generate without web search
        console.log('Web search failed, generating from knowledge base');
      }

      // Filter out already-existing titles
      const existingLower = existingTitles.map((t: string) => t.toLowerCase());
      const freshResults = webResults.filter(
        r => !existingLower.some((existing: string) => 
          r.title.toLowerCase().includes(existing) || existing.includes(r.title.toLowerCase())
        )
      );

      // Pick the best result or generate from knowledge base
      const picked = freshResults[0] || webResults[0];

      if (picked) {
        // Determine category from context
        const titleLower = picked.title.toLowerCase();
        let category: typeof CATEGORIES[number] = 'tool';
        if (titleLower.includes('api') || titleLower.includes('endpoint')) category = 'api';
        else if (titleLower.includes('library') || titleLower.includes('npm') || titleLower.includes('package')) category = 'library';
        else if (titleLower.includes('framework')) category = 'framework';
        else if (titleLower.includes('service') || titleLower.includes('platform') || titleLower.includes('saas')) category = 'service';
        else if (titleLower.includes('data') || titleLower.includes('dataset')) category = 'dataset';

        let type: typeof TYPES[number] = 'free-tier';
        if (budget === 'open-source' || titleLower.includes('open source') || titleLower.includes('github') || titleLower.includes('open-source')) type = 'open-source';
        else if (budget === 'free-tier') type = 'free-tier';

        // Build pricing string based on budget
        let pricingStr = type === 'open-source' ? 'Free' : 'Check website';
        if (budget === 'budget-30') pricingStr = 'Up to $30/month';
        else if (budget === 'budget-50') pricingStr = 'Up to $50/month';
        else if (budget === 'budget-100') pricingStr = 'Up to $100/month';

        const agentFirst = agentId.charAt(0).toUpperCase() + agentId.slice(1);
        const cleanTitle = picked.title.replace(/ - .*$/, '').replace(/\|.*$/, '').trim().substring(0, 80);
        const need = agentInfo.needs[Math.floor(Math.random() * agentInfo.needs.length)];

        // Generate a plain English explanation
        const plainEnglishTemplates = [
          `This helps ${agentFirst} handle ${need} automatically instead of doing it manually. Think of it as a specialized assistant just for that one job.`,
          `Gives ${agentFirst} the ability to work with ${need} faster and more accurately. Without it, this would take way longer or require a human to do it.`,
          `A plug-and-play tool that ${agentFirst} can use for ${need}. It is already built and tested — no need to build it from scratch.`,
        ];

        results.push({
          id: `${Date.now()}-${agentId}-${Math.random().toString(36).slice(2, 8)}`,
          agentId,
          agentName: agentFirst,
          title: cleanTitle,
          description: picked.description.substring(0, 300),
          plainEnglish: plainEnglishTemplates[Math.floor(Math.random() * plainEnglishTemplates.length)],
          url: picked.url,
          category,
          type,
          tags: [agentId, category, ...agentInfo.needs.slice(0, 2)],
          useCase: `${agentInfo.role}: ${need}`,
          rating: 3 + Math.floor(Math.random() * 3),
          usefulFor: [agentId],
          pricing: pricingStr,
          createdAt: new Date().toISOString(),
          addedBy: agentId,
          searchedWith: searchTerm,
        });
      } else {
        // Fallback: generate from agent's needs with randomization
        const need = agentInfo.needs[Math.floor(Math.random() * agentInfo.needs.length)];
        const agentFirst = agentId.charAt(0).toUpperCase() + agentId.slice(1);
        results.push({
          id: `${Date.now()}-${agentId}-${Math.random().toString(36).slice(2, 8)}`,
          agentId,
          agentName: agentFirst,
          title: `${need.charAt(0).toUpperCase() + need.slice(1)} Tool`,
          description: `Recommended ${need} solution for ${agentInfo.role.toLowerCase()}. Search for the latest options.`,
          plainEnglish: `${agentFirst} needs a better way to handle ${need}. This is a suggestion to go find the best tool for that job.`,
          url: `https://www.google.com/search?q=${encodeURIComponent(need + ' tools 2026')}`,
          category: 'tool',
          type: 'reference' as const,
          tags: [agentId, 'recommended', need.split(' ')[0]],
          useCase: `${agentInfo.role}: ${need}`,
          rating: 3,
          usefulFor: [agentId],
          pricing: 'Varies',
          createdAt: new Date().toISOString(),
          addedBy: agentId,
          searchedWith: searchTerm,
        });
      }
    }

    return NextResponse.json({ resources: results });
  } catch (error) {
    console.error('Agent assist generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate resources' }, { status: 500 });
  }
}
