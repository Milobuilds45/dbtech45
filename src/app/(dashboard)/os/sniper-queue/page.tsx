'use client';

import { brand, styles } from '@/lib/brand';

interface ReplyDraft {
  id: string;
  handle: string;
  context: string;
  reply: string;
  status: 'queued' | 'ready' | 'needs-review';
  eta: string;
}

const DRAFTS: ReplyDraft[] = [
  {
    id: 'x-1',
    handle: '@foundermax',
    context: 'Thread on AI agents replacing SOPs',
    reply: 'The winners won’t just automate tasks—they’ll ship a unified operating layer for decisions. You’re describing the playbook.',
    status: 'ready',
    eta: 'Today 10:40 AM',
  },
  {
    id: 'x-2',
    handle: '@opsqueen',
    context: 'Debate about short-term vs long-term shipping cadence',
    reply: 'Ship cadence is a feature. We cap Active at 2 so everything else freezes or dies. That pressure is the engine.',
    status: 'queued',
    eta: 'Today 2:15 PM',
  },
  {
    id: 'x-3',
    handle: '@growthworks',
    context: 'Question about newsletter automation',
    reply: 'We treat the newsletter like a product: draft in Markdown, ship on cadence, measure replies as signal.',
    status: 'needs-review',
    eta: 'Tomorrow 9:00 AM',
  },
  {
    id: 'x-4',
    handle: '@agentstack',
    context: 'Hot take on agent memory bloat',
    reply: 'Memory without pruning is just noise. We log, score, and only promote high-utility notes.',
    status: 'queued',
    eta: 'Tomorrow 1:30 PM',
  },
];

const statusColor = (status: ReplyDraft['status']) => {
  if (status === 'ready') return brand.success;
  if (status === 'needs-review') return brand.warning;
  return brand.amber;
};

export default function SniperQueuePage() {
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={styles.h1}>Sniper Queue</h1>
            <p style={styles.subtitle}>Drafted X replies ready to deploy. Keep voice tight and response windows fast.</p>
          </div>
          <div style={{ ...styles.card, padding: '0.6rem 1rem' }}>
            <div style={{ fontSize: '11px', color: brand.smoke, textTransform: 'uppercase' }}>Drafted Replies</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: brand.amber }}>{DRAFTS.length}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ ...styles.card }}>
            <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Reply Drafts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {DRAFTS.map(draft => (
                <div key={draft.id} style={{ background: brand.graphite, border: `1px solid ${brand.border}`, borderRadius: '10px', padding: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: brand.white }}>{draft.handle}</div>
                    <span style={{ ...styles.badge(statusColor(draft.status)), textTransform: 'uppercase', fontSize: '10px' }}>{draft.status.replace('-', ' ')}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: brand.smoke, marginBottom: '0.5rem' }}>{draft.context}</div>
                  <div style={{ fontSize: '13px', color: brand.silver, lineHeight: 1.5 }}>{draft.reply}</div>
                  <div style={{ marginTop: '0.6rem', fontSize: '11px', color: brand.smoke }}>ETA: {draft.eta}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...styles.card }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem' }}>X Bookmarks</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: brand.silver }}>—</div>
              <div style={{ fontSize: '12px', color: brand.smoke, marginTop: '0.4rem' }}>
                Bookmark ingestion coming soon. Wire this to saved tweets and prioritize by velocity.
              </div>
            </div>
            <div style={{ ...styles.card }}>
              <div style={{ fontSize: '12px', color: brand.smoke, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Queue Rules</div>
              {['Reply within 4 hours', 'No more than 2 threads/day', 'Keep tone: calm, precise, slightly ruthless'].map(rule => (
                <div key={rule} style={{ display: 'flex', gap: '0.5rem', fontSize: '12px', color: brand.silver, marginBottom: '0.5rem' }}>
                  <span style={{ color: brand.amber }}>•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
