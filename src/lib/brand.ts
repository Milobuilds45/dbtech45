// DBTECH45 Brand Design Tokens — from Paula's Brand Spec
// Dark + Amber + Clean + Fast

export const brand = {
  // Backgrounds
  void: '#000000',
  carbon: '#111111',
  graphite: '#1A1A1A',

  // Accent (Electric Amber)
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberDark: '#D97706',

  // Text
  white: '#FFFFFF',
  silver: '#A3A3A3',
  smoke: '#737373',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
  warning: '#EAB308',

  // Borders
  border: '#222222',
  borderHover: '#F59E0B',
} as const;

// Reusable style objects
export const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: brand.void,
    color: brand.white,
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
  } as React.CSSProperties,

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,

  h1: {
    color: brand.amber,
    fontSize: '2rem',
    marginBottom: '0.5rem',
    fontWeight: 700,
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  subtitle: {
    color: brand.silver,
    marginBottom: '2rem',
  } as React.CSSProperties,

  card: {
    backgroundColor: brand.carbon,
    padding: '1.5rem',
    borderRadius: '12px',
    border: `1px solid ${brand.border}`,
    transition: 'border-color 0.2s ease',
  } as React.CSSProperties,

  cardHover: {
    borderColor: brand.amber,
  },

  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: brand.graphite,
    border: `1px solid ${brand.border}`,
    borderRadius: '6px',
    color: brand.white,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '14px',
  } as React.CSSProperties,

  button: {
    backgroundColor: brand.amber,
    color: brand.void,
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,

  badge: (color: string) => ({
    color,
    fontSize: '12px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: '3px 10px',
    borderRadius: '10px',
    fontWeight: 500,
  } as React.CSSProperties),

  backLink: {
    color: brand.smoke,
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  } as React.CSSProperties,

  sectionLabel: {
    color: brand.smoke,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
} as const;
