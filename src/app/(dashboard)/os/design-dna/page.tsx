'use client';

import { useState } from 'react';
import { Upload, Loader2, Download, Copy, Check } from 'lucide-react';

export default function DesignDNAPage() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      analyzeDesign(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeDesign = async (base64Image: string) => {
    setAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateTailwindConfig = () => {
    if (!analysis) return '';
    
    return `// Tailwind Config extracted from design
module.exports = {
  theme: {
    extend: {
      colors: {
${analysis.colors?.map((c: any, i: number) => `        'brand-${i + 1}': '${c.hex}',  // ${c.name}`).join('\n') || '        // No colors detected'}
      },
      fontFamily: {
${analysis.typography?.families?.map((f: string) => `        '${f.toLowerCase().replace(/\s+/g, '-')}': ['${f}', 'sans-serif'],`).join('\n') || '        // No fonts detected'}
      },
      spacing: {
${analysis.spacing?.scale?.map((s: string, i: number) => `        '${i}': '${s}',`).join('\n') || '        // No spacing detected'}
      },
    },
  },
};`;
  };

  return (
    <div style={{ 
      padding: '30px', 
      background: '#000', 
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#fff',
            marginBottom: '8px',
          }}>
            Design DNA Scanner
          </h1>
          <p style={{ fontSize: '14px', color: '#737373' }}>
            Upload any website screenshot. Get a full design system breakdown in seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: imageUrl ? '1fr 1fr' : '1fr', gap: '30px' }}>
          {/* Upload Zone */}
          <div>
            <label 
              htmlFor="screenshot-upload"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                background: '#111',
                border: '2px dashed #333',
                borderRadius: '12px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!uploading) e.currentTarget.style.borderColor = '#F59E0B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
              }}
            >
              <input
                id="screenshot-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Uploaded screenshot"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    borderRadius: '12px',
                  }}
                />
              ) : (
                <>
                  {uploading ? (
                    <Loader2 size={48} color="#F59E0B" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Upload size={48} color="#737373" />
                  )}
                  <div style={{ 
                    marginTop: '16px', 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: '#fff',
                  }}>
                    {uploading ? 'Uploading...' : 'Drop screenshot here'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#737373', marginTop: '8px' }}>
                    or click to browse
                  </div>
                </>
              )}
            </label>

            {imageUrl && (
              <button
                onClick={() => {
                  setImageUrl(null);
                  setAnalysis(null);
                }}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Upload New Screenshot
              </button>
            )}
          </div>

          {/* Analysis Results */}
          {imageUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {analyzing ? (
                <div style={{
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '12px',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <Loader2 size={40} color="#F59E0B" style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                    Analyzing design DNA...
                  </div>
                  <div style={{ fontSize: '13px', color: '#737373', textAlign: 'center' }}>
                    Extracting colors, typography, spacing, and components
                  </div>
                </div>
              ) : analysis ? (
                <>
                  {/* Colors */}
                  {analysis.colors && (
                    <div style={{
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: '12px',
                      padding: '20px',
                    }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                        Color Palette
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {analysis.colors.map((color: any, i: number) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              background: color.hex,
                              border: '1px solid #333',
                            }} />
                            <div style={{ fontSize: '11px', color: '#737373', textAlign: 'center' }}>
                              {color.hex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typography */}
                  {analysis.typography && (
                    <div style={{
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: '12px',
                      padding: '20px',
                    }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                        Typography
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {analysis.typography.families?.map((font: string, i: number) => (
                          <div key={i} style={{ fontSize: '14px', color: '#fff', fontFamily: font }}>
                            {font}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tailwind Config */}
                  <div style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                        Tailwind Config
                      </h3>
                      <button
                        onClick={() => copyToClipboard(generateTailwindConfig())}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          background: '#222',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre style={{
                      background: '#000',
                      padding: '16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#10ca78',
                      fontFamily: "'JetBrains Mono', monospace",
                      overflow: 'auto',
                      maxHeight: '300px',
                    }}>
                      {generateTailwindConfig()}
                    </pre>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
