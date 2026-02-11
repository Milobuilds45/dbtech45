import { brand, styles } from "@/lib/brand";

const groups = [
  { title: "Development", links: [
    { label: "Vercel Dashboard", url: "https://vercel.com/dashboard" },
    { label: "GitHub Repos", url: "https://github.com/7LayerLabs" },
    { label: "Supabase Console", url: "https://supabase.com/dashboard" },
    { label: "Claude Console", url: "https://console.anthropic.com" },
  ]},
  { title: "Trading", links: [
    { label: "ThinkOrSwim", url: "https://thinkorswim.tdameritrade.com" },
    { label: "TradingView", url: "https://tradingview.com" },
    { label: "FinViz Screener", url: "https://finviz.com" },
    { label: "FRED Economic Data", url: "https://fred.stlouisfed.org" },
  ]},
  { title: "AI Tools", links: [
    { label: "Model Counsel", url: "/model-counsel" },
    { label: "Claude.ai", url: "https://claude.ai" },
    { label: "ChatGPT", url: "https://chat.openai.com" },
    { label: "Gemini", url: "https://gemini.google.com" },
  ]},
  { title: "Restaurant", links: [
    { label: "POS System", url: "#" },
    { label: "Inventory Manager", url: "#" },
    { label: "Staff Scheduling", url: "#" },
    { label: "Cost Tracker", url: "#" },
  ]},
];

export default function QuickLinks() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Quick Links</h1>
        <p style={styles.subtitle}>Essential tools and resources for daily operations.</p>

        <div style={styles.grid}>
          {groups.map((g, i) => (
            <div key={i} style={styles.card}>
              <h3 style={{ color: brand.amber, marginBottom: '1rem', fontSize: '14px', fontWeight: 600 }}>{g.title}</h3>
              {g.links.map((link, j) => (
                <div key={j} style={{ marginBottom: '0.75rem' }}>
                  <a href={link.url} target={link.url.startsWith('/') ? undefined : '_blank'}
                    style={{ color: brand.silver, textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}>
                    {link.label}
                  </a>
                </div>
              ))}
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
