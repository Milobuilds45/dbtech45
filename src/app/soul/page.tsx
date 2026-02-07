"use client";

import { useEffect } from 'react';

export default function SoulPage() {
  useEffect(() => {
    // Immediate redirect - no delay
    const redirect = () => {
      window.location.replace('https://soulsolace.vercel.app/soulsolace');
    };
    
    // Multiple fallbacks for mobile browsers
    redirect();
    setTimeout(redirect, 100);
    setTimeout(redirect, 500);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0B',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #f59e0b',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#f59e0b', marginBottom: '8px' }}>Loading Soul Solace...</p>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Redirecting to prayer assistant...</p>
        <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '16px' }}>
          <a href="https://soulsolace.vercel.app/soulsolace" style={{ color: '#f59e0b' }}>
            Click here if not redirected automatically
          </a>
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}