'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from "@/lib/brand";
import { RefreshCw, Trophy, Calendar, TrendingUp, Star, ChevronRight } from 'lucide-react';

interface Game {
  id: string;
  status: string;
  statusDetail: string;
  homeTeam: { name: string; abbreviation: string; logo: string; score: string; record?: string };
  awayTeam: { name: string; abbreviation: string; logo: string; score: string; record?: string };
  venue?: string;
  broadcast?: string;
  time?: string;
}

interface NewsItem {
  headline: string;
  description: string;
  image?: string;
  url: string;
  published: string;
}

interface Standing {
  team: string;
  abbreviation: string;
  wins: number;
  losses: number;
  pct: string;
  gb?: string;
  streak?: string;
  logo?: string;
}

type Sport = 'nba' | 'nfl' | 'mlb';
type Tab = 'scores' | 'news' | 'standings';

const SPORTS_CONFIG = {
  nba: { name: 'NBA', color: '#1D428A', league: 'basketball/nba', favoriteTeam: 'BOS' },
  nfl: { name: 'NFL', color: '#013369', league: 'football/nfl', favoriteTeam: 'NE' },
  mlb: { name: 'MLB', color: '#002D72', league: 'baseball/mlb', favoriteTeam: 'BOS' },
};

export default function SportsPage() {
  const [sport, setSport] = useState<Sport>('nba');
  const [tab, setTab] = useState<Tab>('scores');
  const [games, setGames] = useState<Game[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [sport, tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'scores') await fetchScores();
      else if (tab === 'news') await fetchNews();
      else if (tab === 'standings') await fetchStandings();
    } catch (e) {
      console.error('Fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchScores = async () => {
    try {
      const res = await fetch(`/api/sports/scores?sport=${sport}`);
      const data = await res.json();
      setGames(data.games || []);
    } catch (e) {
      console.error('Scores fetch failed:', e);
      setGames([]);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(`/api/sports/news?sport=${sport}`);
      const data = await res.json();
      setNews(data.news || []);
    } catch (e) {
      console.error('News fetch failed:', e);
      setNews([]);
    }
  };

  const fetchStandings = async () => {
    try {
      const res = await fetch(`/api/sports/standings?sport=${sport}`);
      const data = await res.json();
      setStandings(data.standings || []);
    } catch (e) {
      console.error('Standings fetch failed:', e);
      setStandings([]);
    }
  };

  const config = SPORTS_CONFIG[sport];

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={styles.h1}>Sports Central</h1>
            <p style={styles.subtitle}>Live scores · News · Standings</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              background: 'transparent',
              border: `1px solid ${brand.border}`,
              borderRadius: 8,
              padding: '8px 16px',
              color: brand.smoke,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Sport Selector */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {(Object.keys(SPORTS_CONFIG) as Sport[]).map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                background: sport === s ? SPORTS_CONFIG[s].color : brand.carbon,
                color: sport === s ? '#fff' : brand.smoke,
                border: sport === s ? `2px solid ${SPORTS_CONFIG[s].color}` : `1px solid ${brand.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {SPORTS_CONFIG[s].name}
            </button>
          ))}
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: `1px solid ${brand.border}`, paddingBottom: 8 }}>
          {[
            { id: 'scores', label: 'Scores', icon: Trophy },
            { id: 'news', label: 'News', icon: TrendingUp },
            { id: 'standings', label: 'Standings', icon: Star },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  background: tab === t.id ? `${config.color}20` : 'transparent',
                  color: tab === t.id ? config.color : brand.smoke,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: brand.smoke }}>
            Loading {config.name} {tab}...
          </div>
        ) : (
          <>
            {/* Scores Tab */}
            {tab === 'scores' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                {games.length === 0 ? (
                  <div style={{ ...styles.card, textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
                    <p style={{ color: brand.smoke }}>No games scheduled today</p>
                  </div>
                ) : (
                  games.map(game => {
                    const isLive = game.status === 'in';
                    const isFinal = game.status === 'post';
                    const isFavorite = game.homeTeam.abbreviation === config.favoriteTeam || game.awayTeam.abbreviation === config.favoriteTeam;
                    
                    return (
                      <div
                        key={game.id}
                        style={{
                          ...styles.card,
                          borderLeft: isFavorite ? `4px solid ${config.color}` : undefined,
                          background: isLive ? `linear-gradient(135deg, ${brand.carbon} 0%, rgba(239,68,68,0.05) 100%)` : brand.carbon,
                        }}
                      >
                        {/* Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: isLive ? 'rgba(239,68,68,0.2)' : isFinal ? 'rgba(107,114,128,0.2)' : 'rgba(59,130,246,0.2)',
                            color: isLive ? brand.error : isFinal ? brand.smoke : brand.info,
                            textTransform: 'uppercase',
                          }}>
                            {isLive ? '🔴 LIVE' : game.statusDetail}
                          </span>
                          {game.broadcast && <span style={{ fontSize: 11, color: brand.smoke }}>{game.broadcast}</span>}
                        </div>

                        {/* Teams */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Away Team */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {game.awayTeam.logo && (
                                <img src={game.awayTeam.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                              )}
                              <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: brand.white }}>{game.awayTeam.name}</div>
                                {game.awayTeam.record && <div style={{ fontSize: 11, color: brand.smoke }}>{game.awayTeam.record}</div>}
                              </div>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: brand.white, fontFamily: "'JetBrains Mono', monospace" }}>
                              {game.awayTeam.score || '-'}
                            </div>
                          </div>

                          {/* Home Team */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {game.homeTeam.logo && (
                                <img src={game.homeTeam.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                              )}
                              <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: brand.white }}>{game.homeTeam.name}</div>
                                {game.homeTeam.record && <div style={{ fontSize: 11, color: brand.smoke }}>{game.homeTeam.record}</div>}
                              </div>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: brand.white, fontFamily: "'JetBrains Mono', monospace" }}>
                              {game.homeTeam.score || '-'}
                            </div>
                          </div>
                        </div>

                        {game.venue && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${brand.border}`, fontSize: 11, color: brand.smoke }}>
                            📍 {game.venue}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* News Tab */}
            {tab === 'news' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                {news.length === 0 ? (
                  <div style={{ ...styles.card, textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
                    <p style={{ color: brand.smoke }}>No news available</p>
                  </div>
                ) : (
                  news.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...styles.card,
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                        />
                      )}
                      <div style={{ fontSize: 15, fontWeight: 600, color: brand.white, marginBottom: 8, lineHeight: 1.4 }}>
                        {item.headline}
                      </div>
                      <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.5, flex: 1 }}>
                        {item.description?.slice(0, 150)}{item.description?.length > 150 ? '...' : ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${brand.border}` }}>
                        <span style={{ fontSize: 11, color: brand.smoke }}>{item.published}</span>
                        <span style={{ fontSize: 12, color: config.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                          Read more <ChevronRight size={14} />
                        </span>
                      </div>
                    </a>
                  ))
                )}
              </div>
            )}

            {/* Standings Tab */}
            {tab === 'standings' && (
              <div style={styles.card}>
                {standings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: brand.smoke }}>Standings unavailable</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${brand.border}` }}>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>#</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>Team</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>W</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>L</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>PCT</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>GB</th>
                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, color: brand.smoke, fontWeight: 600, textTransform: 'uppercase' }}>STRK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, i) => {
                        const isFavorite = team.abbreviation === config.favoriteTeam;
                        return (
                          <tr
                            key={i}
                            style={{
                              borderBottom: `1px solid ${brand.border}`,
                              background: isFavorite ? `${config.color}10` : 'transparent',
                            }}
                          >
                            <td style={{ padding: '12px 8px', fontSize: 13, color: brand.smoke }}>{i + 1}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {team.logo && <img src={team.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />}
                                <span style={{ fontSize: 14, fontWeight: isFavorite ? 700 : 500, color: isFavorite ? config.color : brand.white }}>
                                  {team.team}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: brand.white, fontFamily: "'JetBrains Mono', monospace" }}>{team.wins}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: brand.white, fontFamily: "'JetBrains Mono', monospace" }}>{team.losses}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: brand.white, fontFamily: "'JetBrains Mono', monospace" }}>{team.pct}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: brand.smoke, fontFamily: "'JetBrains Mono', monospace" }}>{team.gb || '-'}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: team.streak?.startsWith('W') ? brand.success : brand.error }}>{team.streak || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
