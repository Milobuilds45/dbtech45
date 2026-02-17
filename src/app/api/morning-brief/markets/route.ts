import { NextResponse } from 'next/server';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
}

async function fetchYahooQuote(symbol: string): Promise<{ price: number; change: number; changePct: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { next: { revalidate: 300 }, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose || meta.chartPreviousClose;
    const change = price - prevClose;
    const changePct = (change / prevClose) * 100;
    return { price, change, changePct };
  } catch {
    return null;
  }
}

async function fetchCryptoPrice(id: string): Promise<{ price: number; changePct: number } | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data[id]) return null;
    return {
      price: data[id].usd,
      changePct: data[id].usd_24h_change || 0,
    };
  } catch {
    return null;
  }
}

function formatPrice(price: number, prefix = ''): string {
  if (price >= 1000) {
    return prefix + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return prefix + price.toFixed(2);
}

export async function GET() {
  try {
    // Fetch indices and crypto in parallel
    const [es, nq, rty, ym, cl, gc, ng, vix, dxy, tnx, twoY, btc, eth, sol] = await Promise.all([
      fetchYahooQuote('ES=F'),
      fetchYahooQuote('NQ=F'),
      fetchYahooQuote('RTY=F'),
      fetchYahooQuote('YM=F'),
      fetchYahooQuote('CL=F'),
      fetchYahooQuote('GC=F'),
      fetchYahooQuote('NG=F'),
      fetchYahooQuote('^VIX'),
      fetchYahooQuote('DX-Y.NYB'),
      fetchYahooQuote('^TNX'),
      fetchYahooQuote('^IRX'),
      fetchCryptoPrice('bitcoin'),
      fetchCryptoPrice('ethereum'),
      fetchCryptoPrice('solana'),
    ]);

    // Build ticker bar data
    const ticker: TickerItem[] = [];
    
    if (es) ticker.push({ symbol: 'ES', price: formatPrice(es.price), change: `${es.changePct >= 0 ? '+' : ''}${es.changePct.toFixed(2)}%`, direction: es.changePct >= 0 ? 'up' : 'down' });
    if (nq) ticker.push({ symbol: 'NQ', price: formatPrice(nq.price), change: `${nq.changePct >= 0 ? '+' : ''}${nq.changePct.toFixed(2)}%`, direction: nq.changePct >= 0 ? 'up' : 'down' });
    if (btc) ticker.push({ symbol: 'BTC', price: formatPrice(btc.price), change: `${btc.changePct >= 0 ? '+' : ''}${btc.changePct.toFixed(1)}%`, direction: btc.changePct >= 0 ? 'up' : 'down' });
    if (vix) ticker.push({ symbol: 'VIX', price: vix.price.toFixed(2), change: `${vix.changePct >= 0 ? '+' : ''}${vix.changePct.toFixed(1)}%`, direction: vix.changePct >= 0 ? 'up' : 'down' });
    if (tnx) ticker.push({ symbol: '10Y', price: `${tnx.price.toFixed(2)}%`, change: `${tnx.change >= 0 ? '+' : ''}${(tnx.change * 100).toFixed(0)}bp`, direction: tnx.change >= 0 ? 'up' : 'down' });
    if (rty) ticker.push({ symbol: 'RTY', price: formatPrice(rty.price), change: `${rty.changePct >= 0 ? '+' : ''}${rty.changePct.toFixed(2)}%`, direction: rty.changePct >= 0 ? 'up' : 'down' });
    if (cl) ticker.push({ symbol: 'CL', price: formatPrice(cl.price), change: `${cl.changePct >= 0 ? '+' : ''}${cl.changePct.toFixed(1)}%`, direction: cl.changePct >= 0 ? 'up' : 'down' });
    if (gc) ticker.push({ symbol: 'GC', price: formatPrice(gc.price), change: `${gc.changePct >= 0 ? '+' : ''}${gc.changePct.toFixed(2)}%`, direction: gc.changePct >= 0 ? 'up' : 'down' });
    if (dxy) ticker.push({ symbol: 'DXY', price: dxy.price.toFixed(2), change: `${dxy.changePct >= 0 ? '+' : ''}${dxy.changePct.toFixed(2)}%`, direction: dxy.changePct >= 0 ? 'up' : 'down' });

    // Build detailed market tables
    const indices = [
      es && { name: 'S&P 500 (ES)', price: formatPrice(es.price), change: `${es.change >= 0 ? '+' : ''}${es.change.toFixed(2)}`, changePct: `${es.changePct >= 0 ? '+' : ''}${es.changePct.toFixed(2)}%`, direction: es.changePct >= 0 ? 'up' : 'down' },
      nq && { name: 'Nasdaq (NQ)', price: formatPrice(nq.price), change: `${nq.change >= 0 ? '+' : ''}${nq.change.toFixed(2)}`, changePct: `${nq.changePct >= 0 ? '+' : ''}${nq.changePct.toFixed(2)}%`, direction: nq.changePct >= 0 ? 'up' : 'down' },
      rty && { name: 'Russell 2000 (RTY)', price: formatPrice(rty.price), change: `${rty.change >= 0 ? '+' : ''}${rty.change.toFixed(2)}`, changePct: `${rty.changePct >= 0 ? '+' : ''}${rty.changePct.toFixed(2)}%`, direction: rty.changePct >= 0 ? 'up' : 'down' },
      ym && { name: 'Dow (YM)', price: formatPrice(ym.price), change: `${ym.change >= 0 ? '+' : ''}${ym.change.toFixed(2)}`, changePct: `${ym.changePct >= 0 ? '+' : ''}${ym.changePct.toFixed(2)}%`, direction: ym.changePct >= 0 ? 'up' : 'down' },
    ].filter(Boolean);

    const commodities = [
      cl && { name: 'Crude Oil (CL)', price: `$${cl.price.toFixed(2)}`, change: `${cl.change >= 0 ? '+$' : '-$'}${Math.abs(cl.change).toFixed(2)}`, changePct: `${cl.changePct >= 0 ? '+' : ''}${cl.changePct.toFixed(1)}%`, direction: cl.changePct >= 0 ? 'up' : 'down' },
      gc && { name: 'Gold (GC)', price: `$${gc.price.toFixed(2)}`, change: `${gc.change >= 0 ? '+$' : '-$'}${Math.abs(gc.change).toFixed(2)}`, changePct: `${gc.changePct >= 0 ? '+' : ''}${gc.changePct.toFixed(2)}%`, direction: gc.changePct >= 0 ? 'up' : 'down' },
      ng && { name: 'Natural Gas (NG)', price: `$${ng.price.toFixed(2)}`, change: `${ng.change >= 0 ? '+$' : '-$'}${Math.abs(ng.change).toFixed(2)}`, changePct: `${ng.changePct >= 0 ? '+' : ''}${ng.changePct.toFixed(1)}%`, direction: ng.changePct >= 0 ? 'up' : 'down' },
      tnx && { name: '10Y Treasury', price: `${tnx.price.toFixed(2)}%`, change: `${tnx.change >= 0 ? '+' : ''}${(tnx.change * 100).toFixed(0)} bps`, changePct: '\u2014', direction: tnx.change >= 0 ? 'up' : 'down' },
      dxy && { name: 'Dollar Index (DXY)', price: dxy.price.toFixed(2), change: `${dxy.change >= 0 ? '+' : ''}${dxy.change.toFixed(2)}`, changePct: `${dxy.changePct >= 0 ? '+' : ''}${dxy.changePct.toFixed(2)}%`, direction: dxy.changePct >= 0 ? 'up' : 'down' },
    ].filter(Boolean);

    const crypto = [
      btc && { name: 'Bitcoin (BTC)', price: `$${btc.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, changePct: `${btc.changePct >= 0 ? '+' : ''}${btc.changePct.toFixed(1)}%`, direction: btc.changePct >= 0 ? 'up' : 'down' },
      eth && { name: 'Ethereum (ETH)', price: `$${eth.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, changePct: `${eth.changePct >= 0 ? '+' : ''}${eth.changePct.toFixed(1)}%`, direction: eth.changePct >= 0 ? 'up' : 'down' },
      sol && { name: 'Solana (SOL)', price: `$${sol.price.toFixed(2)}`, changePct: `${sol.changePct >= 0 ? '+' : ''}${sol.changePct.toFixed(1)}%`, direction: sol.changePct >= 0 ? 'up' : 'down' },
    ].filter(Boolean);

    return NextResponse.json({
      ticker,
      indices,
      commodities,
      crypto,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Markets API error:', error);
    // Return fallback data
    return NextResponse.json({
      ticker: [
        { symbol: 'ES', price: '---', change: '---', direction: 'up' },
        { symbol: 'NQ', price: '---', change: '---', direction: 'up' },
        { symbol: 'BTC', price: '---', change: '---', direction: 'up' },
        { symbol: 'VIX', price: '---', change: '---', direction: 'down' },
        { symbol: '10Y', price: '---', change: '---', direction: 'up' },
      ],
      indices: [],
      commodities: [],
      crypto: [],
      fallback: true,
    });
  }
}
