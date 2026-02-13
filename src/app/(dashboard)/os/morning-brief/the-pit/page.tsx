'use client';

import { useEffect, useState } from 'react';
import styles from '../morning-brief.module.css';

interface MarketItem {
  name: string;
  price: string;
  change?: string;
  changePct: string;
  direction: string;
}

interface MarketData {
  indices: MarketItem[];
  commodities: MarketItem[];
  crypto: Array<{ name: string; price: string; changePct: string; direction: string }>;
}

export default function ThePitPage() {
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    fetch('/api/morning-brief/markets')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const renderTable = (title: string, items: MarketItem[], showChange = true) => (
    <section style={{ marginBottom: 32 }}>
      <h3 className={styles.pitTableHeader}>{title}</h3>
      <table className={styles.marketTable}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Last</th>
            {showChange && <th>Change</th>}
            <th>% Change</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className={styles.tdSymbol}>{item.name}</td>
              <td className={styles.tdPrice}>{item.price}</td>
              {showChange && (
                <td className={item.direction === 'up' ? styles.tdChangeUp : styles.tdChangeDown}>
                  {item.change || '\u2014'}
                </td>
              )}
              <td className={item.direction === 'up' ? styles.tdChangeUp : styles.tdChangeDown}>
                {item.changePct}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <main className={styles.sectionPage}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>The Pit</h1>
        <p className={styles.sectionSubtitle}>Markets, futures, options flow, and everything that moves.</p>
      </header>

      {/* MARKET HEADLINE */}
      {data?.indices?.[0] && (
        <section className={styles.leadStory} style={{ marginBottom: 32 }}>
          <div className={styles.sectionFlag}>Market Update</div>
          <h2 className={styles.leadHeadline}>
            S&P Futures at {data.indices[0].price} \u2014 {data.indices[0].direction === 'up' ? 'Green' : 'Red'} {data.indices[0].changePct}
          </h2>
          <p className={styles.leadDeck}>
            Live market data from Yahoo Finance and CoinGecko. All prices update every 5 minutes.
          </p>
          <div className={styles.leadMeta}>
            <span style={{ fontSize: 12, color: '#525252' }}>
              Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET
            </span>
          </div>
        </section>
      )}

      <div className={styles.techLayout}>
        {/* MAIN CONTENT */}
        <div className={styles.techRiver}>
          {!data ? (
            <div className={styles.loading}>
              <span className={styles.loadingDot}>\u25CF</span> Loading market data...
            </div>
          ) : (
            <>
              {data.indices.length > 0 && renderTable('Indices & Futures', data.indices)}
              {data.commodities.length > 0 && renderTable('Commodities & Rates', data.commodities)}
              {data.crypto.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                  <h3 className={styles.pitTableHeader}>Crypto</h3>
                  <table className={styles.marketTable}>
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Last</th>
                        <th>% Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.crypto.map((item, i) => (
                        <tr key={i}>
                          <td className={styles.tdSymbol}>{item.name}</td>
                          <td className={styles.tdPrice}>{item.price}</td>
                          <td className={item.direction === 'up' ? styles.tdChangeUp : styles.tdChangeDown}>
                            {item.changePct}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className={styles.techSidebar}>
          {/* Quick Stats */}
          <div className={styles.sidebarBox}>
            <h4 className={styles.sidebarBoxTitle}>By the Numbers</h4>
            {data?.indices?.slice(0, 3).map((idx, i) => (
              <div key={i} className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>{idx.name.split('(')[0].trim()}</span>
                <span className={`${styles.sidebarStatValue} ${idx.direction === 'up' ? styles.up : styles.down}`}>
                  {idx.changePct}
                </span>
              </div>
            ))}
            {data?.crypto?.[0] && (
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Bitcoin</span>
                <span className={`${styles.sidebarStatValue} ${data.crypto[0].direction === 'up' ? styles.up : styles.down}`}>
                  {data.crypto[0].changePct}
                </span>
              </div>
            )}
          </div>

          {/* Sector Performance - placeholder */}
          <div className={styles.sidebarBox}>
            <h4 className={styles.sidebarBoxTitle}>Trading Notes</h4>
            <ul className={styles.tradingNoteList}>
              <li className={styles.tradingNote}>
                <strong className={styles.tradingNoteKey}>ES:</strong> Watch key support and resistance levels at round numbers.
              </li>
              <li className={styles.tradingNote}>
                <strong className={styles.tradingNoteKey}>NQ:</strong> Tech-heavy, watch mega-cap earnings impacts.
              </li>
              <li className={styles.tradingNote}>
                <strong className={styles.tradingNoteKey}>BTC:</strong> Institutional flows driving price action.
              </li>
              <li className={styles.tradingNote}>
                <strong className={styles.tradingNoteKey}>VIX:</strong> Low VIX environment, watch for spikes.
              </li>
            </ul>
          </div>

          {/* Sector Performance */}
          <div className={styles.sidebarBox}>
            <h4 className={styles.sidebarBoxTitle}>Quick Links</h4>
            <div className={styles.quickLinks}>
              <a href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer">Yahoo Finance \u2192</a>
              <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer">TradingView \u2192</a>
              <a href="https://www.cmegroup.com" target="_blank" rel="noopener noreferrer">CME Group \u2192</a>
              <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko \u2192</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
