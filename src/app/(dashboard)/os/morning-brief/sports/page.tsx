'use client';

import { useEffect, useState } from 'react';
import styles from '../morning-brief.module.css';

interface Game {
  league: string;
  status: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  detail: string;
  startTime: string;
  isBoston: boolean;
}

export default function SportsPage() {
  const [completed, setCompleted] = useState<Game[]>([]);
  const [live, setLive] = useState<Game[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);

  useEffect(() => {
    fetch('/api/morning-brief/sports')
      .then(r => r.json())
      .then(data => {
        setCompleted(data.completed || []);
        setLive(data.live || []);
        setUpcoming(data.upcoming || []);
      })
      .catch(() => {});
  }, []);

  const renderScoreCard = (game: Game, index: number) => {
    const isFinal = game.status === 'final';
    const homeWins = isFinal && game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore;
    const awayWins = isFinal && game.homeScore !== null && game.awayScore !== null && game.awayScore > game.homeScore;

    return (
      <div key={index} className={styles.scoreCard} style={game.isBoston ? { borderLeft: '3px solid #F59E0B' } : {}}>
        <div className={styles.scoreCardHeader}>
          <span className={styles.scoreCardLeague}>{game.league}</span>
          <span>{game.status === 'final' ? 'Final' : game.status === 'live' ? '\uD83D\uDD34 LIVE' : game.startTime}</span>
        </div>
        <div className={styles.scoreCardTeams}>
          <div className={styles.scoreTeam}>
            <span className={awayWins ? styles.teamNameWinner : styles.teamName}>
              {game.awayTeam}
            </span>
            {game.awayScore !== null && (
              <span className={styles.teamScore}>{game.awayScore}</span>
            )}
          </div>
          <div className={styles.scoreTeam}>
            <span className={homeWins ? styles.teamNameWinner : styles.teamName}>
              {game.homeTeam}
            </span>
            {game.homeScore !== null && (
              <span className={styles.teamScore}>{game.homeScore}</span>
            )}
          </div>
        </div>
        <div className={styles.scoreCardFooter}>
          {game.detail}
        </div>
      </div>
    );
  };

  const allLoading = completed.length === 0 && live.length === 0 && upcoming.length === 0;

  return (
    <main className={styles.sectionPage}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Sports</h1>
        <p className={styles.sectionSubtitle}>Scores, schedules, and betting lines. Boston teams in focus.</p>
      </header>

      {allLoading ? (
        <div className={styles.loading}>
          <span className={styles.loadingDot}>{'\u25CF'}</span> Loading scores from ESPN...
        </div>
      ) : (
        <>
          {/* LIVE GAMES */}
          {live.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 className={styles.pitTableHeader}>{'\uD83D\uDD34'} Live Now</h3>
              <div className={styles.scoreboard}>
                {live.map((game, i) => renderScoreCard(game, i))}
              </div>
            </section>
          )}

          {/* COMPLETED GAMES */}
          {completed.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 className={styles.pitTableHeader}>Recent Results</h3>
              <div className={styles.scoreboard}>
                {completed.map((game, i) => renderScoreCard(game, i))}
              </div>
            </section>
          )}

          {/* UPCOMING GAMES */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 className={styles.pitTableHeader}>{"Today\u2019s Games"}</h3>
              <table className={styles.marketTable}>
                <thead>
                  <tr>
                    <th>League</th>
                    <th>Matchup</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((game, i) => (
                    <tr key={i} className={game.isBoston ? styles.bostonHighlight : ''}>
                      <td>
                        <span className={game.isBoston ? styles.amber : ''} style={{ fontWeight: game.isBoston ? 600 : 400 }}>
                          {game.league}
                        </span>
                      </td>
                      <td className={styles.tdSymbol}>
                        {game.awayTeam} @ {game.homeTeam}
                      </td>
                      <td className={styles.tdPrice}>{game.startTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      <div className={styles.techLayout}>
        <div className={styles.techRiver}>
          {/* Boston-focused headlines from completed games */}
          {completed.filter(g => g.isBoston).length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 className={styles.pitTableHeader}>Boston Headlines</h3>
              {completed.filter(g => g.isBoston).map((game, i) => {
                const homeWin = game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore;
                const bostonIsHome = game.homeTeam.includes('Boston') || game.homeTeam.includes('Celtics') || game.homeTeam.includes('Bruins') || game.homeTeam.includes('Red Sox') || game.homeTeam.includes('Patriots');
                const bostonWon = bostonIsHome ? homeWin : !homeWin;
                const bostonTeam = bostonIsHome ? game.homeTeam : game.awayTeam;
                const otherTeam = bostonIsHome ? game.awayTeam : game.homeTeam;
                const bostonScore = bostonIsHome ? game.homeScore : game.awayScore;
                const otherScore = bostonIsHome ? game.awayScore : game.homeScore;

                return (
                  <article key={i} className={styles.storyCluster}>
                    <div className={styles.clusterHeadline}>
                      {bostonTeam} {bostonWon ? 'Beat' : 'Fall to'} {otherTeam} {bostonScore}-{otherScore}
                    </div>
                    <span className={styles.clusterSource}>{game.league}</span>
                    <p className={styles.clusterDeck}>{game.detail}</p>
                  </article>
                );
              })}
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className={styles.techSidebar}>
          {/* Boston Games Today */}
          {upcoming.filter(g => g.isBoston).length > 0 && (
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>Boston Today</h4>
              {upcoming.filter(g => g.isBoston).map((game, i) => (
                <div key={i} className={styles.scheduleItem}>
                  <div className={styles.scheduleDate}>{game.league}</div>
                  <div>{game.awayTeam.split(' ').pop()} @ {game.homeTeam.split(' ').pop()} - {game.startTime}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div className={styles.sidebarBox}>
            <h4 className={styles.sidebarBoxTitle}>Quick Links</h4>
            <div className={styles.quickLinks}>
              <a href="https://www.espn.com" target="_blank" rel="noopener noreferrer">ESPN \u2192</a>
              <a href="https://www.nba.com/celtics" target="_blank" rel="noopener noreferrer">Celtics \u2192</a>
              <a href="https://www.nhl.com/bruins" target="_blank" rel="noopener noreferrer">Bruins \u2192</a>
              <a href="https://www.patriots.com" target="_blank" rel="noopener noreferrer">Patriots \u2192</a>
              <a href="https://www.mlb.com/redsox" target="_blank" rel="noopener noreferrer">Red Sox \u2192</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
