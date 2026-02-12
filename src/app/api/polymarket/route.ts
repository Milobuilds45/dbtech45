import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';

interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  volume: number;
  liquidity: number;
  markets: PolymarketMarket[];
  category: string;
  active: boolean;
}

interface PolymarketMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: number;
  liquidity: number;
  active: boolean;
}

// Fetch trending/popular events from Polymarket
async function fetchPolymarketEvents(limit: number = 20) {
  try {
    // Get active events sorted by volume - prioritize high-volume, short-term opportunities
    const url = `${GAMMA_API}/events?active=true&closed=false&limit=${limit * 2}&order=volume&ascending=false`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }
    
    const events = await response.json();
    return events;
  } catch (error) {
    console.error('Polymarket fetch error:', error);
    return [];
  }
}

// Fetch specific market details
async function fetchMarketDetails(marketId: string) {
  try {
    const url = `${GAMMA_API}/markets/${marketId}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Market details error:', error);
    return null;
  }
}

// Format event for display with actionable insights
function formatEvent(event: any) {
  const markets = event.markets || [];
  const primaryMarket = markets[0];
  
  // Parse outcome prices (they come as string array like ["0.65", "0.35"])
  let yesPrice = 0.5;
  let noPrice = 0.5;
  
  if (primaryMarket?.outcomePrices) {
    try {
      const prices = typeof primaryMarket.outcomePrices === 'string' 
        ? JSON.parse(primaryMarket.outcomePrices) 
        : primaryMarket.outcomePrices;
      yesPrice = parseFloat(prices[0]) || 0.5;
      noPrice = parseFloat(prices[1]) || 0.5;
    } catch {}
  }

  // Calculate actionable insights
  const now = new Date();
  const endDate = new Date(event.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const volume = event.volume || 0;
  const liquidity = event.liquidity || 0;
  
  // Determine if this is a good trading opportunity
  const isActionable = daysLeft > 0 && daysLeft <= 30 && volume >= 1000 && liquidity >= 500;
  const isUrgent = daysLeft > 0 && daysLeft <= 7;
  
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description?.substring(0, 200),
    category: event.tags?.[0]?.label || event.category || 'General',
    volume: volume,
    liquidity: liquidity,
    endDate: event.endDate,
    daysLeft: daysLeft,
    yesPrice: yesPrice,
    noPrice: noPrice,
    yesPercent: Math.round(yesPrice * 100),
    noPercent: Math.round(noPrice * 100),
    active: event.active,
    marketCount: markets.length,
    image: event.image,
    isActionable: isActionable,
    isUrgent: isUrgent,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '15');
  const category = searchParams.get('category');
  
  const events = await fetchPolymarketEvents(limit);
  
  // Filter for actionable opportunities first
  let actionableEvents = events.filter((e: any) => {
    const endDate = new Date(e.endDate);
    const now = new Date();
    const daysUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Prioritize markets ending within 30 days with good volume/liquidity
    const isTimely = daysUntilEnd > 0 && daysUntilEnd <= 30;
    const hasVolume = e.volume >= 1000; // At least $1K volume
    const hasLiquidity = e.liquidity >= 500; // At least $500 liquidity
    
    return isTimely && hasVolume && hasLiquidity;
  });

  // If not enough actionable events, fall back to all events
  let filteredEvents = actionableEvents.length >= 10 ? actionableEvents : events;
  
  // Filter by category if specified
  if (category) {
    filteredEvents = filteredEvents.filter((e: any) => 
      e.tags?.some((t: any) => t.label?.toLowerCase() === category.toLowerCase()) ||
      e.category?.toLowerCase() === category.toLowerCase()
    );
  }
  
  const formattedEvents = filteredEvents.map(formatEvent);
  
  // Sort events to prioritize Derek's actionable opportunities
  const highPriorityKeywords = [
    'sports', 'nfl', 'nba', 'mlb', 'nhl', 'game', 'match', 'championship', 'playoff',
    'bitcoin', 'crypto', 'stock', 'earnings', 'fed', 'rate',
    'today', 'tomorrow', 'this week', 'february', '2026'
  ];
  
  formattedEvents.sort((a: any, b: any) => {
    const now = new Date();
    const aEndDate = new Date(a.endDate);
    const bEndDate = new Date(b.endDate);
    const aDaysLeft = (aEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const bDaysLeft = (bEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    const aIsHighPriority = highPriorityKeywords.some(keyword => 
      a.category.toLowerCase().includes(keyword) || a.title.toLowerCase().includes(keyword)
    );
    const bIsHighPriority = highPriorityKeywords.some(keyword => 
      b.category.toLowerCase().includes(keyword) || b.title.toLowerCase().includes(keyword)
    );
    
    // 1. Urgent markets (ending in <7 days) with high priority categories come first
    const aIsUrgent = aDaysLeft > 0 && aDaysLeft <= 7 && aIsHighPriority;
    const bIsUrgent = bDaysLeft > 0 && bDaysLeft <= 7 && bIsHighPriority;
    
    if (aIsUrgent && !bIsUrgent) return -1;
    if (!aIsUrgent && bIsUrgent) return 1;
    
    // 2. Then high priority categories generally
    if (aIsHighPriority && !bIsHighPriority) return -1;
    if (!aIsHighPriority && bIsHighPriority) return 1;
    
    // 3. Within same priority, prefer markets ending sooner (more actionable)
    if (Math.abs(aDaysLeft - bDaysLeft) > 7) {
      if (aDaysLeft < bDaysLeft && aDaysLeft > 0) return -1;
      if (bDaysLeft < aDaysLeft && bDaysLeft > 0) return 1;
    }
    
    // 4. Finally sort by volume (descending)
    return b.volume - a.volume;
  });
  
  // Get unique categories and sort by Derek's priority order
  const allCategories = [...new Set(events.flatMap((e: any) => 
    e.tags?.map((t: any) => t.label) || [e.category]
  ).filter(Boolean))] as string[];
  
  // Derek's preferred category order
  const priorityOrder = [
    // FIRST PRIORITY: Sports, Bitcoin, Crypto, Stock Options
    'Sports',
    'NFL', 
    'NBA',
    'MLB',
    'Bitcoin',
    'Crypto',
    'Cryptocurrency',
    'Stocks', 
    'Stock Options',
    'Finance',
    'Business',
    
    // SECOND PRIORITY: Politics/Elections  
    'Politics',
    'Elections',
    'Election',
    'World',
    'News',
    
    // THIRD PRIORITY: Celebrity/Hollywood/Music
    'Celebrity',
    'Hollywood',
    'Entertainment',
    'Music',
    'Pop Culture',
    'Culture'
  ];
  
  // Sort categories by priority, then alphabetically
  const sortedCategories = allCategories.sort((a: string, b: string) => {
    const aIndex = priorityOrder.findIndex(p => 
      a.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(a.toLowerCase())
    );
    const bIndex = priorityOrder.findIndex(p => 
      b.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(b.toLowerCase())
    );
    
    // If both found in priority list, sort by priority order
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    // If only one found, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // If neither found, sort alphabetically
    return a.localeCompare(b);
  });
  
  const response = NextResponse.json({
    events: formattedEvents,
    categories: sortedCategories.slice(0, 12),
    total: formattedEvents.length,
    timestamp: new Date().toISOString(),
  });
  
  // Add aggressive caching
  response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
  
  return response;
}
