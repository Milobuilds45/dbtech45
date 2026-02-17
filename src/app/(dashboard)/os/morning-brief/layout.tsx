'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './morning-brief.module.css';

interface WeatherData {
  temp: number;
  feelsLike?: number;
  condition: string;
}

interface TickerData {
  symbol: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
}

const NAV_ITEMS = [
  { label: 'Front Page', href: '/os/morning-brief' },
  { label: 'The Pit', href: '/os/morning-brief/the-pit' },
  { label: 'Sports', href: '/os/morning-brief/sports' },
  { label: 'Tech', href: '/os/morning-brief/tech' },
  { label: 'Local', href: '/os/morning-brief/local' },
  { label: 'AI Today', href: '/os/morning-brief/ai-today' },
];

const QUOTES = [
  { text: '\u201CThe market can stay irrational longer than you can stay solvent.\u201D', attr: '\u2014 John Maynard Keynes' },
  { text: '\u201CIn investing, what is comfortable is rarely profitable.\u201D', attr: '\u2014 Robert Arnott' },
  { text: '\u201CThe stock market is a device for transferring money from the impatient to the patient.\u201D', attr: '\u2014 Warren Buffett' },
  { text: '\u201CRisk comes from not knowing what you\u2019re doing.\u201D', attr: '\u2014 Warren Buffett' },
  { text: '\u201CBe fearful when others are greedy and greedy when others are fearful.\u201D', attr: '\u2014 Warren Buffett' },
];

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MorningBriefLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/os/morning-brief';
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [ticker, setTicker] = useState<TickerData[]>([]);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    fetch('/api/morning-brief/weather')
      .then(r => r.json())
      .then(data => {
        if (data.current) {
          setWeather({ temp: Math.round(data.current.temp), feelsLike: data.current.feelsLike, condition: data.current.condition });
        }
      })
      .catch(() => {});

    fetch('/api/morning-brief/markets')
      .then(r => r.json())
      .then(data => {
        if (data.ticker) setTicker(data.ticker);
      })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.newspaper}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {/* MASTHEAD */}
      <header className={isHomePage ? styles.masthead : styles.mastheadCompact}>
        <div className={styles.mastheadTop}>
          <div className={styles.mastheadDate}>{formatDate()}</div>
          <div className={styles.mastheadWeather}>
            <span className={styles.weatherTemp}>
              {weather ? `${weather.temp}\u00B0F` : '--\u00B0F'}
              {weather?.feelsLike !== undefined && weather.feelsLike !== weather.temp && (
                <span style={{ fontSize: 10, color: '#A3A3A3', marginLeft: 6 }}>Feels {weather.feelsLike}{'\u00B0'}</span>
              )}
            </span>
            {weather && <span>{weather.condition}</span>}
            <span>Nashua, NH</span>
          </div>
        </div>
        <h1 className={isHomePage ? styles.mastheadTitle : styles.mastheadTitleCompact}>
          THE MORNING <span className={styles.mastheadTitleAccent}>BRIEF</span>
        </h1>
        {isHomePage && (
          <p className={styles.mastheadTagline}>Trade by day. Build by night. Dad of 7 always.</p>
        )}
      </header>

      {/* NAVIGATION */}
      <nav className={styles.sectionNav}>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? styles.navItemActive : styles.navItem}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* TICKER BAR */}
      <div className={styles.tickerBar}>
        {ticker.length > 0 ? ticker.map(t => (
          <div key={t.symbol} className={styles.tickerItem}>
            <span className={styles.tickerSymbol}>{t.symbol}</span>
            <span className={styles.tickerPrice}>{t.price}</span>
            <span className={t.direction === 'up' ? styles.tickerChangeUp : styles.tickerChangeDown}>
              {t.change}
            </span>
          </div>
        )) : (
          <>
            {['ES', 'NQ', 'BTC', 'VIX', '10Y'].map(sym => (
              <div key={sym} className={styles.tickerItem}>
                <span className={styles.tickerSymbol}>{sym}</span>
                <span className={styles.tickerPrice}>---</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* PAGE CONTENT */}
      {children}

      {/* FOOTER */}
      <footer className={styles.footer}>
        {isHomePage && (
          <>
            <p className={styles.footerQuote}>{quote.text}</p>
            <p className={styles.footerAttr}>{quote.attr}</p>
          </>
        )}
        <div className={styles.footerTagline}>Imagination \u2192 Implementation</div>
      </footer>
    </div>
  );
}
