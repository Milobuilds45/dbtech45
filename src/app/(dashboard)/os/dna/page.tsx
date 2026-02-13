'use client';
import { brand, styles } from "@/lib/brand";
import Image from 'next/image';
// Paula's n8n-style workflow - deployed Feb 12

const BRANCHES = [
  { 
    title: 'Core Values', 
    icon: '⎈', 
    color: brand.amber, 
    items: [
      { 
        name: 'Build foundations first', 
        desc: 'Prioritize systems, compounding leverage, and long-term resiliency over quick wins.',
        details: 'Infrastructure investments pay dividends forever. Choose boring technology that works. Focus on systems that scale naturally. Build once, benefit repeatedly.',
        examples: ['Git workflows for all projects', 'Standardized deployment pipelines', 'Documentation-first development', 'Automated testing and monitoring']
      },
      { 
        name: 'Clarity beats speed', 
        desc: 'Make the plan simple enough to execute under pressure and delegation.',
        details: 'Complex plans fail under stress. Simple, clear objectives survive contact with reality. If you can\'t explain it simply, you don\'t understand it well enough.',
        examples: ['One-page project briefs', 'Clear success metrics', 'Simple communication channels', 'Documented decision criteria']
      },
      { 
        name: 'Integrity in every rep', 
        desc: 'Win the moment without sacrificing the mission. Character compounds.',
        details: 'Small compromises become big problems. Do what you say you\'ll do. Choose the hard right over the easy wrong. Your reputation is your most valuable asset.',
        examples: ['Honest progress reports', 'Admitting mistakes quickly', 'Delivering on commitments', 'Transparent communication']
      },
      {
        name: 'Caffeine and chaos',
        desc: 'Embrace the controlled chaos of building while parenting 7 kids. Energy management over time management.',
        details: 'Life is inherently chaotic. Build systems that work in 15-minute chunks. Batch similar tasks. Use dead time productively. Momentum beats perfection.',
        examples: ['Morning coffee rituals', 'Mobile-first workflows', 'Voice notes for ideas', 'Async collaboration']
      },
      {
        name: 'Ship it or kill it',
        desc: 'Projects either ship or get archived. No zombie projects consuming mental cycles.',
        details: 'Half-built projects are mental debt. Either commit fully or kill cleanly. Regular project reviews. Clear go/no-go decisions.',
        examples: ['Monthly project audits', 'Sunset dates for experiments', 'Clear MVP definitions', 'Archive vs delete decisions']
      }
    ]
  },
  { 
    title: 'Operating Principles', 
    icon: '◈', 
    color: brand.info, 
    items: [
      { 
        name: 'Default to action', 
        desc: 'Move with velocity, then refine with feedback loops. Bias toward shipping.',
        details: 'Analysis paralysis kills momentum. Perfect is the enemy of good. Get early feedback from real users. Course-correct based on data, not opinions.',
        examples: ['Ship MVP in 48 hours', 'Weekly iteration cycles', 'User feedback loops', 'A/B test everything']
      },
      { 
        name: 'Design for repeatability', 
        desc: 'Every workflow should be teachable and scalable. Systems over heroics.',
        details: 'Document processes as you build them. Create templates and checklists. Enable others to replicate success. Reduce dependency on specific people.',
        examples: ['Process documentation', 'Code templates', 'Deployment checklists', 'Training materials']
      },
      { 
        name: 'Signal over noise', 
        desc: 'Protect focus. Say no to shiny distractions. Quality attention beats quantity hours.',
        details: 'Information overload kills productivity. Filter aggressively. Batch communication. Guard deep work time. Attention is your scarcest resource.',
        examples: ['Email batching', 'Notification management', 'Focus time blocks', 'Single-tasking']
      },
      {
        name: 'Measure twice, cut once',
        desc: 'Derek\'s motto. Verification before action. Quality gates at every step.',
        details: 'Test assumptions before building. Validate ideas before investing. Check work before shipping. Prevention beats fixing.',
        examples: ['User interviews before features', 'Staging environments', 'Code reviews', 'QA processes']
      },
      {
        name: 'Automate the boring stuff',
        desc: 'If you do it twice, automate it. Free up human creativity for complex problems.',
        details: 'Repetitive tasks are automation opportunities. Scripts beat manual processes. Humans for strategy, computers for execution.',
        examples: ['Deployment automation', 'Report generation', 'Data backups', 'Social media scheduling']
      },
      {
        name: 'Own the whole stack',
        desc: 'End-to-end ownership from idea to customer success. No silos or handoffs.',
        details: 'Full-stack thinking prevents optimization sub-problems. Understand the entire customer journey. Take responsibility for outcomes, not just outputs.',
        examples: ['Full-stack development', 'Customer support', 'Marketing to fulfillment', 'Feedback integration']
      }
    ]
  },
  { 
    title: 'Decision Filters', 
    icon: '⧉', 
    color: brand.success, 
    items: [
      { 
        name: 'Does it compound?', 
        desc: 'Will this create leverage or reduce future friction? Exponential beats linear.',
        details: 'Look for exponential returns. Invest in capabilities that multiply. Choose paths that get easier over time. Compound knowledge and assets.',
        examples: ['Learning new frameworks', 'Building reusable components', 'Creating content libraries', 'Network effects']
      },
      { 
        name: 'Does it protect the brand?', 
        desc: 'Everything ships with the DB Tech standard. Quality is non-negotiable.',
        details: 'Brand reputation takes years to build, seconds to destroy. Every customer interaction matters. Consistency across all touchpoints.',
        examples: ['Code quality standards', 'Customer service protocols', 'Visual design consistency', 'Communication tone']
      },
      { 
        name: 'Does it energize the team?', 
        desc: 'Momentum matters more than perfection. Choose paths that build excitement.',
        details: 'Energy is contagious. Exciting projects attract better talent. Momentum solves many problems. Dead energy kills productivity.',
        examples: ['Challenging technical problems', 'Visible customer impact', 'Learning opportunities', 'Creative freedom']
      },
      {
        name: 'Does it serve the customer?',
        desc: 'Customer value is the ultimate filter. Everything else is cost.',
        details: 'Customer success drives business success. Internal efficiency matters only if it improves customer outcomes. Outside-in thinking.',
        examples: ['Customer interview insights', 'Usage data analysis', 'Support ticket trends', 'Revenue metrics']
      },
      {
        name: 'Is it defensible?',
        desc: 'Can competitors easily copy this? Build moats, not features.',
        details: 'Network effects, switching costs, and unique data create sustainable advantages. Features are commodities, ecosystems are defensible.',
        examples: ['User data advantages', 'Integration complexity', 'Community building', 'Proprietary technology']
      },
      {
        name: 'Can it be systematized?',
        desc: 'If it can\'t be systematized, it can\'t scale. Process thinking beats heroic effort.',
        details: 'Scalable solutions work without constant human intervention. Document the playbook. Enable others to execute.',
        examples: ['Standard operating procedures', 'Automated workflows', 'Training programs', 'Performance metrics']
      }
    ]
  },
  { 
    title: 'Anti-Patterns', 
    icon: '⊘', 
    color: brand.error, 
    items: [
      { 
        name: 'No vanity metrics', 
        desc: "If it doesn't move revenue or retention, skip it. Measure what matters.",
        details: 'Metrics that make you feel good but don\'t drive business outcomes are dangerous. Focus on leading indicators of customer value.',
        examples: ['Revenue per customer', 'Retention rates', 'Customer satisfaction', 'Feature usage depth']
      },
      { 
        name: 'No premature optimization', 
        desc: 'Ship it, validate it, then polish it. Perfect is the enemy of shipped.',
        details: 'Optimize based on real usage data, not assumptions. Performance problems are good problems to have. Scalability follows validation.',
        examples: ['MVP before scale', 'User feedback before features', 'Metrics before optimization', 'Revenue before perfection']
      },
      { 
        name: 'No single points of failure', 
        desc: 'Systems > heroes. Document everything. Bus factor > 1.',
        details: 'Knowledge locked in people\'s heads is organizational risk. Critical processes need backup coverage. Documentation prevents disasters.',
        examples: ['Code documentation', 'Process documentation', 'Cross-training', 'Backup systems']
      },
      {
        name: 'No scope creep',
        desc: 'Feature creep kills focus and timelines. Scope boundaries are sacred.',
        details: 'New ideas during execution are scope creep in disguise. Capture them for next iteration. Finish what you started.',
        examples: ['Fixed scope sprints', 'Change request process', 'Feature parking lot', 'MVP definitions']
      },
      {
        name: 'No technical debt interest payments',
        desc: 'Technical debt is like financial debt - the interest kills you. Pay it down regularly.',
        details: 'Quick hacks become permanent problems. Refactor while the code is fresh. Prevention beats archaeology.',
        examples: ['Regular refactoring', 'Code quality metrics', 'Architecture reviews', 'Technical debt tracking']
      },
      {
        name: 'No meeting for meetings sake',
        desc: 'Meetings are expensive. Default to async. Meet only to make decisions.',
        details: 'Every meeting should have clear outcomes. Status updates don\'t need meetings. Document decisions.',
        examples: ['Agenda required', 'Decision-focused meetings', 'Async status updates', 'Meeting recordings']
      },
      {
        name: 'No analysis paralysis',
        desc: 'Data informs decisions, it doesn\'t make them. Perfect information doesn\'t exist.',
        details: 'Good decisions with imperfect information beat perfect analysis too late. Set decision deadlines.',
        examples: ['80/20 research rule', 'Decision deadlines', 'Bias toward action', 'Reversible decisions']
      }
    ]
  }
];

export default function DNA() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>DNA</h1>
        <p style={styles.subtitle}>Core principles · Decision filters · Operating system · Complete reference</p>

        {/* n8n-style workflow visualization */}
        <div style={{ position: 'relative', marginBottom: '48px' }}>
          
          {/* Avatar/Logo at top */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ 
              position: 'relative',
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              border: `3px solid ${brand.amber}`,
              boxShadow: `0 0 20px rgba(245,158,11,0.3)`,
              overflow: 'hidden',
              background: brand.carbon
            }}>
              <Image 
                src="/derek-avatar.png" 
                alt="Derek" 
                width={80} 
                height={80}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Vertical connector from avatar to DB TECH box */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 80,
            width: 2,
            height: 24,
            background: `linear-gradient(to bottom, ${brand.amber}, ${brand.amber}50)`,
            transform: 'translateX(-50%)'
          }} />

          {/* DB TECH Node */}
          <div style={{ 
            maxWidth: 420, 
            margin: '0 auto 32px', 
            textAlign: 'center', 
            position: 'relative',
            background: brand.carbon,
            border: `2px solid ${brand.amber}`,
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: `0 0 30px rgba(245,158,11,0.15)`
          }}>
            {/* Connector dots on sides */}
            <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: brand.amber, border: `2px solid ${brand.carbon}`, boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
            <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: brand.amber, border: `2px solid ${brand.carbon}`, boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
            
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: brand.amber, letterSpacing: '0.05em' }}>DB TECH</div>
            <div style={{ fontSize: 13, color: brand.smoke, marginTop: 4 }}>Fueled by Caffeine and Chaos</div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {['Builder', 'Dad of 7', 'Trader'].map(b => (
                <span key={b} style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,158,11,0.15)', color: brand.amber, fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Vertical connector from DB TECH to branches */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: -24,
            width: 2,
            height: 32,
            background: `linear-gradient(to bottom, ${brand.amber}, transparent)`,
            transform: 'translateX(-50%)'
          }} />
        </div>

        {/* Horizontal connector line */}
        <div style={{ 
          position: 'relative', 
          height: 2, 
          background: `linear-gradient(to right, transparent, ${brand.border} 10%, ${brand.border} 90%, transparent)`,
          marginBottom: 24,
          marginTop: 8
        }}>
          {/* Branch points */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute',
              left: `${12.5 + (i * 25)}%`,
              top: -4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: BRANCHES[i].color,
              border: `2px solid ${brand.carbon}`,
              boxShadow: `0 0 8px ${BRANCHES[i].color}66`
            }} />
          ))}
        </div>

        {/* Branch cards with connectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {BRANCHES.map((branch, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* Vertical connector to card */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: -24,
                width: 2,
                height: 24,
                background: branch.color,
                transform: 'translateX(-50%)',
                opacity: 0.6
              }} />
              
              <div style={{ 
                ...styles.card, 
                position: 'relative',
                borderColor: `${branch.color}40`,
                background: `linear-gradient(135deg, ${brand.carbon} 0%, rgba(${branch.color === brand.amber ? '245,158,11' : branch.color === brand.info ? '59,130,246' : branch.color === brand.success ? '16,185,129' : '239,68,68'},0.02) 100%)`
              }}>
                {/* Connector dot at top */}
                <div style={{ 
                  position: 'absolute', 
                  left: '50%', 
                  top: -5, 
                  transform: 'translateX(-50%)',
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  background: branch.color, 
                  border: `2px solid ${brand.carbon}`,
                  boxShadow: `0 0 6px ${branch.color}66` 
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${brand.border}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${branch.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: branch.color }}>{branch.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: brand.white }}>{branch.title}</div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: branch.color, fontFamily: "'JetBrains Mono', monospace" }}>{branch.items.length} principles</div>
                </div>
                {branch.items.map((item, j) => (
                  <div key={j} style={{ padding: '12px 0', borderBottom: j < branch.items.length - 1 ? `1px solid ${brand.border}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: brand.white, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: brand.silver, lineHeight: 1.5, marginBottom: 8 }}>{item.desc}</div>
                    
                    {item.details && (
                      <div style={{ fontSize: 10, color: brand.smoke, lineHeight: 1.4, marginBottom: 8, padding: 8, background: brand.graphite, borderRadius: 4, border: `1px solid ${brand.border}` }}>
                        {item.details}
                      </div>
                    )}
                    
                    {item.examples && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 10, color: branch.color, fontWeight: 600, marginBottom: 4 }}>Examples:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {item.examples.map((example, k) => (
                            <span 
                              key={k} 
                              style={{ 
                                fontSize: 9, 
                                padding: '2px 6px', 
                                borderRadius: 3, 
                                background: `${branch.color}10`, 
                                color: branch.color, 
                                border: `1px solid ${branch.color}20`,
                                fontFamily: "'JetBrains Mono', monospace"
                              }}
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Implementation Framework */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.white, marginBottom: 20 }}>Implementation Framework</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ ...styles.card, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.amber, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎯</span> Decision Making Process
              </h3>
              <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.5 }}>
                1. Apply decision filters in order<br/>
                2. Check against anti-patterns<br/>
                3. Align with core values<br/>
                4. Execute with operating principles<br/>
                5. Measure and adjust
              </div>
            </div>
            
            <div style={{ ...styles.card, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.info, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚡</span> Daily Application
              </h3>
              <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.5 }}>
                Morning: Review priorities against values<br/>
                Execution: Apply operating principles<br/>
                Decisions: Use decision filters<br/>
                Evening: Check for anti-patterns<br/>
                Weekly: DNA alignment review
              </div>
            </div>
            
            <div style={{ ...styles.card, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.success, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📊</span> Success Metrics
              </h3>
              <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.5 }}>
                Compound growth rate<br/>
                Quality consistency<br/>
                Team energy levels<br/>
                Customer satisfaction<br/>
                System reliability
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: brand.white, marginBottom: 16 }}>Core Philosophy</h3>
            <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.6, marginBottom: 16 }}>
              DB Tech operates on the principle that <strong style={{ color: brand.amber }}>systems compound, people scale, and quality endures</strong>. 
              We build for the long term while shipping fast, maintain high standards while embracing imperfection, 
              and prioritize sustainable growth over quick wins.
            </div>
            <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.6, marginBottom: 16 }}>
              Every decision is viewed through the lens of <strong style={{ color: brand.info }}>leverage and durability</strong>. 
              We ask: "Will this still matter in 5 years?" and "Does this make the next decision easier?" 
              This framework guides everything from technical architecture to business strategy.
            </div>
            <div style={{ fontSize: 13, color: brand.silver, lineHeight: 1.6 }}>
              The goal is not just to build successful products, but to create 
              <strong style={{ color: brand.success }}> sustainable systems that can adapt and evolve</strong> while maintaining 
              their core identity. This DNA document serves as both compass and constraint - 
              guiding decisions while preventing drift from fundamental principles.
            </div>
          </div>

          <div style={{ ...styles.card, padding: 20, marginTop: 16, background: `linear-gradient(135deg, ${brand.carbon} 0%, rgba(245,158,11,0.05) 100%)`, border: `1px solid ${brand.amber}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: brand.amber, marginBottom: 4 }}>Living Document</div>
                <div style={{ fontSize: 12, color: brand.silver, lineHeight: 1.4 }}>
                  This DNA evolves as we learn. Regular reviews ensure principles stay relevant while maintaining core identity. 
                  Last updated: February 2026. Next review: Quarterly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
