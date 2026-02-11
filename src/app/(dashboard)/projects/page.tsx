import { brand, styles } from "@/lib/brand";

const projects = [
  { title: "tickR", desc: "Real-time trading dashboard with AI-powered signals, journaling, and performance analytics.", status: "Building", progress: 75, due: "Feb 28", color: brand.amber },
  { title: "Sunday Squares", desc: "Football squares game app — digital pools for game day with auto-scoring and payouts.", status: "Ready", progress: 95, due: "Feb 12", color: brand.success },
  { title: "Soul Solace", desc: "AI-powered mental wellness companion — daily reflections, mood tracking, guided support.", status: "Building", progress: 60, due: "Mar 1", color: brand.amber },
  { title: "Boundless", desc: "Travel planning tool with AI-curated itineraries, budget tracking, and local insights.", status: "Shaping", progress: 40, due: "Feb 17", color: brand.warning },
  { title: "Kitchen Cost Tracker", desc: "Restaurant food cost and inventory management system for multi-unit operators.", status: "Building", progress: 30, due: "Mar 15", color: brand.amber },
  { title: "Signal & Noise", desc: "Daily trading newsletter filtering market noise into actionable intelligence.", status: "Shipped", progress: 100, due: "Live", color: brand.success },
];

export default function Projects() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Projects</h1>
        <p style={styles.subtitle}>Real tools for real problems. Every project starts with friction and ends with a shipped product.</p>

        <div style={styles.grid}>
          {projects.map((p, i) => (
            <div key={i} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: brand.white, margin: 0, fontSize: '16px' }}>{p.title}</h3>
                <span style={{ color: p.color, fontSize: '12px', fontWeight: 500 }}>{p.status}</span>
              </div>
              <p style={{ color: brand.silver, fontSize: '14px', lineHeight: '1.5', marginBottom: '1rem' }}>{p.desc}</p>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: brand.silver }}>Progress</span>
                  <span style={{ color: p.color }}>{p.progress}%</span>
                </div>
                <div style={{ background: brand.graphite, height: '4px', borderRadius: '2px' }}>
                  <div style={{ background: p.color, width: `${p.progress}%`, height: '100%', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: brand.smoke }}>Due: {p.due}</div>
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
