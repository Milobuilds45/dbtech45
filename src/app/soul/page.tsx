"use client";

import { useState } from 'react';
import Link from 'next/link';

type Religion = 'christianity' | 'judaism' | 'islam' | 'buddhism' | 'hinduism' | 'sikh' | 'other';
type AppState = 'selection' | 'input' | 'result' | 'loading';

interface ReligionOption {
  id: Religion;
  name: string;
  emoji: string;
  color: string;
}

const RELIGIONS: ReligionOption[] = [
  { id: 'christianity', name: 'Christianity', emoji: '✝️', color: 'from-blue-500 to-purple-500' },
  { id: 'judaism', name: 'Judaism', emoji: '✡️', color: 'from-indigo-500 to-blue-500' },
  { id: 'islam', name: 'Islam', emoji: '☪️', color: 'from-green-500 to-teal-500' },
  { id: 'buddhism', name: 'Buddhism', emoji: '☸️', color: 'from-orange-500 to-red-500' },
  { id: 'hinduism', name: 'Hinduism', emoji: '🕉️', color: 'from-orange-500 to-yellow-500' },
  { id: 'sikh', name: 'Sikhism', emoji: '🪯', color: 'from-yellow-500 to-orange-500' },
  { id: 'other', name: 'Other/Universal', emoji: '🌟', color: 'from-gray-500 to-gray-600' }
];

const FALLBACK_PRAYERS: Record<Religion, string> = {
  christianity: "Heavenly Father, we come before You with grateful hearts, seeking Your presence and guidance. Grant us peace in times of trouble, strength in times of weakness, and wisdom in times of uncertainty. May Your love surround us and Your grace sustain us. In Jesus' name we pray, Amen.",
  judaism: "Baruch Atah Adonai, our God, ruler of the universe. We thank You for Your countless blessings and seek Your guidance in our daily lives. Grant us wisdom to walk in Your ways, compassion to care for others, and strength to face life's challenges. May Your peace be upon us and all who seek You. Amen.",
  islam: "Bismillah-ir-Rahman-ir-Rahim. All praise is due to Allah, the Most Compassionate, the Most Merciful. We seek Your guidance and mercy in all our affairs. Grant us patience, wisdom, and the strength to follow the straight path. May Your blessings be upon us and our loved ones. Ameen.",
  buddhism: "May all beings be free from suffering and the causes of suffering. May we find peace within ourselves and extend that peace to all living creatures. Guide us toward wisdom, compassion, and understanding. May our actions bring benefit to ourselves and others on the path to enlightenment.",
  hinduism: "Om Shanti Shanti Shanti. Divine presence that pervades all existence, we seek Your blessings and guidance. Grant us the wisdom to understand our dharma, the strength to fulfill our duties, and the peace that comes from spiritual understanding. May all beings find happiness and liberation.",
  sikh: "Waheguru, the wonderful teacher and source of all light, we bow before Your divine presence. Guide us to live truthfully, serve others selflessly, and remember Your name with devotion. Grant us the strength to face challenges with courage and the wisdom to walk the path of righteousness.",
  other: "Divine presence, however You are known and wherever You are found, we seek Your blessing and guidance. Grant us peace, wisdom, and compassion. Help us to live with integrity, serve others with love, and find meaning in our journey. May all beings know peace and happiness."
};

export default function SoulSolace() {
  const [state, setState] = useState<AppState>('selection');
  const [selectedReligion, setSelectedReligion] = useState<ReligionOption | null>(null);
  const [prayerRequest, setPrayerRequest] = useState('');
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [error, setError] = useState('');

  const handleReligionSelect = (religion: ReligionOption) => {
    setSelectedReligion(religion);
    setState('input');
    setError('');
  };

  const generatePrayer = async () => {
    if (!selectedReligion || !prayerRequest.trim()) return;

    setState('loading');
    setError('');

    try {
      const response = await fetch('/api/generate-prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          religion: selectedReligion.id,
          request: prayerRequest.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Prayer generation failed');
      }

      const data = await response.json();
      setGeneratedPrayer(data.prayer || FALLBACK_PRAYERS[selectedReligion.id]);
      setState('result');
    } catch (err) {
      // Use fallback prayer if API fails
      setGeneratedPrayer(FALLBACK_PRAYERS[selectedReligion.id]);
      setState('result');
    }
  };

  const copyPrayer = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrayer);
      alert('Prayer copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedPrayer;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Prayer copied to clipboard!');
    }
  };

  const reset = () => {
    setState('selection');
    setSelectedReligion(null);
    setPrayerRequest('');
    setGeneratedPrayer('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Soul Solace
          </h1>
          <p className="text-lg text-gray-300">AI-Powered Prayer Assistant</p>
        </div>

        {/* Religion Selection */}
        {state === 'selection' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-white">Choose Your Spiritual Path</h2>
              <p className="text-gray-400 mb-8">Select your religious tradition to receive authentic, respectful prayers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {RELIGIONS.map((religion) => (
                <button
                  key={religion.id}
                  onClick={() => handleReligionSelect(religion)}
                  className="p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-amber-500 transition-all transform hover:scale-105 text-left group"
                >
                  <div className="text-3xl mb-3">{religion.emoji}</div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {religion.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prayer Input */}
        {state === 'input' && selectedReligion && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <div className="text-3xl mb-2">{selectedReligion.emoji}</div>
              <h2 className="text-2xl font-semibold text-white">{selectedReligion.name}</h2>
              <p className="text-gray-400 mt-2">What would you like to pray about?</p>
            </div>

            <div className="space-y-4">
              <textarea
                value={prayerRequest}
                onChange={(e) => setPrayerRequest(e.target.value)}
                placeholder="Share what's on your heart... (e.g., healing for a loved one, guidance in difficult times, gratitude for blessings)"
                className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500">
                {prayerRequest.length}/500
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setState('selection')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={generatePrayer}
                disabled={!prayerRequest.trim()}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Generate Prayer
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-300">Preparing your prayer...</p>
            <p className="text-sm text-gray-500 mt-2">Drawing from sacred traditions with reverence</p>
          </div>
        )}

        {/* Prayer Result */}
        {state === 'result' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <div className="text-3xl mb-2">{selectedReligion?.emoji}</div>
              <h2 className="text-xl font-semibold text-white">Your Prayer</h2>
            </div>

            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-100 leading-relaxed text-lg font-serif whitespace-pre-line">
                  {generatedPrayer}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={copyPrayer}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy Prayer
              </button>
              <button
                onClick={() => setState('input')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ✏️ New Request
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <Link 
            href="/"
            className="text-amber-400 hover:text-amber-300 transition-colors font-mono text-sm"
          >
            ← Back to DBTech45
          </Link>
          <p className="text-gray-500 text-xs mt-4">
            Prayers are generated with respect for religious traditions. For personal spiritual guidance, consult your religious leader.
          </p>
        </div>
      </main>
    </div>
  );
}