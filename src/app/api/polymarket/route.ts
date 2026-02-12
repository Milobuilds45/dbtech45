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
    // Get active events sorted by volume
    const url = `${GAMMA_API}/events?active=true&closed=false&limit=${limit}&order=volume&ascending=false`;
    
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

// Format event for display
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
  
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description?.substring(0, 200),
    category: event.tags?.[0]?.label || event.category || 'General',
    volume: event.volume || 0,
    liquidity: event.liquidity || 0,
    endDate: event.endDate,
    yesPrice: yesPrice,
    noPrice: noPrice,
    yesPercent: Math.round(yesPrice * 100),
    noPercent: Math.round(noPrice * 100),
    active: event.active,
    marketCount: markets.length,
    image: event.image,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '15');
  const category = searchParams.get('category');
  
  const events = await fetchPolymarketEvents(limit);
  
  // Filter by category if specified
  let filteredEvents = events;
  if (category) {
    filteredEvents = events.filter((e: any) => 
      e.tags?.some((t: any) => t.label?.toLowerCase() === category.toLowerCase()) ||
      e.category?.toLowerCase() === category.toLowerCase()
    );
  }
  
  const formattedEvents = filteredEvents.map(formatEvent);
  
  // Sort events to prioritize Derek's preferred categories
  const highPriorityKeywords = ['sports', 'nfl', 'nba', 'mlb', 'bitcoin', 'crypto', 'stock'];
  
  formattedEvents.sort((a: any, b: any) => {
    const aIsHighPriority = highPriorityKeywords.some(keyword => 
      a.category.toLowerCase().includes(keyword) || a.title.toLowerCase().includes(keyword)
    );
    const bIsHighPriority = highPriorityKeywords.some(keyword => 
      b.category.toLowerCase().includes(keyword) || b.title.toLowerCase().includes(keyword)
    );
    
    // High priority categories first
    if (aIsHighPriority && !bIsHighPriority) return -1;
    if (!aIsHighPriority && bIsHighPriority) return 1;
    
    // Within same priority level, sort by volume (descending)
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
  
  return NextResponse.json({
    events: formattedEvents,
    categories: sortedCategories.slice(0, 12),
    total: formattedEvents.length,
    timestamp: new Date().toISOString(),
  });
}
