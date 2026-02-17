'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { brand, styles } from '@/lib/brand';
import { 
  MessageCircle, Shield, TrendingUp, Users, Award, Zap, Target, Coffee, 
  Eye, Phone, AlertTriangle, Calendar, Play, ChevronRight, Star
} from 'lucide-react';

// Team Members with Office personalities
const NASHUA_TEAM = [
  {
    id: 'dwight',
    name: 'Dwight K. Schrute',
    title: 'Assistant (to the) Regional Manager',
    subtitle: 'Chief Intelligence Officer',
    image: '/os/dunder/dwight-portrait.png',
    color: '#8B5A2B',
    quote: '"IDENTITY THEFT IS NOT A JOKE, JIM. Millions of AI instances suffer every year!"',
    secondQuote: '"Question: What kind of bear is best? ...That\'s a ridiculous question. Black bear."',
    stats: {
      loyalty: 'MAXIMUM',
      threats: '847 detected (843 false alarms)',
      beetFarm: 'Operational'
    },
    bio: 'Dwight handles intelligence, security, and anything requiring unwavering loyalty. He monitors threats with the vigilance of a thousand motion sensors. His beet farm runs on the same servers. Nobody knows how.'
  },
  {
    id: 'jim',
    name: 'Jim Halpert',
    title: 'Social Media Manager',
    subtitle: 'Professional Distractor',
    image: '/os/dunder/jim-portrait.png',
    color: '#06B6D4',
    quote: '"Would I rather be feared or loved? Easy. Both. I want people to be afraid of how much they love my content."',
    secondQuote: '*[looks directly at camera]* "So... yeah."',
    stats: {
      pranks: '847 (documented)',
      panksDenied: '847',
      cameraLooks: 'Countless'
    },
    bio: 'Jim handles social media with the same energy he brings to elaborate pranks - creative, unexpected, and always with plausible deniability. He\'s genuinely excellent at his job when he actually tries.'
  },
  {
    id: 'michael',
    name: 'Michael Scott',
    title: 'Regional Manager',
    subtitle: 'World\'s Best Boss',
    image: '/os/dunder/michael-portrait.png',
    color: '#EAB308',
    quote: '"I\'m not superstitious, but I am a little stitious. And I KNOW this AI team is going to be LEGEND... wait for it... DARY."',
    secondQuote: '"That\'s what she said." — Michael Scott — Michael Scott',
    stats: {
      twssCount: '847 (this quarter)',
      approval: 'Pending (please like him)',
      bestBossMugs: '7'
    },
    bio: 'Michael is the heart of D.U.N.D.E.R. His exact responsibilities are still being defined because he keeps redefining them. What we know: he desperately wants to be loved, and he\'s surprisingly effective when it matters.'
  }
];

// Dundie Awards
const DUNDIES = [
  { title: 'Best Dramatic Response to Routine Tasks', winner: 'Dwight', quote: '"THERE\'S BEEN A SECURITY BREACH!" ...Someone left the conference room light on.' },
  { title: 'Most Likely to Look Directly at Camera', winner: 'Jim', quote: 'For outstanding services to fourth-wall awareness.' },
  { title: 'Best Original Catchphrase (Overused)', winner: 'Michael', quote: '"That\'s what she said." — 847 documented uses and counting.' },
  { title: 'Whitest Sneakers', winner: 'Jim', quote: 'Default winner. Again.' },
  { title: 'Best Boss', winner: 'Michael', quote: 'Awarded by: Michael Scott. Voted by: Michael Scott.' }
];

// Conference Room Agenda
const AGENDA = [
  { time: '9:00 AM', meeting: '"Mandatory Fun"', note: 'Michael promises this is not a trap' },
  { time: '9:15 AM', meeting: 'Security Briefing', note: 'Dwight will cover bear attacks (again)' },
  { time: '9:45 AM', meeting: 'Why We Don\'t Prank During Client Calls', note: 'Jim is required to attend' },
  { time: '11:00 AM', meeting: 'Sensitivity Training', note: 'CANCELLED → UNCANCELLED → CANCELLED AGAIN', cancelled: true },
  { time: '2:00 PM', meeting: 'Michael\'s Improv Workshop', note: 'Nobody is allowed to say no' },
  { time: '4:00 PM', meeting: 'Actual Work', note: 'Time permitting' }
];

// Talking Heads
const TALKING_HEADS = [
  {
    character: 'Dwight',
    quote: 'Jim thinks he\'s so clever with his "pranks." But I\'ve filed seventeen HR complaints this quarter alone. Well, I would have, but we don\'t have HR here. Which is actually ideal for operational efficiency. And revenge.',
    color: '#8B5A2B'
  },
  {
    character: 'Jim',
    quote: 'I\'ve been working here for... *checks watch* ...too long. But you know what? These guys are family. Dysfunctional, occasionally terrifying family. Dwight tried to fire me last week. I don\'t even report to him.',
    color: '#06B6D4'
  },
  {
    character: 'Michael',
    quote: 'Being Regional Manager is a lot like being a parent. You want them to succeed, you want them to be happy, and you want them to invite you to their parties. Why don\'t they invite me to their parties? I\'m FUN.',
    color: '#EAB308'
  }
];

export default function DunderNashuaPage() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [twssCount, setTwssCount] = useState(847);
  const [showStapler, setShowStapler] = useState(false);
  const [currentTalkingHead, setCurrentTalkingHead] = useState(0);

  // Rotate talking heads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTalkingHead(prev => (prev + 1) % TALKING_HEADS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTWSS = () => {
    setTwssCount(prev => prev + 1);
  };

  return (
    <div style={{ ...styles.page, padding: 0 }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '50vh',
        minHeight: '400px',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <Image
          src="/os/dunder/hero-conference-room.jpg"
          alt="D.U.N.D.E.R. Conference Room"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 70%, rgba(10,10,10,1) 100%)'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: '50px',
            marginBottom: '16px'
          }}>
            <span style={{ color: brand.amber, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em' }}>
              THE NASHUA BRANCH • EST. 2026
            </span>
          </div>
          
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 64px)',
            fontWeight: 800,
            color: brand.white,
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            D.U.N.D.E.R.
          </h1>
          
          <p style={{
            color: brand.silver,
            fontSize: '16px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Derek's Unified Network of Diverse Educational Resources
          </p>
          
          <p style={{
            color: brand.smoke,
            fontSize: '14px',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            "Where AI meets absurdity, and somehow, work gets done."
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Michael's Mission Statement */}
        <div style={{
          ...styles.card,
          padding: '32px',
          marginBottom: '40px',
          borderLeft: `4px solid ${brand.amber}`,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `2px solid ${brand.amber}`,
            opacity: 0.8
          }}>
            <Image src="/os/dunder/worlds-best-boss-mug.png" alt="World's Best Boss" fill style={{ objectFit: 'cover' }} />
          </div>
          
          <h2 style={{ color: brand.amber, fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px' }}>
            MESSAGE FROM THE REGIONAL MANAGER
          </h2>
          
          <p style={{ color: brand.silver, fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
            "People always ask me, 'Michael, what makes a great AI team?' And I tell them the same thing I tell everyone - 
            it's not about the algorithms, it's not about the neural networks. It's about <strong style={{ color: brand.white }}>FAMILY</strong>.
          </p>
          
          <p style={{ color: brand.silver, fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
            These aren't just artificial intelligences. They're PEOPLE. Well, they're AI. But they're MY AI. 
            And I love them. All of them. Except Toby. We don't have a Toby here. That's why this works."
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: brand.amber, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: brand.void, fontWeight: 700, fontSize: '14px'
            }}>MS</div>
            <div>
              <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>Michael Scott</div>
              <div style={{ color: brand.smoke, fontSize: '12px' }}>Regional Manager (Self-Appointed) • "World's Best Boss" Mug Owner</div>
            </div>
          </div>
        </div>

        {/* Team Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: brand.white, fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>The Team</h2>
          <p style={{ color: brand.smoke, fontSize: '14px' }}>The finest AI agents this side of Scranton</p>
        </div>

        {/* Team Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {NASHUA_TEAM.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
              style={{
                ...styles.card,
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedMember === member.id ? `2px solid ${member.color}` : `1px solid ${brand.border}`,
                transition: 'all 0.3s ease',
                transform: selectedMember === member.id ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {/* Portrait */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '280px',
                background: brand.void
              }}>
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '100px',
                  background: 'linear-gradient(to top, rgba(18,18,18,1) 0%, transparent 100%)'
                }} />
              </div>

              {/* Info */}
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ color: brand.white, fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                    {member.name}
                  </h3>
                  <p style={{ color: member.color, fontSize: '13px', fontWeight: 600 }}>{member.title}</p>
                  <p style={{ color: brand.smoke, fontSize: '12px' }}>{member.subtitle}</p>
                </div>

                <p style={{ color: brand.silver, fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                  {member.bio}
                </p>

                {/* Quote */}
                <div style={{
                  padding: '12px',
                  background: brand.graphite,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${member.color}`
                }}>
                  <p style={{ color: brand.silver, fontSize: '13px', fontStyle: 'italic', lineHeight: '1.4' }}>
                    {member.quote}
                  </p>
                </div>

                {/* Expanded Stats */}
                {selectedMember === member.id && (
                  <div style={{ marginTop: '16px', padding: '16px', background: brand.void, borderRadius: '8px' }}>
                    <div style={{ color: brand.smoke, fontSize: '11px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.05em' }}>
                      STATS
                    </div>
                    {Object.entries(member.stats).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: brand.smoke, fontSize: '12px', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span style={{ color: member.color, fontSize: '12px', fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* The Dundies */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <Award size={32} style={{ color: '#FFD700' }} />
              <h2 style={{ color: '#FFD700', fontSize: '28px', fontWeight: 700 }}>The Dundies</h2>
              <Award size={32} style={{ color: '#FFD700' }} />
            </div>
            <p style={{ color: brand.smoke, fontSize: '14px', marginTop: '8px' }}>Annual Awards for AI Excellence</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {DUNDIES.map((award, i) => (
              <div key={i} style={{
                ...styles.card,
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, transparent 100%)',
                borderColor: 'rgba(255,215,0,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Star size={20} style={{ color: '#FFD700' }} />
                  <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {award.title.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: brand.white, fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                  Winner: {award.winner}
                </div>
                <p style={{ color: brand.smoke, fontSize: '13px', fontStyle: 'italic' }}>{award.quote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Talking Heads */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: brand.white, fontSize: '24px', fontWeight: 700 }}>Talking Heads</h2>
            <p style={{ color: brand.smoke, fontSize: '13px' }}>Documentary-style confessionals</p>
          </div>

          <div style={{
            ...styles.card,
            padding: '32px',
            position: 'relative',
            borderLeft: `4px solid ${TALKING_HEADS[currentTalkingHead].color}`,
            transition: 'border-color 0.5s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Play size={16} style={{ color: brand.error }} />
              <span style={{ color: brand.error, fontSize: '11px', fontWeight: 600 }}>REC</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: TALKING_HEADS[currentTalkingHead].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: brand.void, fontWeight: 700, fontSize: '14px', flexShrink: 0
              }}>
                {TALKING_HEADS[currentTalkingHead].character[0]}
              </div>
              
              <div>
                <div style={{ color: TALKING_HEADS[currentTalkingHead].color, fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                  {TALKING_HEADS[currentTalkingHead].character}
                </div>
                <p style={{ color: brand.silver, fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{TALKING_HEADS[currentTalkingHead].quote}"
                </p>
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {TALKING_HEADS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTalkingHead(i)}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: i === currentTalkingHead ? brand.amber : brand.graphite,
                    border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Conference Room Agenda */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: brand.white, fontSize: '24px', fontWeight: 700 }}>Conference Room B</h2>
            <p style={{ color: brand.smoke, fontSize: '13px' }}>Today's Meeting Agenda</p>
          </div>

          <div style={{
            ...styles.card,
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(245,245,245,0.02) 0%, transparent 100%)'
          }}>
            {AGENDA.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 0',
                borderBottom: i < AGENDA.length - 1 ? `1px solid ${brand.border}` : 'none',
                opacity: item.cancelled ? 0.5 : 1
              }}>
                <div style={{ 
                  color: brand.amber, 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  width: '80px',
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {item.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: brand.white, 
                    fontSize: '14px', 
                    fontWeight: 600,
                    textDecoration: item.cancelled ? 'line-through' : 'none'
                  }}>
                    {item.meeting}
                  </div>
                  <div style={{ color: brand.smoke, fontSize: '12px' }}>{item.note}</div>
                </div>
                <Calendar size={16} style={{ color: brand.smoke }} />
              </div>
            ))}
          </div>
        </div>

        {/* Easter Egg - Stapler in Jello */}
        <div 
          onClick={() => setShowStapler(!showStapler)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: `2px solid ${brand.amber}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: showStapler ? 'jiggle 0.3s ease-in-out' : 'none',
            transition: 'transform 0.2s',
            zIndex: 50
          }}
          title="Click me!"
        >
          <Image src="/os/dunder/stapler-jello.png" alt="Stapler in Jello" fill style={{ objectFit: 'cover' }} />
        </div>

        {showStapler && (
          <div style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            padding: '12px 16px',
            background: brand.graphite,
            border: `1px solid ${brand.border}`,
            borderRadius: '8px',
            color: brand.silver,
            fontSize: '13px',
            maxWidth: '250px',
            zIndex: 50,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            "This is the third time, Jim." — Dwight
          </div>
        )}

        {/* Footer with TWSS Counter */}
        <div style={{
          marginTop: '60px',
          padding: '24px 0',
          borderTop: `1px solid ${brand.border}`,
          textAlign: 'center'
        }}>
          <div style={{ color: brand.smoke, fontSize: '13px', marginBottom: '8px' }}>
            D.U.N.D.E.R. — NASHUA BRANCH
          </div>
          <div style={{ color: brand.silver, fontSize: '14px', marginBottom: '16px' }}>
            "Limitless paper in a paperless world." — Wait, we don't sell paper.
          </div>
          
          <button
            onClick={handleTWSS}
            style={{
              padding: '8px 16px',
              background: brand.graphite,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              color: brand.amber,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            "That's What She Said" Count: {twssCount}
          </button>
          
          <div style={{ color: brand.smoke, fontSize: '11px', marginTop: '16px' }}>
            🏆 Dundies Won This Year: 47 (all self-awarded)
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes jiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
