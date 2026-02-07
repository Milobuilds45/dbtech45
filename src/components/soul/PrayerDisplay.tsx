'use client';

import React, { useState } from 'react';
import { PrayerResponse, GroundingSource, Religion } from '../../lib/soul/types';
import { Icon } from './Icon';
import { PrayerText } from './PrayerText';

interface PrayerDisplayProps {
  prayers: PrayerResponse[];
  sources: GroundingSource[];
  onReset: () => void;
  isLoading?: boolean;
  religion?: Religion;
  situation?: string;
}

export const PrayerDisplay: React.FC<PrayerDisplayProps> = ({ 
  prayers, 
  sources, 
  onReset, 
  religion, 
  situation 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activePrayer = prayers[activeIndex] || prayers[0];

  const handleCopy = () => {
    const text = `${activePrayer.title}\n\n${activePrayer.prayerBody}\n\nSource: ${activePrayer.origin}\n${activePrayer.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
      {/* Enhanced Tab Selection - responsive */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 px-2">
        {prayers.map((prayer, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`tab-btn text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 ${activeIndex === idx ? 'active scale-105' : ''}`}
          >
            <span className="relative z-10">
              <span className="hidden sm:inline">{prayer.isCanonical ? 'Scriptural' : 'Composed'} {idx + 1}</span>
              <span className="sm:hidden">{prayer.isCanonical ? 'Script.' : 'Comp.'} {idx + 1}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card-premium rounded-3xl overflow-hidden relative group">
        {/* Gradient bar with shimmer effect */}
        <div
          className={`h-3 relative z-10 overflow-hidden ${activePrayer.isCanonical ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600' : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'}`}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        <div className="p-5 sm:p-8 md:p-12 relative z-10">
          {/* Header - stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2">
              <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-300 ${activePrayer.isCanonical
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/50 shadow-sm'
                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/50 shadow-sm'
                }`}>
                <Icon name={activePrayer.isCanonical ? "ShieldCheck" : "Sparkles"} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{activePrayer.isCanonical ? 'Scriptural / Canonical' : 'Tradition-Aligned'}</span>
                <span className="sm:hidden">{activePrayer.isCanonical ? 'Scriptural' : 'Composed'}</span>
              </span>
            </div>

            {/* Action buttons - icons only on mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-indigo-600 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-50"
                title="Copy prayer"
              >
                {copied ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Icon name="Check" className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied</span>
                  </span>
                ) : (
                  <>
                    <Icon name="Copy" className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-2 leading-tight">
            {activePrayer.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 sm:gap-2">
              <Icon name="BookOpen" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {activePrayer.origin}
            </p>
            {/* Language badge - show if prayer has original language that's not English */}
            {activePrayer.originalLanguage && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Icon name="Languages" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {activePrayer.originalLanguage}
              </span>
            )}
          </div>

          {/* Prayer body with multi-language support */}
          <PrayerText
            prayerBody={activePrayer.prayerBody}
            originalLanguage={activePrayer.originalLanguage}
            originalText={activePrayer.originalText}
            transliteration={activePrayer.transliteration}
          />

          {/* Theological Context */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Icon name="Info" className="w-4 h-4" />
              Theological Context
            </h4>
            <p className="text-slate-600 leading-relaxed italic">
              {activePrayer.explanation}
            </p>
          </div>

          {/* Enhanced Sources Section */}
          {sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Icon name="Link" className="w-4 h-4" />
                References & Verifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/source inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-300 max-w-full card-shine"
                  >
                    <span className="truncate max-w-[200px]">{source.title}</span>
                    <Icon
                      name="ExternalLink"
                      className="w-3 h-3 flex-shrink-0 transition-transform duration-300 group-hover/source:translate-x-0.5 group-hover/source:-translate-y-0.5"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-700 font-medium transition-all duration-300 px-6 py-3 rounded-full hover:bg-white/50 group"
        >
          <Icon name="ChevronLeft" className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Seek Another Tradition
        </button>
      </div>
    </div>
  );
};