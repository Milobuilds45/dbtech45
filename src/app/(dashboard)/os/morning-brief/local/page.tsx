'use client';

import { useEffect, useState } from 'react';
import styles from '../morning-brief.module.css';

interface LocalStory {
  title: string;
  url: string;
  source: string;
  description: string;
  time: string;
  town?: string;
}

interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  emoji: string;
}

interface WeatherData {
  current: { temp: number; feelsLike?: number; condition: string; emoji: string; windSpeed: number; humidity: number };
  forecast: WeatherForecast[];
}

export default function LocalPage() {
  const [stories, setStories] = useState<LocalStory[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('/api/morning-brief/local').then(r => r.json()).then(d => setStories(d.stories || [])).catch(() => {});
    fetch('/api/morning-brief/weather').then(r => r.json()).then(setWeather).catch(() => {});
  }, []);

  return (
    <main className={styles.sectionPage}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Local</h1>
        <p className={styles.sectionSubtitle}>News from Nashua & Hudson NH, Lowell, Dracut & Chelmsford MA.</p>
      </header>

      <div className={styles.techLayout}>
        <div className={styles.techRiver}>
          {stories.length === 0 ? (
            <div className={styles.loading}>
              <span className={styles.loadingDot}>{'\u25CF'}</span> Loading local news...
            </div>
          ) : (
            stories.map((story, i) => (
              <article key={i} className={styles.storyCluster}>
                <div className={styles.clusterTime}>{story.time}</div>
                <h2 className={styles.clusterHeadline}>
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.title}
                  </a>
                </h2>
                <span className={styles.clusterSource}>{story.source}{story.town ? ` \u2022 ${story.town}` : ''}</span>
                {story.description && (
                  <p className={styles.clusterDeck}>{story.description}</p>
                )}
              </article>
            ))
          )}
        </div>

        {/* SIDEBAR */}
        <aside className={styles.techSidebar}>
          {/* Weather Detail */}
          {weather && (
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>Weather - Nashua</h4>
              <div className={styles.weatherCurrent}>
                <div className={styles.weatherTempLarge}>{Math.round(weather.current.temp)}{'\u00B0'}</div>
                {weather.current.feelsLike !== undefined && weather.current.feelsLike !== weather.current.temp && (
                  <div style={{ fontSize: 13, color: '#A3A3A3', marginTop: 2 }}>
                    Feels like {weather.current.feelsLike}{'\u00B0'}
                  </div>
                )}
                <div className={styles.weatherCondition}>
                  {weather.current.emoji} {weather.current.condition}
                </div>
              </div>
              {weather.forecast?.map((f, i) => (
                <div key={i} className={styles.weatherForecastRow}>
                  <span>{f.day}</span>
                  <span>{f.high}{'\u00B0'} / {f.low}{'\u00B0'} {f.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {/* Traffic */}
          <div className={styles.sidebarBox}>
            <h4 className={styles.sidebarBoxTitle}>Traffic & Commute</h4>
            <div className={styles.trafficItem}>
              <div className={styles.trafficRoute}>Route 3 South</div>
              <div className={styles.trafficDelay}>{'\u26A0\uFE0F'} Check for delays</div>
            </div>
            <div className={styles.trafficItem}>
              <div className={styles.trafficRoute}>Everett Turnpike</div>
              <div className={styles.trafficClear}>{'\u2713'} Typically clear</div>
            </div>
            <div className={styles.trafficItem}>
              <div className={styles.trafficRoute}>Route 101A</div>
              <div className={styles.trafficClear}>{'\u2713'} Typically clear</div>
            </div>
            <div className={styles.trafficItem}>
              <div className={styles.trafficRoute}>I-93 to Boston</div>
              <div className={styles.trafficDelay}>{'\u26A0\uFE0F'} Variable \u2014 Salem area</div>
            </div>
          </div>

          {/* Local Links */}
          <div className={styles.sidebarBox}>
            <h4 className={styles.sidebarBoxTitle}>Local Links</h4>
            <div className={styles.quickLinks}>
              <a href="https://www.nashuatelegraph.com" target="_blank" rel="noopener noreferrer">Nashua Telegraph \u2192</a>
              <a href="https://www.unionleader.com" target="_blank" rel="noopener noreferrer">Union Leader \u2192</a>
              <a href="https://www.wmur.com" target="_blank" rel="noopener noreferrer">WMUR News \u2192</a>
              <a href="https://www.lowellsun.com" target="_blank" rel="noopener noreferrer">Lowell Sun \u2192</a>
              <a href="https://www.nashuanh.gov" target="_blank" rel="noopener noreferrer">City of Nashua \u2192</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
