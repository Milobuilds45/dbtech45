'use client';

import { useState } from 'react';
import { brand, styles } from '@/lib/brand';

interface Credential {
  id: string;
  name: string;
  type: 'api_key' | 'password' | 'token' | 'ssh_key';
  category: string;
  agents: string[];
  lastRotated?: string;
  expiresAt?: string;
  status: 'active' | 'expiring' | 'expired';
}

const MOCK_CREDENTIALS: Credential[] = [
  {
    id: '1',
    name: 'Anthropic API Key',
    type: 'api_key',
    category: 'AI Services',
    agents: ['All Agents'],
    lastRotated: '2026-02-18',
    status: 'active',
  },
  {
    id: '2',
    name: 'OpenAI API Key',
    type: 'api_key',
    category: 'AI Services',
    agents: ['Milo', 'Paula', 'Dwight'],
    lastRotated: '2026-03-01',
    expiresAt: '2026-09-01',
    status: 'active',
  },
  {
    id: '3',
    name: 'Polygon.io API Key',
    type: 'api_key',
    category: 'Market Data',
    agents: ['Bobby'],
    lastRotated: '2026-01-15',
    status: 'active',
  },
  {
    id: '4',
    name: 'Coolify API Token',
    type: 'token',
    category: 'Infrastructure',
    agents: ['Anders', 'Paula'],
    lastRotated: '2026-02-20',
    status: 'active',
  },
  {
    id: '5',
    name: 'GitHub PAT (Milobuilds45)',
    type: 'token',
    category: 'Development',
    agents: ['Anders', 'Paula'],
    lastRotated: '2026-02-18',
    expiresAt: '2026-06-01',
    status: 'expiring',
  },
  {
    id: '6',
    name: 'Toast POS API Key',
    type: 'api_key',
    category: 'Restaurant',
    agents: ['Remy'],
    lastRotated: '2026-01-10',
    status: 'active',
  },
];

export default function CredentialVaultPage() {
  const [credentials] = useState<Credential[]>(MOCK_CREDENTIALS);
  const [selectedCred, setSelectedCred] = useState<Credential | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredCreds = credentials.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'expiring') return c.status === 'expiring';
    if (filter === 'expired') return c.status === 'expired';
    return c.category === filter;
  });

  const getStatusColor = (status: Credential['status']) => {
    switch (status) {
      case 'active': return brand.success;
      case 'expiring': return brand.warning;
      case 'expired': return brand.error;
    }
  };

  const getTypeIcon = (type: Credential['type']) => {
    switch (type) {
      case 'api_key': return '🔑';
      case 'password': return '🔒';
      case 'token': return '🎫';
      case 'ssh_key': return '🔐';
    }
  };

  const categories = ['all', ...Array.from(new Set(credentials.map(c => c.category)))];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={styles.h1}>🔐 Credential Vault</h1>
          <p style={{ color: brand.smoke, marginBottom: '1.5rem' }}>
            Secure credential management with agent access control, rotation tracking, and audit logs
          </p>

          {/* Stats Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: brand.carbon,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '1rem',
              flex: '1 1 150px',
            }}>
              <div style={{ fontSize: '0.75rem', color: brand.smoke }}>Total Credentials</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: brand.white }}>
                {credentials.length}
              </div>
            </div>
            <div style={{
              background: brand.carbon,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '1rem',
              flex: '1 1 150px',
            }}>
              <div style={{ fontSize: '0.75rem', color: brand.smoke }}>Expiring Soon</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: brand.warning }}>
                {credentials.filter(c => c.status === 'expiring').length}
              </div>
            </div>
            <div style={{
              background: brand.carbon,
              border: `1px solid ${brand.border}`,
              borderRadius: '8px',
              padding: '1rem',
              flex: '1 1 150px',
            }}>
              <div style={{ fontSize: '0.75rem', color: brand.smoke }}>Active</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: brand.success }}>
                {credentials.filter(c => c.status === 'active').length}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: brand.amber,
                color: brand.void,
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = brand.amberLight}
              onMouseLeave={(e) => e.currentTarget.style.background = brand.amber}
            >
              + Add Credential
            </button>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: brand.carbon,
                color: brand.white,
                border: `1px solid ${brand.border}`,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credentials Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredCreds.map(cred => (
            <div
              key={cred.id}
              onClick={() => setSelectedCred(cred)}
              style={{
                background: brand.carbon,
                border: `2px solid ${selectedCred?.id === cred.id ? brand.amber : brand.border}`,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedCred?.id !== cred.id) {
                  e.currentTarget.style.borderColor = brand.borderHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCred?.id !== cred.id) {
                  e.currentTarget.style.borderColor = brand.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>{getTypeIcon(cred.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: brand.white, marginBottom: '0.25rem' }}>
                    {cred.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: brand.smoke }}>
                    {cred.category}
                  </div>
                </div>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: getStatusColor(cred.status),
                  boxShadow: `0 0 8px ${getStatusColor(cred.status)}`,
                }} />
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: `${getStatusColor(cred.status)}22`,
                  color: getStatusColor(cred.status),
                  border: `1px solid ${getStatusColor(cred.status)}`,
                }}>
                  {cred.status}
                </span>
              </div>

              {/* Agents */}
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${brand.border}` }}>
                <div style={{ fontSize: '0.75rem', color: brand.smoke, marginBottom: '0.5rem' }}>
                  Agent Access
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {cred.agents.map(agent => (
                    <span
                      key={agent}
                      style={{
                        background: brand.graphite,
                        color: brand.amber,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                {cred.lastRotated && (
                  <div>
                    <div style={{ color: brand.smoke }}>Last Rotated</div>
                    <div style={{ color: brand.silver, fontWeight: 600 }}>
                      {new Date(cred.lastRotated).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {cred.expiresAt && (
                  <div>
                    <div style={{ color: brand.smoke }}>Expires</div>
                    <div style={{ color: cred.status === 'expiring' ? brand.warning : brand.silver, fontWeight: 600 }}>
                      {new Date(cred.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedCred && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '400px',
            background: brand.carbon,
            borderLeft: `2px solid ${brand.amber}`,
            padding: '2rem',
            overflowY: 'auto',
            zIndex: 100,
          }}>
            <button
              onClick={() => setSelectedCred(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: brand.smoke,
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              {getTypeIcon(selectedCred.type)}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: brand.white, marginBottom: '0.5rem' }}>
              {selectedCred.name}
            </h2>
            <p style={{ color: brand.smoke, marginBottom: '2rem' }}>
              {selectedCred.category}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <button style={{
                background: brand.amber,
                color: brand.void,
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Rotate Credential
              </button>
              <button style={{
                background: 'none',
                color: brand.info,
                border: `1px solid ${brand.info}`,
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                View Audit Log
              </button>
              <button style={{
                background: 'none',
                color: brand.error,
                border: `1px solid ${brand.error}`,
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Revoke Access
              </button>
            </div>

            {/* Details */}
            <div style={{
              background: brand.graphite,
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: brand.smoke, marginBottom: '0.25rem' }}>Type</div>
                <div style={{ color: brand.white }}>{selectedCred.type.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: brand.smoke, marginBottom: '0.25rem' }}>Status</div>
                <div style={{ color: getStatusColor(selectedCred.status) }}>{selectedCred.status.toUpperCase()}</div>
              </div>
              {selectedCred.lastRotated && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ color: brand.smoke, marginBottom: '0.25rem' }}>Last Rotated</div>
                  <div style={{ color: brand.white }}>{new Date(selectedCred.lastRotated).toLocaleDateString()}</div>
                </div>
              )}
              {selectedCred.expiresAt && (
                <div>
                  <div style={{ color: brand.smoke, marginBottom: '0.25rem' }}>Expires At</div>
                  <div style={{ color: brand.white }}>{new Date(selectedCred.expiresAt).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div
            onClick={() => setShowAddModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: brand.carbon,
                border: `2px solid ${brand.amber}`,
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: brand.white, marginBottom: '1.5rem' }}>
                Add New Credential
              </h2>
              <p style={{ color: brand.smoke, marginBottom: '2rem' }}>
                Feature coming soon - will allow adding credentials with agent permissions, expiration dates, and rotation schedules.
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: brand.amber,
                  color: brand.void,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
