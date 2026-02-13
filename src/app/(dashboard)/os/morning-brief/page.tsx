'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './morning-brief.module.css';

interface MarketData {
  indices: Array<{ name: string; price: string; changePct: string; direction: string }>;
}

interface SportsGame {
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  detail: string;
  startTime: string;
  isBoston: boolean;
}

interface TechStory {
  id: number;
  title: string;
  url: string;
  score: number;
  domain: string;
  descendants: number;
  timeAgo: string;
}

interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  emoji: string;
}

interface WeatherData {
  current: { temp: number; condition: string; emoji: string };
  forecast: WeatherForecast[];
}

interface LocalStory {
  title: string;
  source: string;
}

export default function MorningBriefFrontPage() {
  const [markets, setMarkets] = useState<MarketData | null>(null);
  const [sports, setSports] = useState<SportsGame[]>([]);
  const [tech, setTech] = useState<TechStory[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [local, setLocal] = useState<LocalStory[]>([]);

  useEffect(() => {
    fetch('/api/morning-brief/markets').then(r => r.json()).then(setMarkets).catch(() => {});
    fetch('/api/morning-brief/sports').then(r => r.json()).then(d => setSports(d.allGames || [])).catch(() => {});
    fetch('/api/morning-brief/tech').then(r => r.json()).then(d => setTech(d.stories || [])).catch(() => {});
    fetch('/api/morning-brief/weather').then(r => r.json()).then(setWeather).catch(() => {});
    fetch('/api/morning-brief/local').then(r => r.json()).then(d => setLocal(d.stories || [])).catch(() => {});
  }, []);

  // Get top market story for lead
  const topIndex = markets?.indices?.[0];
  const topMarketDirection = topIndex?.direction === 'up' ? 'rally' : 'pull back';

  // Get top tech stories
  const topTech = tech.slice(0, 3);

  // Get Boston sports games
  const bostonGames = sports.filter(g => g.isBoston).slice(0, 3);
  const recentResults = sports.filter(g => g.status === 'final' && g.isBoston).slice(0, 3);
  const upcomingBostonGames = sports.filter(g => g.status === 'scheduled' && g.isBoston).slice(0, 2);

  // Tech trending
  const trendingTags = ['#AI', '#Crypto', '#Startups', '#DevTools'];

  return (
    <main className={styles.frontPage}>
      {/* LEAD STORY */}
      <section className={styles.leadStory}>
        <div className={styles.sectionFlag}>Markets Today</div>
        <h2 className={styles.leadHeadline}>
          {topIndex
            ? `S&P Futures ${topIndex.direction === 'up' ? 'Up' : 'Down'} ${topIndex.changePct} \u2014 Markets ${topMarketDirection === 'rally' ? 'Rally' : 'Pull Back'} at Open`
            : 'Markets Update \u2014 Loading Latest Data...'}
        </h2>
        <p className={styles.leadDeck}>
          {topIndex
            ? `ES futures at ${topIndex.price}. Track all indices, commodities, crypto, and options flow in The Pit.`
            : 'Loading market data from Yahoo Finance and CoinGecko...'}
        </p>
        <div className={styles.leadMeta}>
          <span className={styles.metaSection}>THE PIT</span>
          <span>Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET</span>
        </div>
      </section>

      {/* THREE COLUMN GRID */}
      <div className={styles.frontGrid}>
        {/* COLUMN 1: THE PIT PREVIEW */}
        <section className={styles.frontColumn}>
          <Link href="/os/morning-brief/the-pit" className={styles.columnHeader}>
            <h3 className={styles.columnHeaderTitle}>The Pit</h3>
            <span className={styles.seeAll}>Full Section \u2192</span>
          </Link>
          {markets?.indices?.slice(0, 3).map((idx, i) => (
            <article key={i} className={styles.frontStory}>
              <h4 className={styles.frontStoryTitle}>{idx.name}: {idx.price}</h4>
              <p className={styles.frontStoryDesc}>
                <span className={idx.direction === 'up' ? styles.up : styles.down}>
                  {idx.changePct}
                </span>
              </p>
            </article>
          )) || (
            <div className={styles.loading}>Loading market data...</div>
          )}
          {markets?.indices && markets.indices.length > 0 && (
            <div className={styles.quickStats}>
              <div className={styles.stat}>
                <span className={`${styles.statValue} ${markets.indices[0]?.direction === 'up' ? styles.up : styles.down}`}>
                  {markets.indices[0]?.changePct}
                </span>
                <span className={styles.statLabel}>S&P Futures</span>
              </div>
            </div>
          )}
        </section>

        {/* COLUMN 2: SPORTS PREVIEW */}
        <section className={styles.frontColumn}>
          <Link href="/os/morning-brief/sports" className={styles.columnHeader}>
            <h3 className={styles.columnHeaderTitle}>Sports</h3>
            <span className={styles.seeAll}>Full Section \u2192</span>
          </Link>
          {recentResults.length > 0 ? recentResults.map((game, i) => (
            <article key={i} className={styles.frontStory}>
              <h4 className={styles.frontStoryTitle}>
                {game.awayTeam} {game.awayScore} @ {game.homeTeam} {game.homeScore}
              </h4>
              <p className={styles.frontStoryDesc}>{game.league} \u2014 {game.detail}</p>
            </article>
          )) : bostonGames.length > 0 ? bostonGames.slice(0, 3).map((game, i) => (
            <article key={i} className={styles.frontStory}>
              <h4 className={styles.frontStoryTitle}>
                {game.awayTeam} @ {game.homeTeam}
              </h4>
              <p className={styles.frontStoryDesc}>{game.league} \u2014 {game.startTime}</p>
            </article>
          )) : (
            <div className={styles.loading}>Loading scores...</div>
          )}
          {upcomingBostonGames.length > 0 && (
            <div className={styles.gamesToday}>
              {upcomingBostonGames.map((game, i) => (
                <div key={i} className={styles.game}>
                  <span className={styles.gameTeams}>
                    {game.awayTeam.split(' ').pop()} @ {game.homeTeam.split(' ').pop()}
                  </span>
                  <span className={styles.gameTime}>{game.startTime}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMN 3: TECH PREVIEW */}
        <section className={styles.frontColumn}>
          <Link href="/os/morning-brief/tech" className={styles.columnHeader}>
            <h3 className={styles.columnHeaderTitle}>Tech</h3>
            <span className={styles.seeAll}>Full Section \u2192</span>
          </Link>
          {topTech.length > 0 ? topTech.map((story, i) => (
            <article key={i} className={styles.frontStory}>
              <h4 className={styles.frontStoryTitle}>{story.title}</h4>
              <p className={styles.frontStoryDesc}>
                {story.domain} \u2022 {story.score} pts \u2022 {story.descendants} comments
              </p>
            </article>
          )) : (
            <div className={styles.loading}>Loading tech news...</div>
          )}
          <div className={styles.trendingTopics}>
            {trendingTags.map(tag => (
              <span key={tag} className={styles.topic}>{tag}</span>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM ROW */}
      <div className={styles.frontBottom}>
        {/* LOCAL NEWS */}
        <section className={styles.bottomSection}>
          <Link href="/os/morning-brief/local" className={styles.columnHeader}>
            <h3 className={styles.columnHeaderTitle}>Nashua News</h3>
            <span className={styles.seeAll}>More \u2192</span>
          </Link>
          {local.slice(0, 3).map((story, i) => (
            <article key={i} className={styles.localStory}>
              <h4 className={styles.localStoryTitle}>{story.title}</h4>
            </article>
          ))}
        </section>

        {/* AI TODAY */}
        <section className={styles.bottomSection}>
          <Link href="/os/morning-brief/ai-today" className={styles.columnHeader}>
            <h3 className={styles.columnHeaderTitle}>AI Today</h3>
            <span className={styles.seeAll}>More \u2192</span>
          </Link>
          {topTech.filter(s => 
            s.title.toLowerCase().includes('ai') || 
            s.title.toLowerCase().includes('llm') ||
            s.title.toLowerCase().includes('gpt') ||
            s.title.toLowerCase().includes('model')
          ).slice(0, 3).map((story, i) => (
            <article key={i} className={styles.localStory}>
              <h4 className={styles.localStoryTitle}>{story.title}</h4>
            </article>
          ))}
          {topTech.filter(s => 
            s.title.toLowerCase().includes('ai') || 
            s.title.toLowerCase().includes('llm') ||
            s.title.toLowerCase().includes('gpt') ||
            s.title.toLowerCase().includes('model')
          ).length === 0 && (
            <article className={styles.localStory}>
              <h4 className={styles.localStoryTitle}>Latest AI news and landscape analysis \u2192</h4>
            </article>
          )}
        </section>

        {/* HEADLINES */}
        <section className={styles.bottomSection}>
          <h3 className={styles.bottomSectionTitle}>Headlines</h3>
          <div className={styles.headlineList}>
            {sports.filter(g => g.status === 'final' && g.isBoston).slice(0, 2).map((game, i) => (
              <article key={`s${i}`} className={styles.headlineItem}>
                <span className={styles.headlineTagSports}>SPORTS</span>
                <h4 className={styles.headlineItemTitle}>
                  {game.awayTeam} {game.awayScore} @ {game.homeTeam} {game.homeScore} \u2014 Final
                </h4>
              </article>
            ))}
            {topTech.slice(0, 2).map((story, i) => (
              <article key={`t${i}`} className={styles.headlineItem}>
                <span className={styles.headlineTagNational}>TECH</span>
                <h4 className={styles.headlineItemTitle}>{story.title}</h4>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* WEATHER BAR */}
      {weather && (
        <div className={styles.weatherBar}>
          <div className={styles.weatherBarLocation}>Nashua, NH</div>
          <div className={styles.weatherBarNow}>
            <span className={styles.weatherBarTemp}>{Math.round(weather.current.temp)}\u00B0F</span>
            <span className={styles.weatherBarCond}>{weather.current.condition}</span>
          </div>
          <div className={styles.weatherBarForecast}>
            {weather.forecast?.slice(0, 4).map((f, i) => (
              <span key={i}>{f.day}: {f.high}\u00B0/{f.low}\u00B0 {f.emoji}</span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
