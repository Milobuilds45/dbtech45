"use client";
import { useEffect, useRef } from "react";

export default function ThePit() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const revealElements = sectionRef.current.querySelectorAll('.reveal');
      revealElements.forEach((el) => observer.observe(el));
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
    { symbol: "DXY", price: "104.32", change: "-0.21%", up: false }
  ];

  const signals = [
    {
      time: "09:34 ET",
      level: "info",
      message: "ES breaking above 5,480 resistance — watching for retest and hold"
    },
    {
      time: "08:15 ET",
      level: "warn",
      message: "VIX compression to 14-handle — complacency zone, hedges cheap here"
    },
    {
      time: "07:02 ET",
      level: "hot",
      message: "BTC reclaiming 67K with volume — momentum flip confirmed on 4H"
    }
  ];

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="pit" aria-label="Trading section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">market --status</div>
            <h2 className="section-title">The Pit</h2>
            <p className="section-subtitle">Futures, macro, conviction trades. Where the edge lives.</p>
          </div>
          <div className="pit-panel reveal">
            <div className="ticker-strip" aria-label="Market ticker">
              <div className="ticker-track">
                {/* First set */}
                {tickerData.map((item, index) => (
                  <div key={index} className="ticker-item">
                    <span className="ticker-symbol">{item.symbol}</span>
                    <span className="ticker-price">{item.price}</span>
                    <span className={`ticker-change ${item.up ? 'up' : 'down'}`}>
                      {item.change}
                    </span>
                  </div>
                ))}
                {/* Duplicate for seamless scroll */}
                {tickerData.map((item, index) => (
                  <div key={`dup-${index}`} className="ticker-item">
                    <span className="ticker-symbol">{item.symbol}</span>
                    <span className="ticker-price">{item.price}</span>
                    <span className={`ticker-change ${item.up ? 'up' : 'down'}`}>
                      {item.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pit-content">
              <div className="signal-log">
                {signals.map((signal, index) => (
                  <div key={index} className="signal-entry">
                    <span className="signal-time">{signal.time}</span>
                    <span className={`signal-level ${signal.level}`}>
                      {signal.level.toUpperCase()}
                    </span>
                    <span className="signal-msg">{signal.message}</span>
                  </div>
                ))}
              </div>
              <div className="pit-newsletter">
                <div className="pit-newsletter-text">
                  <h4>📡 Signal & Noise</h4>
                  <p>Daily market intelligence. Filtered. Actionable. No fluff.</p>
                </div>
                <a href="#newsletters" className="btn btn-primary">Subscribe →</a>
              </div>
              <p className="pit-powered">Powered by Bobby // Trading Advisor AI</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}