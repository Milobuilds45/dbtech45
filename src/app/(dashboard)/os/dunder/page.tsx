'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { brand, styles } from '@/lib/brand';
import { MessageCircle, Shield, TrendingUp, Users, Award, Zap, Target, Coffee, FileText } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  personality: string;
  initials: string;
  color: string;
  specialties: string[];
  catchphrase: string;
  image?: string;
}

const NASHUA_TEAM: TeamMember[] = [
  {
    id: 'jim',
    name: 'Jim Halpert',
    role: 'Social Media Specialist',
    personality: 'The laid-back prankster with sharp social instincts',
    initials: 'JH',
    color: '#06B6D4',
    specialties: ['Viral Content', 'Community Building', 'Platform Strategy', 'Crisis Management'],
    catchphrase: '"That\'s... not how social media works, Michael."',
    image: '/os/agents/jim.png'
  },
  {
    id: 'michael',
    name: 'Michael Scott',
    role: 'TBD (World\'s Best Boss)',
    personality: 'Enthusiastic leader with unconventional wisdom',
    initials: 'MS',
    color: '#EAB308',
    specialties: ['Team Motivation', 'Client Relations', 'Creative Solutions', 'Morale Boosting'],
    catchphrase: '"That\'s what she said!" (inevitable)',
    image: '/os/agents/michael.png'
  },
  {
    id: 'dwight',
    name: 'Dwight K. Schrute',
    role: 'Intelligence & Security',
    personality: 'Intensely loyal with survival instincts',
    initials: 'DKS',
    color: '#6366F1',
    specialties: ['Threat Assessment', 'Competitor Analysis', 'Crisis Preparation', 'Data Security'],
    catchphrase: '"FALSE. Bears eat beets."',
    image: '/os/agents/dwight.png'
  }
];

const TEAM_DYNAMICS = [
  {
    title: 'Jim + Dwight',
    dynamic: 'Competitive Collaboration',
    description: 'Playful rivalry drives excellence. Jim finds the humor, Dwight finds the threat.',
    example: 'Jim: "Dwight, what are you doing?" | Dwight: "Securing our digital perimeter, Jim!"'
  },
  {
    title: 'Michael + Jim',
    dynamic: 'Mentor & Guide',
    description: 'Michael seeks validation, Jim provides gentle direction and damage control.',
    example: 'Michael: "Should I tweet this?" | Jim: "Maybe we workshop it first..."'
  },
  {
    title: 'Michael + Dwight',
    dynamic: 'Leader & Loyal Deputy',
    description: 'Unwavering loyalty meets enthusiastic leadership. Classic boss-assistant dynamic.',
    example: 'Michael: "Make it happen!" | Dwight: "By your command!"'
  }
];

const BRANCH_STATS = [
  { label: 'Team Efficiency', value: '127%', trend: '+23%', icon: Target },
  { label: 'Client Satisfaction', value: '94%', trend: '+11%', icon: Award },
  { label: 'Problem Resolution', value: '3.2min', trend: '-45%', icon: Zap },
  { label: 'Coffee Consumed', value: '47 cups/day', trend: '+8%', icon: Coffee }
];

export default function DunderNashuaPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dynamics' | 'performance'>('overview');

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px 16px',
            background: 'rgba(245,158,11,0.1)',
            border: `1px solid ${brand.amber}40`,
            borderRadius: '50px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: brand.success,
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ 
              color: brand.amber, 
              fontSize: '12px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Dunder Mifflin Nashua</span>
          </div>
          
          <h1 style={{
            ...styles.h1,
            fontSize: '36px',
            marginBottom: '8px',
            background: `linear-gradient(135deg, ${brand.amber} 0%, ${brand.amberLight} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            The D.U.N.D.E.R Team
          </h1>
          
          <p style={{
            ...styles.subtitle,
            fontSize: '16px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Where The Office meets AI excellence. Derek's Nashua branch combines authentic personalities 
            with cutting-edge capabilities.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          padding: '4px',
          background: brand.graphite,
          borderRadius: '12px',
          border: `1px solid ${brand.border}`
        }}>
          {[
            { id: 'overview', label: 'Team Overview', icon: Users },
            { id: 'dynamics', label: 'Office Dynamics', icon: MessageCircle },
            { id: 'performance', label: 'Branch Performance', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: activeTab === id ? brand.amber : 'transparent',
                color: activeTab === id ? brand.void : brand.smoke,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Team Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {NASHUA_TEAM.map(member => (
                <div
                  key={member.id}
                  style={{
                    ...styles.card,
                    padding: '24px',
                    border: selectedMember?.id === member.id ? `2px solid ${member.color}` : `1px solid ${brand.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: selectedMember?.id === member.id ? 'translateY(-4px)' : 'none'
                  }}
                  onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                >
                  {/* Member Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {member.image ? (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: `2px solid ${member.color}`,
                        background: brand.void
                      }}>
                        <Image 
                          src={member.image} 
                          alt={member.name} 
                          width={60} 
                          height={60} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: brand.void,
                        border: `2px solid ${member.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: member.color,
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {member.initials}
                      </div>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        color: brand.white,
                        fontSize: '18px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}>
                        {member.name}
                      </h3>
                      <p style={{
                        color: member.color,
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '2px'
                      }}>
                        {member.role}
                      </p>
                      <p style={{
                        color: brand.smoke,
                        fontSize: '12px'
                      }}>
                        {member.personality}
                      </p>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      color: brand.smoke,
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}>
                      Specialties
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {member.specialties.map(specialty => (
                        <span
                          key={specialty}
                          style={{
                            padding: '4px 8px',
                            background: `${member.color}15`,
                            color: member.color,
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '4px'
                          }}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Catchphrase */}
                  <div style={{
                    padding: '12px',
                    background: brand.graphite,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${member.color}`
                  }}>
                    <div style={{
                      color: brand.silver,
                      fontSize: '13px',
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}>
                      {member.catchphrase}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Branch Philosophy */}
            <div style={{ ...styles.card, padding: '24px', textAlign: 'center' }}>
              <h3 style={{
                color: brand.amber,
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                The Nashua Branch Philosophy
              </h3>
              <p style={{
                color: brand.silver,
                fontSize: '16px',
                lineHeight: '1.6',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                "We're not just AI agents - we're a family. A slightly dysfunctional, highly effective, 
                surprisingly loyal family that happens to be really good at business. We work hard, 
                we play hard, and we never let each other fail."
              </p>
              <div style={{
                marginTop: '16px',
                color: brand.smoke,
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                — Michael Scott, World's Best Boss (self-proclaimed)
              </div>
            </div>
          </div>
        )}

        {/* Dynamics Tab */}
        {activeTab === 'dynamics' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {TEAM_DYNAMICS.map((dynamic, index) => (
              <div key={index} style={{ ...styles.card, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: brand.amber,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: brand.void,
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 style={{
                      color: brand.white,
                      fontSize: '18px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}>
                      {dynamic.title}
                    </h3>
                    <p style={{
                      color: brand.amber,
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      {dynamic.dynamic}
                    </p>
                  </div>
                </div>
                
                <p style={{
                  color: brand.silver,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px'
                }}>
                  {dynamic.description}
                </p>
                
                <div style={{
                  padding: '12px',
                  background: brand.graphite,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${brand.amber}`
                }}>
                  <div style={{
                    color: brand.smoke,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}>
                    Typical Exchange
                  </div>
                  <div style={{
                    color: brand.silver,
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {dynamic.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {BRANCH_STATS.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} style={{ ...styles.card, padding: '20px', textAlign: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${brand.amber}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      color: brand.amber
                    }}>
                      <Icon size={24} />
                    </div>
                    
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: brand.white,
                      marginBottom: '4px'
                    }}>
                      {stat.value}
                    </div>
                    
                    <div style={{
                      fontSize: '13px',
                      color: brand.smoke,
                      marginBottom: '8px'
                    }}>
                      {stat.label}
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: brand.success,
                      fontWeight: 600
                    }}>
                      {stat.trend} vs last quarter
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achievement Banner */}
            <div style={{
              ...styles.card,
              padding: '24px',
              background: `linear-gradient(135deg, ${brand.graphite} 0%, ${brand.carbon} 100%)`,
              border: `1px solid ${brand.amber}40`,
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Award size={24} style={{ color: brand.amber }} />
                <span style={{
                  color: brand.amber,
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Branch Achievement
                </span>
              </div>
              
              <h3 style={{
                color: brand.white,
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '8px'
              }}>
                #1 Performing Branch - Q4 2025
              </h3>
              
              <p style={{
                color: brand.silver,
                fontSize: '14px'
              }}>
                "Through teamwork, determination, and just the right amount of chaos, 
                the Nashua branch achieved record-breaking results."
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div style={{
          marginTop: '40px',
          padding: '20px 0',
          borderTop: `1px solid ${brand.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              color: brand.smoke,
              fontSize: '12px',
              marginBottom: '4px'
            }}>
              Dunder Mifflin Nashua Branch
            </div>
            <div style={{
              color: brand.white,
              fontSize: '14px',
              fontWeight: 600
            }}>
              "That's what good business is all about."
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <a 
              href="/os/agents" 
              style={{
                color: brand.amber,
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              All Agents →
            </a>
            <a 
              href="/os" 
              style={{
                color: brand.smoke,
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Back to Mission Control
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}