'use client';

import { useEffect, useState } from 'react';
import styles from '../morning-brief.module.css';

interface TechStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  domain: string;
  descendants: number;
  timeAgo: string;
  hnUrl: string;
}

interface LeaderboardEntry {
  name: string;
  count: number;
}

export default function TechPage() {
  const [stories, setStories] = useState<TechStory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/morning-brief/tech')
      .then(r => r.json())
      .then(data => {
        setStories(data.stories || []);
        setLeaderboard(data.leaderboard || []);
        setTrendingTopics(data.trendingTopics || []);
      })
      .catch(() => {});
  }, []);

  return (
    <main className={styles.sectionPage}>
      <header className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Tech</h1>
        <p className={styles.sectionSubtitle}>The tech news that matters, clustered by story. Techmeme-style.</p>
      </header>

      {stories.length === 0 ? (
        <div className={styles.loading}>
          <span className={styles.loadingDot}>{'\u25CF'}</span> Loading tech news from Hacker News...
        </div>
      ) : (
        <div className={styles.techLayout}>
          {/* MAIN RIVER */}
          <div className={styles.techRiver}>
            {stories.slice(0, 20).map((story, i) => (
              <article key={story.id} className={styles.storyCluster}>
                <div className={styles.clusterTime}>{story.timeAgo}</div>
                <h2 className={styles.clusterHeadline}>
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.title}
                  </a>
                </h2>
                <span className={styles.clusterSource}>{story.domain || 'news.ycombinator.com'}</span>
                <div className={styles.clusterDiscussion}>
                  <a href={story.hnUrl} target="_blank" rel="noopener noreferrer">
                    {story.descendants} comments on Hacker News
                  </a>
                  <span className={styles.muted}> \u2022 {story.score} points by {story.by}</span>
                </div>
              </article>
            ))}
          </div>

          {/* SIDEBAR */}
          <aside className={styles.techSidebar}>
            {/* Source Leaderboard */}
            {leaderboard.length > 0 && (
              <div className={styles.sidebarBox}>
                <h4 className={styles.sidebarBoxTitle}>Source Leaderboard</h4>
                {leaderboard.map((entry, i) => (
                  <div key={i} className={styles.leaderboardItem}>
                    <span className={styles.leaderboardRank}>{i + 1}</span>
                    <span className={styles.leaderboardName}>{entry.name}</span>
                    <span className={styles.leaderboardCount}>{entry.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Topics */}
            {trendingTopics.length > 0 && (
              <div className={styles.sidebarBox}>
                <h4 className={styles.sidebarBoxTitle}>Trending Topics</h4>
                <div className={styles.trendingTopics} style={{ paddingTop: 0, borderTop: 'none', marginTop: 0 }}>
                  {trendingTopics.map(topic => (
                    <span key={topic} className={styles.topic}>{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>Quick Links</h4>
              <div className={styles.quickLinks}>
                <a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer">Hacker News \u2192</a>
                <a href="https://techmeme.com" target="_blank" rel="noopener noreferrer">Techmeme \u2192</a>
                <a href="https://lobste.rs" target="_blank" rel="noopener noreferrer">Lobsters \u2192</a>
                <a href="https://reddit.com/r/technology" target="_blank" rel="noopener noreferrer">r/technology \u2192</a>
              </div>
            </div>

            {/* HN Top Stories (Sidebar version) */}
            <div className={styles.sidebarBox}>
              <h4 className={styles.sidebarBoxTitle}>HN Top by Points</h4>
              {stories.slice(0, 5).map(story => (
                <div key={story.id} className={styles.hnItem}>
                  <a href={story.url} target="_blank" rel="noopener noreferrer" className={styles.hnItemTitle}>
                    {story.title}
                  </a>
                  <span className={styles.hnItemMeta}>
                    {story.score} pts \u2022 {story.descendants} comments
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
