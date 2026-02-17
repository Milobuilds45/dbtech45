"use client";
import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";

export default function ThePit() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      sectionRef.current.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }
    return () => observer.disconnect();
  }, []);

  const tickerData = [
    { symbol: "ES", price: "5,487.25", change: "+0.82%", up: true },
    { symbol: "NQ", price: "19,812.50", change: "+1.14%", up: true },
    { symbol: "SPY", price: "547.32", change: "+0.76%", up: true },
    { symbol: "VIX", price: "14.28", change: "-3.12%", up: false },
    { symbol: "/GC", price: "2,341.80", change: "+0.34%", up: true },
    { symbol: "BTC", price: "67,842", change: "+2.41%", up: true },
    { symbol: "10Y", price: "4.287", change: "-0.58%", up: false },
    { symbol: "DXY", price: "104.32", change: "-0.21%", up: false },
  ];

  const signals = [
    { time: "09:34 ET", type: "info", text: "ES breaking above 5,480 resistance — watching for retest and hold" },
    { time: "08:15 ET", type: "warn", text: "VIX compression to 14-handle — complacency zone, hedges cheap here" },
    { time: "07:02 ET", type: "hot", text: "BTC reclaiming 67K with volume — momentum flip confirmed on 4H" },
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="pit" aria-label="Trading section" ref={sectionRef}>
        <div className="container">
          <div className="reveal" style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="section-command-clean" style={{ justifyContent: "center" }}>&gt; market --status</p>
            <h2 className="section-title">The Pit</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Futures, macro, conviction trades. Where the edge lives.
            </p>
          </div>

          {/* Ticker Strip */}
          <div className="pit-ticker-wrapper reveal">
            <div className="ticker-strip" aria-label="Market ticker">
              <div className="ticker-track">
                {[...tickerData, ...tickerData].map((item, index) => (
                  <div key={index} className="ticker-item">
                    <span className="ticker-symbol">{item.symbol}</span>
                    <span className="ticker-price">{item.price}</span>
                    <span className={`ticker-change ${item.up ? "up" : "down"}`}>
                      {item.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="pit-grid reveal">
            {/* Signals Panel */}
            <div className="pit-signals">
              <div className="pit-panel-header">
                <Activity size={16} />
                <span>Live Signals</span>
              </div>
              <div className="pit-signals-list">
                {signals.map((signal, i) => (
                  <div key={i} className={`pit-signal pit-signal-${signal.type}`}>
                    <span className="pit-signal-time">{signal.time}</span>
                    <span className={`pit-signal-badge ${signal.type}`}>
                      {signal.type === "hot" ? "HOT" : signal.type === "warn" ? "WARN" : "INFO"}
                    </span>
                    <p className="pit-signal-text">{signal.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Panel */}
            <div className="pit-stats">
              <div className="pit-stat-card">
                <div className="pit-stat-label">Market Sentiment</div>
                <div className="pit-stat-value up">
                  <TrendingUp size={20} />
                  Bullish
                </div>
                <div className="pit-stat-sub">Fear & Greed: 72</div>
              </div>
              <div className="pit-stat-card">
                <div className="pit-stat-label">VIX</div>
                <div className="pit-stat-value">14.28</div>
                <div className="pit-stat-sub down">Low volatility regime</div>
              </div>
              <div className="pit-stat-card">
                <div className="pit-stat-label">10Y Yield</div>
                <div className="pit-stat-value">4.287%</div>
                <div className="pit-stat-sub">Watching 4.30 level</div>
              </div>
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="pit-cta reveal">
            <div className="pit-cta-content">
              <div className="pit-cta-icon">
                <AlertCircle size={24} />
              </div>
              <div className="pit-cta-text">
                <h4>Signal & Noise</h4>
                <p>Daily market intelligence. Filtered. Actionable. No fluff.</p>
              </div>
            </div>
            <a href="/newsletter/signal-noise" className="btn btn-primary">
              Get Early Access →
            </a>
          </div>

          {/* Powered By */}
          <div className="pit-powered reveal">
            Powered by Bobby // Trading Advisor AI
          </div>
        </div>
      </section>
    </>
  );
}
