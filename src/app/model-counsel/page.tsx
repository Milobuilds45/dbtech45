'use client';

import { useEffect } from 'react';

export default function ModelCounselPage() {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/model-counsel.html';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#0f0f17',
      color: '#e2e8f0'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Redirecting to Model Counsel...</h1>
        <p>If you&apos;re not redirected automatically, <a href="/model-counsel.html" style={{ color: '#3b82f6' }}>click here</a></p>
      </div>
    </div>
  );
}