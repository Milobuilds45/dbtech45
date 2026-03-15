'use client';

import { useState } from 'react';
import { Upload, Loader2, Download, Copy, Check, Code } from 'lucide-react';

export default function PrototypeToProdPage() {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDesignUrl(reader.result as string);
      generateCode(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateCode = async (base64Image: string) => {
    setGenerating(true);
    
    try {
      const response = await fetch('/api/design-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design: base64Image }),
      });
      
      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setUploading(false);
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component.tsx';
    a.click();
  };

  return (
    <div style={{ 
      padding: '30px', 
      background: '#000', 
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#fff',
            marginBottom: '8px',
          }}>
            Prototype → Production
          </h1>
          <p style={{ fontSize: '14px', color: '#737373' }}>
            Upload a design screenshot. Get production-ready Next.js + Tailwind code.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: designUrl ? '1fr 1fr' : '1fr', gap: '30px' }}>
          {/* Upload Zone */}
          <div>
            <label 
              htmlFor="design-upload"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '500px',
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
                id="design-upload"
                type="file"
                accept="image/*"
                onChange={handleDesignUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              
              {designUrl ? (
                <img 
                  src={designUrl} 
                  alt="Design mockup"
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
                    {uploading ? 'Uploading...' : 'Drop design here'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#737373', marginTop: '8px' }}>
                    Figma screenshot, mockup, or hand-drawn sketch
                  </div>
                </>
              )}
            </label>

            {designUrl && (
              <button
                onClick={() => {
                  setDesignUrl(null);
                  setGeneratedCode(null);
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
                Upload Different Design
              </button>
            )}
          </div>

          {/* Generated Code */}
          {designUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {generating ? (
                <div style={{
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: '12px',
                  padding: '60px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  minHeight: '500px',
                  justifyContent: 'center',
                }}>
                  <Loader2 size={48} color="#F59E0B" style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                    Generating production code...
                  </div>
                  <div style={{ fontSize: '13px', color: '#737373', textAlign: 'center', maxWidth: '300px' }}>
                    Analyzing layout, extracting components, writing Next.js + Tailwind code
                  </div>
                </div>
              ) : generatedCode ? (
                <>
                  {/* Code Editor */}
                  <div style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}>
                    {/* Editor Header */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '12px 16px',
                      borderBottom: '1px solid #222',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Code size={16} color="#F59E0B" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                          component.tsx
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={copyCode}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#222',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={downloadCode}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#F59E0B',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#000',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Code Content */}
                    <pre style={{
                      padding: '20px',
                      margin: 0,
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#10ca78',
                      fontFamily: "'JetBrains Mono', monospace",
                      overflow: 'auto',
                      maxHeight: '600px',
                      background: '#000',
                    }}>
                      {generatedCode}
                    </pre>
                  </div>

                  {/* Instructions */}
                  <div style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                      How to use
                    </h3>
                    <ol style={{ 
                      margin: 0, 
                      paddingLeft: '20px', 
                      fontSize: '13px', 
                      color: '#737373',
                      lineHeight: '1.8',
                    }}>
                      <li>Copy or download the generated code</li>
                      <li>Create a new component file in your Next.js project</li>
                      <li>Paste the code and import where needed</li>
                      <li>Adjust spacing/colors to match your design system</li>
                      <li>Ship to production 🚀</li>
                    </ol>
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
