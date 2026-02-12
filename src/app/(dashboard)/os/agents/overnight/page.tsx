'use client';
import { useState, useEffect } from 'react';
import { brand, styles } from '@/lib/brand';
import { Calendar, Clock, Edit3, Save, X, ChevronLeft, ChevronRight, Moon, Star } from 'lucide-react';

interface OvernightSuggestion {
  id: string;
  agentId: string;
  agentName: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  category: 'research' | 'development' | 'content' | 'analysis' | 'planning' | 'other';
  estimatedHours: number;
  status: 'suggested' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface DailyPlan {
  date: string;
  suggestions: OvernightSuggestion[];
  notes: string;
  approved: boolean;
}

const AGENTS = [
  { id: 'milo', name: 'Milo', color: '#A855F7' },
  { id: 'anders', name: 'Anders', color: '#F97316' },
  { id: 'paula', name: 'Paula', color: '#EC4899' },
  { id: 'bobby', name: 'Bobby', color: '#EF4444' },
  { id: 'dwight', name: 'Dwight', color: '#6366F1' },
  { id: 'tony', name: 'Tony', color: '#EAB308' },
  { id: 'dax', name: 'Dax', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#22C55E' },
  { id: 'wendy', name: 'Wendy', color: '#8B5CF6' },
];

// Mock data - replace with API calls
const generateMockPlan = (date: string): DailyPlan => ({
  date,
  approved: false,
  notes: '',
  suggestions: [
    {
      id: `${date}-1`,
      agentId: 'bobby',
      agentName: 'Bobby',
      suggestion: 'Analyze pre-market futures and options flow for tomorrow\'s trading session. Update risk models based on current volatility.',
      priority: 'high',
      category: 'analysis',
      estimatedHours: 2,
      status: 'suggested',
      createdAt: date,
      updatedAt: date,
    },
    {
      id: `${date}-2`,
      agentId: 'anders',
      agentName: 'Anders',
      suggestion: 'Complete AxeCap terminal performance optimization and implement new caching strategy for market data APIs.',
      priority: 'high',
      category: 'development',
      estimatedHours: 3,
      status: 'suggested',
      createdAt: date,
      updatedAt: date,
    },
    {
      id: `${date}-3`,
      agentId: 'paula',
      agentName: 'Paula',
      suggestion: 'Design new brand assets for the upcoming Biz-in-a-Box marketing campaign. Create mockups for landing page.',
      priority: 'medium',
      category: 'content',
      estimatedHours: 2.5,
      status: 'suggested',
      createdAt: date,
      updatedAt: date,
    },
    {
      id: `${date}-4`,
      agentId: 'dwight',
      agentName: 'Dwight',
      suggestion: 'Research emerging AI tools and frameworks. Compile intelligence brief on competitor analysis for agent marketplaces.',
      priority: 'medium',
      category: 'research',
      estimatedHours: 2,
      status: 'suggested',
      createdAt: date,
      updatedAt: date,
    },
    {
      id: `${date}-5`,
      agentId: 'milo',
      agentName: 'Milo',
      suggestion: 'Update project documentation and coordinate tomorrow\'s agent tasks. Review and organize memory systems.',
      priority: 'low',
      category: 'planning',
      estimatedHours: 1.5,
      status: 'suggested',
      createdAt: date,
      updatedAt: date,
    },
  ]
});

export default function OvernightPlanning() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(generateMockPlan(selectedDate));
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(dailyPlan.notes);
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Load plan for selected date
    setDailyPlan(generateMockPlan(selectedDate));
  }, [selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return brand.error;
      case 'medium': return brand.amber;
      case 'low': return brand.success;
      default: return brand.smoke;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return brand.success;
      case 'in-progress': return brand.amber;
      case 'completed': return brand.success;
      case 'rejected': return brand.error;
      default: return brand.smoke;
    }
  };

  const updateSuggestionStatus = (id: string, status: OvernightSuggestion['status']) => {
    setDailyPlan(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
      )
    }));
  };

  const saveSuggestionEdit = (id: string) => {
    setDailyPlan(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === id ? { ...s, suggestion: editText, updatedAt: new Date().toISOString() } : s
      )
    }));
    setEditingSuggestion(null);
    setEditText('');
  };

  const startEditSuggestion = (suggestion: OvernightSuggestion) => {
    setEditingSuggestion(suggestion.id);
    setEditText(suggestion.suggestion);
  };

  const saveNotes = () => {
    setDailyPlan(prev => ({ ...prev, notes }));
    setEditingNotes(false);
  };

  const approvePlan = () => {
    setDailyPlan(prev => ({ ...prev, approved: !prev.approved }));
  };

  const totalHours = dailyPlan.suggestions.reduce((sum, s) => sum + s.estimatedHours, 0);
  const approvedSuggestions = dailyPlan.suggestions.filter(s => s.status === 'approved');

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={styles.h1}>Overnight Planning</h1>
          <p style={styles.subtitle}>Daily agent suggestions and task coordination</p>
        </div>

        {/* Date Navigation */}
        <div style={{
          ...styles.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          marginBottom: '20px',
        }}>
          <button
            onClick={() => navigateDate('prev')}
            style={{
              background: 'transparent',
              border: `1px solid ${brand.border}`,
              borderRadius: '6px',
              padding: '8px',
              color: brand.silver,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Calendar size={20} style={{ color: brand.amber }} />
            <div>
              <div style={{ color: brand.white, fontWeight: 600, fontSize: '18px' }}>
                {formatDate(selectedDate)}
              </div>
              <div style={{ color: brand.smoke, fontSize: '12px' }}>
                {totalHours} estimated hours • {dailyPlan.suggestions.length} suggestions
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateDate('next')}
            style={{
              background: 'transparent',
              border: `1px solid ${brand.border}`,
              borderRadius: '6px',
              padding: '8px',
              color: brand.silver,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Plan Status & Actions */}
        <div style={{
          ...styles.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          marginBottom: '20px',
          background: dailyPlan.approved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${dailyPlan.approved ? brand.success : brand.amber}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dailyPlan.approved ? brand.success : brand.amber,
            }} />
            <span style={{ 
              color: dailyPlan.approved ? brand.success : brand.amber,
              fontWeight: 600,
            }}>
              {dailyPlan.approved ? 'Plan Approved' : 'Awaiting Approval'}
            </span>
          </div>

          <button
            onClick={approvePlan}
            style={{
              background: dailyPlan.approved ? 'transparent' : brand.amber,
              color: dailyPlan.approved ? brand.success : brand.void,
              border: dailyPlan.approved ? `1px solid ${brand.success}` : 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Star size={16} style={{ 
              fill: dailyPlan.approved ? brand.success : brand.void 
            }} />
            {dailyPlan.approved ? 'Approved' : 'Approve Plan'}
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            color: brand.amber, 
            fontSize: '18px', 
            fontWeight: 600, 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Moon size={20} />
            Agent Suggestions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dailyPlan.suggestions.map(suggestion => {
              const agent = AGENTS.find(a => a.id === suggestion.agentId);
              const isEditing = editingSuggestion === suggestion.id;

              return (
                <div
                  key={suggestion.id}
                  style={{
                    ...styles.card,
                    padding: '20px',
                    border: suggestion.status === 'approved' ? 
                      `1px solid ${brand.success}` : 
                      `1px solid ${brand.border}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: agent?.color || brand.smoke,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: brand.void,
                        fontWeight: 700,
                        fontSize: '12px',
                      }}>
                        {suggestion.agentName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: brand.white, fontWeight: 600, fontSize: '14px' }}>
                          {suggestion.agentName}
                        </div>
                        <div style={{ color: brand.smoke, fontSize: '12px' }}>
                          {suggestion.estimatedHours}h • {suggestion.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${getPriorityColor(suggestion.priority)}20`,
                        color: getPriorityColor(suggestion.priority),
                        textTransform: 'uppercase',
                      }}>
                        {suggestion.priority}
                      </span>

                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${getStatusColor(suggestion.status)}20`,
                        color: getStatusColor(suggestion.status),
                        textTransform: 'uppercase',
                      }}>
                        {suggestion.status.replace('-', ' ')}
                      </span>

                      {!isEditing && (
                        <button
                          onClick={() => startEditSuggestion(suggestion)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: brand.smoke,
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ marginBottom: '12px' }}>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                          width: '100%',
                          background: brand.graphite,
                          border: `1px solid ${brand.border}`,
                          borderRadius: '6px',
                          padding: '12px',
                          color: brand.white,
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: '80px',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => saveSuggestionEdit(suggestion.id)}
                          style={{
                            background: brand.success,
                            color: brand.void,
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Save size={12} />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingSuggestion(null);
                            setEditText('');
                          }}
                          style={{
                            background: 'transparent',
                            color: brand.smoke,
                            border: `1px solid ${brand.border}`,
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={12} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      color: brand.silver,
                      fontSize: '14px',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                    }}>
                      {suggestion.suggestion}
                    </div>
                  )}

                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                        disabled={suggestion.status === 'approved'}
                        style={{
                          background: suggestion.status === 'approved' ? brand.success : 'transparent',
                          color: suggestion.status === 'approved' ? brand.void : brand.success,
                          border: `1px solid ${brand.success}`,
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: suggestion.status === 'approved' ? 'default' : 'pointer',
                          opacity: suggestion.status === 'approved' ? 0.7 : 1,
                        }}
                      >
                        {suggestion.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>

                      <button
                        onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                        disabled={suggestion.status === 'rejected'}
                        style={{
                          background: suggestion.status === 'rejected' ? brand.error : 'transparent',
                          color: suggestion.status === 'rejected' ? brand.void : brand.error,
                          border: `1px solid ${brand.error}`,
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: suggestion.status === 'rejected' ? 'default' : 'pointer',
                          opacity: suggestion.status === 'rejected' ? 0.7 : 1,
                        }}
                      >
                        {suggestion.status === 'rejected' ? 'Rejected' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div style={styles.card}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h3 style={{ color: brand.amber, fontSize: '16px', fontWeight: 600 }}>
              Notes & Modifications
            </h3>
            {!editingNotes && (
              <button
                onClick={() => {
                  setEditingNotes(true);
                  setNotes(dailyPlan.notes);
                }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${brand.border}`,
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: brand.silver,
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Edit3 size={12} />
                Edit Notes
              </button>
            )}
          </div>

          {editingNotes ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about tonight's plan, modifications, or special instructions..."
                style={{
                  width: '100%',
                  background: brand.graphite,
                  border: `1px solid ${brand.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: brand.white,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '100px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={saveNotes}
                  style={{
                    background: brand.amber,
                    color: brand.void,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={14} />
                  Save Notes
                </button>
                <button
                  onClick={() => {
                    setEditingNotes(false);
                    setNotes(dailyPlan.notes);
                  }}
                  style={{
                    background: 'transparent',
                    color: brand.smoke,
                    border: `1px solid ${brand.border}`,
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              color: dailyPlan.notes ? brand.silver : brand.smoke,
              fontSize: '14px',
              fontStyle: dailyPlan.notes ? 'normal' : 'italic',
              lineHeight: '1.5',
              minHeight: '60px',
            }}>
              {dailyPlan.notes || 'No notes yet. Click "Edit Notes" to add instructions or modifications.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}