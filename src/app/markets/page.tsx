import { brand, styles } from "@/lib/brand";

const tickers = [
  { symbol: "ES", price: "5,487.25", change: "+0.82%", up: true },
  { symbol: "NQ", price: "19,812.50", change: "+1.14%", up: true },
  { symbol: "SPY", price: "547.32", change: "+0.76%", up: true },
  { symbol: "VIX", price: "14.28", change: "-3.12%", up: false },
  { symbol: "BTC", price: "67,842", change: "+2.41%", up: true },
  { symbol: "10Y", price: "4.287", change: "-0.58%", up: false },
];

const signals = [
  { time: "09:34 ET", level: "INFO", text: "ES breaking above 5,480 resistance — watching for retest and hold", color: brand.info },
  { time: "08:15 ET", level: "WARN", text: "VIX compression to 14-handle — complacency zone, hedges cheap here", color: brand.warning },
  { time: "07:02 ET", level: "HOT", text: "BTC reclaiming 67K with volume — momentum flip confirmed on 4H", color: brand.amber },
];

export default function Markets() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>The Pit</h1>
        <p style={styles.subtitle}>Futures, macro, conviction trades. Where the edge lives.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {tickers.map((t, i) => (
            <div key={i} style={{ ...styles.card, textAlign: 'center' }}>
              <div style={{ color: brand.smoke, fontSize: '12px', marginBottom: '4px' }}>{t.symbol}</div>
              <div style={{ color: brand.white, fontSize: '18px', fontWeight: 700 }}>{t.price}</div>
              <div style={{ color: t.up ? brand.success : brand.error, fontSize: '12px' }}>{t.change}</div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, marginBottom: '2rem' }}>
          <h3 style={{ color: brand.amber, marginBottom: '1rem', fontSize: '16px' }}>Live Signals</h3>
          {signals.map((s, i) => (
            <div key={i} style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ color: brand.smoke, fontSize: '13px', whiteSpace: 'nowrap' }}>{s.time}</span>
              <span style={{ color: s.color, fontSize: '12px', fontWeight: 600, minWidth: '40px' }}>{s.level}</span>
              <span style={{ color: brand.silver, fontSize: '14px' }}>{s.text}</span>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h3 style={{ color: brand.amber, marginBottom: '1rem', fontSize: '16px' }}>Powered by Bobby AI</h3>
          <p style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.5' }}>
            Trading advisor AI processing market data 24/7. Risk management, signal generation,
            and macro analysis powered by 15 years of trading experience.
          </p>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/os" style={styles.backLink}>Back to Mission Control</a>
        </div>
      </div>
    </div>
  );
}
