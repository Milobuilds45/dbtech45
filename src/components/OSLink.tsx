"use client";

export default function OSLink() {
  return (
    <section className="section" id="os">
      <div className="container" style={{textAlign:'center'}}>
        <div className="reveal">
          <div className="section-command" style={{justifyContent:'center'}}>cd ~/dbtech45</div>
          <h2 className="section-title">Personal OS</h2>
          <p className="section-subtitle">Command center for projects, markets, and agents.</p>
        </div>
        <div className="reveal">
          <a href="/os" className="btn btn-primary" style={{fontSize: '18px', padding: '16px 32px'}}>
            → Enter DB Tech OS
          </a>
        </div>
      </div>
    </section>
  );
}