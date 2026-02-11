"use client";
import { useEffect, useRef } from "react";

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

  return (
    <>
      <hr className="section-divider" />
      <section className="section section-compact" id="pit" aria-label="Trading section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <p className="section-command-clean">&gt; the-pit</p>
            <h2 className="section-title">The Pit</h2>
            <p className="section-subtitle">Futures, macro, conviction trades.</p>
          </div>
          <div className="pit-panel reveal">
            <div className="ticker-strip" aria-label="Market ticker">
              <div className="ticker-track">
                {[...tickerData, ...tickerData].map((item, index) => (
                  <div key={index} className="ticker-item">
                    <span className="ticker-symbol">{item.symbol}</span>
                    <span className="ticker-price">{item.price}</span>
                    <span className={`ticker-change ${item.up ? "up" : "down"}`}>
                      {item.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pit-content">
              <div className="pit-newsletter">
                <div className="pit-newsletter-text">
                  <h4>Signal & Noise</h4>
                  <p>Daily market intelligence. Filtered. Actionable. No fluff.</p>
                </div>
                <a href="#newsletter" className="btn btn-primary">Subscribe &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
