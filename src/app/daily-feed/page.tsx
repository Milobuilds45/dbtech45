import { brand, styles } from "@/lib/brand";

const entries = [
  { time: "2026-02-10 20:58", tag: "DEPLOY", color: brand.success, text: "Anders fixed OS navigation links — all sidebar items now functional" },
  { time: "2026-02-10 20:45", tag: "BUILD", color: brand.info, text: "dbtech45.com redesign deployed to production — terminal theme active" },
  { time: "2026-02-10 15:30", tag: "MARKET", color: brand.amber, text: "Bobby signals: ES breaking 5480 resistance, watching for retest and hold" },
  { time: "2026-02-10 14:15", tag: "TASK", color: brand.info, text: "Sunday Squares payment integration 95% complete — launching Feb 12" },
  { time: "2026-02-10 12:00", tag: "IDEA", color: brand.success, text: "New vault entry: Voice Trading Journal — AI assistant for trade logging" },
  { time: "2026-02-10 10:45", tag: "ALERT", color: brand.error, text: "VIX compression to 14-handle — complacency zone, hedges cheap" },
  { time: "2026-02-10 09:30", tag: "BUILD", color: brand.info, text: "Soul Solace mood tracking UI mockups completed by Paula" },
  { time: "2026-02-10 08:00", tag: "MARKET", color: brand.amber, text: "Pre-market: BTC reclaiming 67K with volume — momentum flip confirmed" },
];

export default function DailyFeed() {
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={styles.h1}>Daily Feed</h1>
        <p style={styles.subtitle}>Real-time updates from projects, markets, and team activity.</p>

        <div style={styles.card}>
          {entries.map((e, i) => (
            <div key={i} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: i < entries.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
              <span style={{ color: brand.smoke, fontSize: '13px', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>{e.time}</span>
              <span style={{ color: e.color, fontSize: '12px', fontWeight: 600, minWidth: '56px', fontFamily: "'JetBrains Mono', monospace" }}>{e.tag}</span>
              <span style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.4' }}>{e.text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
