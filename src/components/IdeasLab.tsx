"use client";
import { useEffect, useRef } from "react";

export default function IdeasLab() {
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

  const gitEntries = {
    building: [
      {
        hash: "a3f7c2d",
        message: "tickR — Trading dashboard with AI signals and journaling"
      },
      {
        hash: "b8e1d4f",
        message: "Soul Solace — AI wellness companion and mood tracker"
      },
      {
        hash: "c2a9f6e",
        message: "Kitchen Cost Tracker — Multi-unit food cost management"
      }
    ],
    shaping: [
      {
        hash: "d5b3e8a",
        message: "Boundless — AI travel planning and itinerary builder"
      },
      {
        hash: "e7c4f9b",
        message: "Receipt Scanner — OCR expense extraction and categorization"
      }
    ],
    spark: [
      {
        hash: "f1d6a2c",
        message: "AI Meal Planner — Family-aware weekly meal generation"
      },
      {
        hash: "g3e8b4d",
        message: "Contractor Bidder — Scope management and bid comparison"
      },
      {
        hash: "h5f9c6e",
        message: "Family Calendar AI — Smart scheduling for a family of 9"
      }
    ]
  };

  return (
    <>
      <hr className="section-divider" />
      <section className="section" id="ideas" aria-label="Ideas Lab section" ref={sectionRef}>
        <div className="container">
          <div className="reveal">
            <div className="section-command">git log --oneline --graph</div>
            <h2 className="section-title">Ideas Lab</h2>
            <p className="section-subtitle">The pipeline. From spark to shipped — everything passes through here.</p>
          </div>
          <div className="git-log reveal">
            {/* Building */}
            <div className="git-group">
              <div className="git-stage-label stage-building">Building</div>
              {gitEntries.building.map((entry, index) => (
                <div key={index} className="git-entry">
                  <span className="hash">{entry.hash}</span>
                  <span className="msg">
                    <strong>{entry.message.split(' — ')[0]}</strong>
                    {' — '}
                    {entry.message.split(' — ')[1]}
                  </span>
                </div>
              ))}
            </div>
            {/* Shaping */}
            <div className="git-group">
              <div className="git-stage-label stage-shaping">Shaping</div>
              {gitEntries.shaping.map((entry, index) => (
                <div key={index} className="git-entry">
                  <span className="hash">{entry.hash}</span>
                  <span className="msg">
                    <strong>{entry.message.split(' — ')[0]}</strong>
                    {' — '}
                    {entry.message.split(' — ')[1]}
                  </span>
                </div>
              ))}
            </div>
            {/* Spark */}
            <div className="git-group">
              <div className="git-stage-label stage-spark">Spark</div>
              {gitEntries.spark.map((entry, index) => (
                <div key={index} className="git-entry">
                  <span className="hash">{entry.hash}</span>
                  <span className="msg">
                    <strong>{entry.message.split(' — ')[0]}</strong>
                    {' — '}
                    {entry.message.split(' — ')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}