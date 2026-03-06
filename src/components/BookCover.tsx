'use client';

import { useEffect, useRef, useState } from 'react';

interface BookCoverProps {
  pdfUrl: string;
  fallbackColor: string;
  title: string;
  author: string;
  year: string;
  isPdf: boolean;
}

export default function BookCover({ pdfUrl, fallbackColor, title, author, year, isPdf }: BookCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Render PDF first page when visible
  useEffect(() => {
    if (!visible || !isPdf || loaded || error) return;

    let cancelled = false;

    async function renderCover() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({
          url: pdfUrl,
          // Only fetch first few pages worth of data
          disableAutoFetch: true,
          disableStream: false,
        }).promise;

        if (cancelled) return;

        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        // Render at a reasonable size for a thumbnail
        const targetWidth = 360;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = targetWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // @ts-ignore - pdfjs render params type mismatch between versions
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        if (!cancelled) setLoaded(true);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    renderCover();
    return () => { cancelled = true; };
  }, [visible, pdfUrl, isPdf, loaded, error]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '220px',
        position: 'relative',
        overflow: 'hidden',
        background: loaded ? '#000' : `linear-gradient(145deg, ${fallbackColor}22, #1A1A1A, ${fallbackColor}11)`,
      }}
    >
      {/* Canvas for PDF render */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: loaded ? 'block' : 'none',
        }}
      />

      {/* Fallback cover (shown while loading or on error) */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '20px 14px',
        }}>
          {/* Spine line */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '4px', background: fallbackColor,
          }} />
          {/* Decorative lines */}
          <div style={{
            position: 'absolute', top: '16px', right: '14px', left: '20px',
            height: '1px', background: `${fallbackColor}33`,
          }} />
          <div style={{
            position: 'absolute', bottom: '16px', right: '14px', left: '20px',
            height: '1px', background: `${fallbackColor}33`,
          }} />
          {/* Loading spinner or title */}
          {visible && !error && (
            <div style={{
              width: '20px', height: '20px', border: `2px solid ${fallbackColor}44`,
              borderTopColor: fallbackColor, borderRadius: '50%',
              animation: 'bookSpin 0.8s linear infinite',
              marginBottom: '12px',
            }} />
          )}
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#fff',
            textAlign: 'center', lineHeight: '1.4',
            fontFamily: "'Space Grotesk', sans-serif",
            maxHeight: '120px', overflow: 'hidden',
            padding: '0 6px',
          }}>
            {title}
          </div>
          {author && (
            <div style={{
              fontSize: '11px', color: fallbackColor, marginTop: '10px',
              fontStyle: 'italic', textAlign: 'center',
            }}>
              {author}
            </div>
          )}
          {year && (
            <div style={{
              fontSize: '10px', color: '#737373', marginTop: '6px',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {year}
            </div>
          )}
        </div>
      )}

      {/* File type badge */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px',
        fontSize: '9px', fontWeight: 700,
        padding: '2px 6px', borderRadius: '3px',
        background: `${fallbackColor}33`, color: fallbackColor,
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: 'uppercase',
        zIndex: 2,
      }}>
        {isPdf ? 'PDF' : 'MP3'}
      </div>
    </div>
  );
}
