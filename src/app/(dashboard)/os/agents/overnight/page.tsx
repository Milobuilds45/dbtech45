'use client';
import { useState, useEffect, useCallback } from 'react';
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
  empty?: boolean;
}

const AGENTS = [
  { id: 'milo', name: 'Milo', color: '#A855F7' },
  { id: 'anders', name: 'Anders', color: '#F97316' },
  { id: 'paula', name: 'Paula', color: '#EC4899' },
  { id: 'bobby', name: 'Bobby', color: '#22C55E' },
  { id: 'dwight', name: 'Dwight', color: '#6366F1' },
  { id: 'tony', name: 'Tony', color: '#EAB308' },
  { id: 'dax', name: 'Dax', color: '#06B6D4' },
  { id: 'remy', name: 'Remy', color: '#EF4444' },
  { id: 'wendy', name: 'Wendy', color: '#8B5CF6' },
];

const CACHE_KEY_PREFIX = 'overnight-plan-';

function getCachedPlan(date: string): DailyPlan | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + date);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function setCachedPlan(date: string, plan: DailyPlan): void {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + date, JSON.stringify(plan));
  } catch { /* ignore */ }
}

export default function OvernightPlanning() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>({ date: selectedDate, suggestions: [], notes: '', approved: false, empty: true });
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const fetchPlan = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/overnight-plans?date=${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const plan: DailyPlan = await res.json();
      plan.date = date;
      setDailyPlan(plan);
      setNotes(plan.notes || '');
      setCachedPlan(date, plan);
    } catch {
      // Fallback to localStorage cache
      const cached = getCachedPlan(date);
      if (cached) {
        setDailyPlan(cached);
        setNotes(cached.notes || '');
      } else {
        setDailyPlan({ date, suggestions: [], notes: '', approved: false, empty: true });
        setNotes('');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan(selectedDate);
  }, [selectedDate, fetchPlan]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
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

  const postAction = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/overnight-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.plan) {
        const updated = { ...result.plan, date: selectedDate, empty: false };
        setDailyPlan(updated);
        setCachedPlan(selectedDate, updated);
      }
      return true;
    } catch {
      return false;
    }
  };

  const updateSuggestionStatus = async (id: string, status: OvernightSuggestion['status']) => {
    // Optimistic update
    setDailyPlan(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
      )
    }));

    const success = await postAction({
      action: 'update-status',
      date: selectedDate,
      suggestionId: id,
      status,
    });

    if (!success) {
      // Update localStorage with optimistic state anyway
      setDailyPlan(prev => {
        setCachedPlan(selectedDate, prev);
        return prev;
      });
    }
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

  const saveNotes = async () => {
    setDailyPlan(prev => ({ ...prev, notes }));
    setEditingNotes(false);
    await postAction({
      action: 'update-notes',
      date: selectedDate,
      notes,
    });
  };

  const approvePlan = async () => {
    const newApproved = !dailyPlan.approved;
    setDailyPlan(prev => ({ ...prev, approved: newApproved }));
    await postAction({
      action: newApproved ? 'approve' : 'reject',
      date: selectedDate,
    });
  };

  const totalHours = dailyPlan.suggestions.reduce((sum, s) => sum + s.estimatedHours, 0);

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
                {dailyPlan.empty ? 'No plan for this date' : `${totalHours} estimated hours • ${dailyPlan.suggestions.length} suggestions`}
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

        {loading ? (
          <div style={{
            ...styles.card,
            padding: '48px',
            textAlign: 'center' as const,
            color: brand.smoke,
          }}>
            Loading plan...
          </div>
        ) : dailyPlan.empty ? (
          <div style={{
            ...styles.card,
            padding: '48px',
            textAlign: 'center' as const,
          }}>
            <Moon size={40} style={{ color: brand.smoke, marginBottom: '16px' }} />
            <div style={{ color: brand.silver, fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No overnight plan for this date
            </div>
            <div style={{ color: brand.smoke, fontSize: '14px' }}>
              Navigate to a date with planned tasks or wait for agents to submit suggestions.
            </div>
          </div>
        ) : (
          <>
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
                            background: '#000000',
                            border: `2px solid ${agent?.color || brand.smoke}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: agent?.color || brand.smoke,
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
          </>
        )}
      </div>
    </div>
  );
}
