import { NextResponse } from 'next/server';

// Default tickers for AxeCap Terminal
const DEFAULT_TICKERS = ['ES=F', 'NQ=F', 'SPY', 'QQQ', 'VIX', 'BTC-USD', '^TNX'];

// Yahoo Finance API (free, 15-min delay)
async function fetchYahooQuotes(symbols: string[]) {
  try {
    const symbolsStr = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error('Yahoo Finance error:', error);
    return [];
  }
}

// Massive Options API
async function fetchMassiveOptions(symbol: string) {
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) return null;
  
  try {
    const response = await fetch(`https://api.massive.com/v1/options/chain/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Massive API error:', error);
    return null;
  }
}

// Format quote data for frontend
function formatQuote(quote: any) {
  return {
    symbol: quote.symbol,
    name: quote.shortName || quote.longName || quote.symbol,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
    high: quote.regularMarketDayHigh,
    low: quote.regularMarketDayLow,
    open: quote.regularMarketOpen,
    prevClose: quote.regularMarketPreviousClose,
    volume: quote.regularMarketVolume,
    marketCap: quote.marketCap,
    time: quote.regularMarketTime,
    marketState: quote.marketState
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customSymbols = searchParams.get('symbols')?.split(',') || [];
  const includeOptions = searchParams.get('options') === 'true';
  
  // Combine default and custom tickers
  const allSymbols = [...new Set([...DEFAULT_TICKERS, ...customSymbols])];
  
  // Fetch quotes from Yahoo Finance
  const yahooQuotes = await fetchYahooQuotes(allSymbols);
  const formattedQuotes = yahooQuotes.map(formatQuote);
  
  // Optionally fetch options data
  let optionsData = null;
  if (includeOptions && customSymbols.length > 0) {
    optionsData = await fetchMassiveOptions(customSymbols[0]);
  }
  
  const response = NextResponse.json({
    quotes: formattedQuotes,
    options: optionsData,
    timestamp: new Date().toISOString(),
    source: 'yahoo-finance',
    cached: false
  });
  
  // Aggressive caching for speed
  response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  
  return response;
}
