'use client';

import { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// SPORTS — Scores, News, Standings, Schedules
// Design by Paula · Built by Anders · v2
// Focus: NEWS with images, STANDINGS (NBA East + NHL Atlantic),
//        SCORES with ESPN box score links
// ═══════════════════════════════════════════════════════════════════════════

interface GameData {
  id: string;
  league: string;
  sport: string;
  leagueSlug: string;
  away: string;
  awayFull: string;
  home: string;
  homeFull: string;
  awayScore: string;
  homeScore: string;
  awayLogo: string;
  homeLogo: string;
  status: string;
  statusDetail: string;
  time: string;
  broadcast: string;
  spread: string;
  overUnder: string;
  headline: string;
  awayRecord: string;
  homeRecord: string;
  boxScoreUrl: string;
}

interface NewsArticle {
  headline: string;
  description: string;
  url: string;
  source: string;
  imageUrl: string;
  published: string;
}

interface StandingsTeam {
  rank: number;
  name: string;
  abbr: string;
  record: string;
  isBostonTeam: boolean;
}

interface SportsData {
  scores: GameData[];
  today: GameData[];
  boston_games: GameData[];
  news: NewsArticle[];
  standings: {
    nba_east: StandingsTeam[];
    nhl_atlantic: StandingsTeam[];
  };
}

export default function SportsPage() {
  const [data, setData] = useState<SportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/morning-brief/sports');
        if (!res.ok) throw new Error(`${res.status}`);
        setData(await res.json());
      } catch (e) {
        console.error('Sports data fetch failed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-pulse">LOADING SPORTS DATA...</div>;
  if (!data) return <div className="loading-pulse">SPORTS DATA UNAVAILABLE</div>;

  const bostonAbbrs = ['BOS', 'NE'];
  const isBostonTeam = (abbr: string) => bostonAbbrs.includes(abbr);

  function timeAgo(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <main className="section-page">
      <header className="section-header">
        <h1 className="section-title">Sports</h1>
        <p className="section-subtitle">Scores, schedules, and betting lines. Boston teams in focus.</p>
      </header>

      {/* ══════════ SCOREBOARD — RESULTS ══════════ */}
      {data.scores.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 className="section-table-header">Last Night&apos;s Results</h3>
          <div className="scoreboard">
            {data.scores.map((g, i) => {
              const awayWon = parseInt(g.awayScore) > parseInt(g.homeScore);
              const homeWon = parseInt(g.homeScore) > parseInt(g.awayScore);
              const CardTag = g.boxScoreUrl ? 'a' : 'div';
              const cardProps = g.boxScoreUrl ? {
                href: g.boxScoreUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                style: { display: 'block', textDecoration: 'none', color: 'inherit' },
              } : {};

              return (
                <CardTag key={i} {...cardProps} className="score-card" title={g.boxScoreUrl ? 'View box score on ESPN' : ''}>
                  <div className="score-card-header">
                    <span className="score-card-league">{g.league}</span>
                    <span>{g.status}{g.boxScoreUrl ? ' ↗' : ''}</span>
                  </div>
                  <div className="score-card-teams">
                    <div className="score-team">
                      {g.awayLogo && (
                        <img src={g.awayLogo} alt={g.away} style={{ width: 20, height: 20, marginRight: 8, objectFit: 'contain' }} />
                      )}
                      <span className={`team-name ${awayWon ? 'winner' : ''}`}>{g.awayFull}</span>
                      <span className="team-score">{g.awayScore}</span>
                    </div>
                    <div className="score-team">
                      {g.homeLogo && (
                        <img src={g.homeLogo} alt={g.home} style={{ width: 20, height: 20, marginRight: 8, objectFit: 'contain' }} />
                      )}
                      <span className={`team-name ${homeWon ? 'winner' : ''}`}>{g.homeFull}</span>
                      <span className="team-score">{g.homeScore}</span>
                    </div>
                  </div>
                  {g.headline && (
                    <div className="score-card-footer">{g.headline}</div>
                  )}
                  {(g.awayRecord || g.homeRecord) && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                      {g.away} ({g.awayRecord}) • {g.home} ({g.homeRecord})
                    </div>
                  )}
                </CardTag>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════ TODAY'S GAMES ══════════ */}
      {data.today.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 className="section-table-header">Today&apos;s Games</h3>
          <table className="market-table">
            <thead>
              <tr>
                <th>League</th>
                <th>Matchup</th>
                <th>Time</th>
                <th>TV</th>
                <th>Spread</th>
                <th>O/U</th>
              </tr>
            </thead>
            <tbody>
              {data.today.map((g, i) => {
                const isBos = isBostonTeam(g.away) || isBostonTeam(g.home);
                return (
                  <tr key={i} className={isBos ? 'boston-game' : ''}>
                    <td>
                      <span style={isBos ? { color: 'var(--amber)', fontWeight: 600 } : {}}>{g.league}</span>
                    </td>
                    <td className="symbol">{g.awayFull} @ {g.homeFull}</td>
                    <td className="price">{g.time}</td>
                    <td>{g.broadcast || '—'}</td>
                    <td className={isBos ? 'change up' : ''}>{g.spread || '—'}</td>
                    <td>{g.overUnder || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* ══════════ HEADLINES + SIDEBAR ══════════ */}
      <div className="tech-layout">
        <div className="tech-river">
          {/* ── News Articles with Images ── */}
          <section style={{ marginBottom: 32 }}>
            <h3 className="section-table-header">Headlines</h3>

            {data.news.length > 0 ? (
              data.news.map((article, i) => (
                <article key={i} className="story-cluster">
                  <div className="cluster-main" style={{ display: 'flex', gap: 16 }}>
                    {/* Image thumbnail */}
                    {article.imageUrl && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flexShrink: 0 }}
                      >
                        <img
                          src={article.imageUrl}
                          alt=""
                          style={{
                            width: 140,
                            height: 90,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                          }}
                        />
                      </a>
                    )}
                    <div style={{ flex: 1 }}>
                      {article.published && (
                        <div className="cluster-time">{timeAgo(article.published)}</div>
                      )}
                      <h2 className="cluster-headline">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          {article.headline}
                        </a>
                      </h2>
                      <span className="cluster-source">{article.source || 'ESPN'}</span>
                      {article.description && (
                        <p className="cluster-deck">{article.description}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              /* Fallback: build headlines from game data */
              [...data.scores, ...data.today].filter(g => g.headline).slice(0, 6).map((g, i) => (
                <article key={i} className="story-cluster">
                  <div className="cluster-main">
                    <h2 className="cluster-headline">
                      <a href={g.boxScoreUrl || '#'} target={g.boxScoreUrl ? '_blank' : undefined} rel={g.boxScoreUrl ? 'noopener noreferrer' : undefined}>
                        {g.status === 'Final'
                          ? `${g.awayFull} ${g.awayScore}, ${g.homeFull} ${g.homeScore}`
                          : `${g.awayFull} @ ${g.homeFull} — ${g.time}`}
                      </a>
                    </h2>
                    <span className="cluster-source">{g.league}</span>
                    {g.headline && <p className="cluster-deck">{g.headline}</p>}
                  </div>
                </article>
              ))
            )}

            {data.news.length === 0 && [...data.scores, ...data.today].filter(g => g.headline).length === 0 && (
              <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                No sports headlines available at this time.
              </div>
            )}
          </section>
        </div>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="tech-sidebar">
          {/* ── NBA East Standings ── */}
          {data.standings.nba_east.length > 0 && (
            <div className="sidebar-box">
              <h4>NBA East Standings</h4>
              <div style={{ fontSize: 12 }}>
                {data.standings.nba_east.map((team, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: i < data.standings.nba_east.length - 1 ? '1px solid var(--border)' : 'none',
                      ...(team.isBostonTeam ? { color: 'var(--amber)', fontWeight: 600 } : {}),
                    }}
                  >
                    <span>{team.rank}. {team.name}</span>
                    <span>{team.record}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NHL Atlantic Standings ── */}
          {data.standings.nhl_atlantic.length > 0 && (
            <div className="sidebar-box">
              <h4>NHL Atlantic</h4>
              <div style={{ fontSize: 12 }}>
                {data.standings.nhl_atlantic.map((team, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: i < data.standings.nhl_atlantic.length - 1 ? '1px solid var(--border)' : 'none',
                      ...(team.isBostonTeam ? { color: 'var(--amber)', fontWeight: 600 } : {}),
                    }}
                  >
                    <span>{team.rank}. {team.name}</span>
                    <span>{team.record}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Boston Teams Focus ── */}
          {data.boston_games.length > 0 && (
            <div className="sidebar-box">
              <h4>Boston Teams</h4>
              <div style={{ fontSize: 12 }}>
                {data.boston_games.map((g, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < data.boston_games.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontWeight: 600 }}>
                      {g.awayFull} @ {g.homeFull}
                    </div>
                    <div style={{ color: g.status === 'Final' ? 'var(--text-secondary)' : 'var(--amber)' }}>
                      {g.status === 'Final' ? (
                        <a
                          href={g.boxScoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                        >
                          Final: {g.awayScore}-{g.homeScore} ↗
                        </a>
                      ) : (
                        `${g.time} — ${g.broadcast || g.league}`
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── This Week (upcoming Boston games from today list) ── */}
          <div className="sidebar-box">
            <h4>This Week</h4>
            <div style={{ fontSize: 12 }}>
              {data.today.filter(g => isBostonTeam(g.away) || isBostonTeam(g.home)).length > 0 ? (
                data.today.filter(g => isBostonTeam(g.away) || isBostonTeam(g.home)).map((g, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--amber)', fontSize: 10, textTransform: 'uppercase' }}>Today</div>
                    <div>{g.awayFull} @ {g.homeFull} ({g.time})</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No Boston games scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* ── Injury Report (placeholder — ESPN doesn't expose injuries in free API) ── */}
          <div className="sidebar-box">
            <h4>Injury Report</h4>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
              Check team pages for latest injury updates.
            </div>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <a href="https://www.espn.com/nba/injuries" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>NBA Injuries →</a>
              <a href="https://www.espn.com/nhl/injuries" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>NHL Injuries →</a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="sidebar-box">
            <h4>Quick Links</h4>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="https://www.espn.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>ESPN →</a>
              <a href="https://www.nba.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>NBA.com →</a>
              <a href="https://www.nhl.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>NHL.com →</a>
              <a href="https://www.bostonglobe.com/sports" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Boston Globe Sports →</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
