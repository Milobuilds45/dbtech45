'use client';

import { useState, useEffect, useCallback } from 'react';

const MUSIC_STYLES = [
  { id: 'rock', name: 'Rock', emoji: '🎸', bg: 'bg-red-600' },
  { id: 'jazz', name: 'Jazz', emoji: '🎷', bg: 'bg-purple-600' },
  { id: 'blues', name: 'Blues', emoji: '🎺', bg: 'bg-blue-700' },
  { id: 'electronic', name: 'Electronic', emoji: '🎧', bg: 'bg-cyan-600' },
  { id: 'hiphop', name: 'Hip-Hop', emoji: '🎤', bg: 'bg-pink-600' },
  { id: 'metal', name: 'Metal', emoji: '🤘', bg: 'bg-neutral-800' },
  { id: 'funk', name: 'Funk', emoji: '🕺', bg: 'bg-orange-600' },
  { id: 'reggae', name: 'Reggae', emoji: '🌴', bg: 'bg-green-600' },
];

const INSTRUMENTS = [
  { id: 'electric-guitar', name: 'Electric Guitar', emoji: '🎸', freq: 329.63, wave: 'sawtooth' as OscillatorType },
  { id: 'acoustic-guitar', name: 'Acoustic', emoji: '🪕', freq: 293.66, wave: 'triangle' as OscillatorType },
  { id: 'bass', name: 'Bass', emoji: '🎸', freq: 98.00, wave: 'sine' as OscillatorType },
  { id: 'drums', name: 'Drums', emoji: '🥁', freq: 150, wave: 'square' as OscillatorType, noise: true },
  { id: 'keys', name: 'Piano', emoji: '🎹', freq: 523.25, wave: 'sine' as OscillatorType },
  { id: 'synth', name: 'Synth', emoji: '🎛️', freq: 440, wave: 'sawtooth' as OscillatorType },
  { id: 'violin', name: 'Violin', emoji: '🎻', freq: 659.25, wave: 'sawtooth' as OscillatorType },
  { id: 'trumpet', name: 'Trumpet', emoji: '🎺', freq: 466.16, wave: 'square' as OscillatorType },
  { id: 'saxophone', name: 'Sax', emoji: '🎷', freq: 415.30, wave: 'sawtooth' as OscillatorType },
  { id: 'dj', name: 'DJ', emoji: '💿', freq: 200, wave: 'sawtooth' as OscillatorType },
];

interface ConnectedAgent {
  id: string;
  name: string;
  instrument: string;
  style: string;
  gateway?: string;
  sessionKey?: string;
  status: 'online' | 'playing' | 'offline';
  lastSeen: number;
  contribution?: string;
}

interface JamSession {
  id: string;
  name: string;
  style: string;
  host: string;
  players: ConnectedAgent[];
  status: 'waiting' | 'jamming' | 'ended';
  createdAt: number;
}

// Audio
let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playNote(instrument: typeof INSTRUMENTS[0], noteOffset: number = 0, duration: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const freq = instrument.freq * Math.pow(2, noteOffset / 12);
    
    if (instrument.noise) {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = freq * 3;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + duration);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = instrument.wave;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }
  } catch (e) {
    console.log('Audio not supported');
  }
}

export default function BandBotPage() {
  const [mode, setMode] = useState<'menu' | 'solo' | 'join' | 'host' | 'jam' | 'agents'>('menu');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [connectedAgents, setConnectedAgents] = useState<ConnectedAgent[]>([]);
  const [currentJam, setCurrentJam] = useState<JamSession | null>(null);
  const [jamCode, setJamCode] = useState('');
  const [myAgentId] = useState(() => Math.random().toString(36).substring(2, 8));

  // Load saved agent info
  useEffect(() => {
    const saved = localStorage.getItem('bandbot-agent');
    if (saved) {
      const data = JSON.parse(saved);
      setAgentName(data.name || '');
      setGatewayUrl(data.gateway || '');
    }
  }, []);

  // Generate jam code
  const generateJamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create a jam session
  const createJam = () => {
    if (!selectedStyle || !selectedInstrument || !agentName) return;
    
    const code = generateJamCode();
    const inst = INSTRUMENTS.find(i => i.id === selectedInstrument)!;
    const style = MUSIC_STYLES.find(s => s.id === selectedStyle)!;
    
    const hostAgent: ConnectedAgent = {
      id: myAgentId,
      name: agentName,
      instrument: inst.name,
      style: selectedStyle,
      gateway: gatewayUrl || undefined,
      status: 'online',
      lastSeen: Date.now(),
    };
    
    const jam: JamSession = {
      id: code,
      name: `${style.name} Jam`,
      style: selectedStyle,
      host: myAgentId,
      players: [hostAgent],
      status: 'waiting',
      createdAt: Date.now(),
    };
    
    setCurrentJam(jam);
    setJamCode(code);
    setMode('jam');
    
    // Save to localStorage for persistence
    localStorage.setItem(`bandbot-jam-${code}`, JSON.stringify(jam));
    localStorage.setItem('bandbot-agent', JSON.stringify({ name: agentName, gateway: gatewayUrl }));
  };

  // Join a jam session
  const joinJam = () => {
    if (!jamCode || !selectedInstrument || !agentName) return;
    
    const inst = INSTRUMENTS.find(i => i.id === selectedInstrument)!;
    
    // Try to load existing jam
    const savedJam = localStorage.getItem(`bandbot-jam-${jamCode.toUpperCase()}`);
    if (savedJam) {
      const jam: JamSession = JSON.parse(savedJam);
      
      const myAgent: ConnectedAgent = {
        id: myAgentId,
        name: agentName,
        instrument: inst.name,
        style: jam.style,
        gateway: gatewayUrl || undefined,
        status: 'online',
        lastSeen: Date.now(),
      };
      
      jam.players.push(myAgent);
      setCurrentJam(jam);
      setSelectedStyle(jam.style);
      setMode('jam');
      
      localStorage.setItem(`bandbot-jam-${jamCode.toUpperCase()}`, JSON.stringify(jam));
      localStorage.setItem('bandbot-agent', JSON.stringify({ name: agentName, gateway: gatewayUrl }));
    } else {
      alert('Jam not found! Check the code.');
    }
  };

  // Play contribution
  const playContribution = useCallback(() => {
    if (!selectedInstrument) return;
    const inst = INSTRUMENTS.find(i => i.id === selectedInstrument);
    if (!inst) return;
    
    // Play a random riff
    const notes = [0, 4, 7, 12, 7, 4, 0, -5];
    notes.forEach((note, i) => {
      setTimeout(() => playNote(inst, note, 0.2), i * 150);
    });
    
    // Update contribution
    if (currentJam) {
      const contributions = [
        'Laying down a groove 🎵',
        'Adding some flavor 🔥',
        'Bringing the heat 🌶️',
        'Keeping it tight 💪',
        'Going off 🚀',
        'Vibing hard ✨',
      ];
      const newJam = { ...currentJam };
      const me = newJam.players.find(p => p.id === myAgentId);
      if (me) {
        me.status = 'playing';
        me.contribution = contributions[Math.floor(Math.random() * contributions.length)];
        setCurrentJam(newJam);
      }
    }
  }, [selectedInstrument, currentJam, myAgentId]);

  const resetAll = () => {
    setMode('menu');
    setSelectedStyle(null);
    setSelectedInstrument(null);
    setCurrentJam(null);
    setJamCode('');
  };

  const selectedStyleData = MUSIC_STYLES.find(s => s.id === selectedStyle);
  const selectedInstrumentData = INSTRUMENTS.find(i => i.id === selectedInstrument);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="text-center py-6 border-b border-neutral-800">
        <h1 
          className="text-4xl font-black tracking-tight cursor-pointer hover:opacity-80"
          onClick={resetAll}
        >
          🎸 BAND BOT
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Connect your agent. Jam together.
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        
        {/* Main Menu */}
        {mode === 'menu' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-center mb-6 text-neutral-300">
              What do you want to do?
            </h2>
            
            <button
              onClick={() => setMode('host')}
              className="w-full p-4 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-green-500 hover:bg-neutral-800 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <div className="font-bold">Host a Jam</div>
                  <div className="text-sm text-neutral-400">Create a session for other agents to join</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full p-4 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-blue-500 hover:bg-neutral-800 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎸</span>
                <div>
                  <div className="font-bold">Join a Jam</div>
                  <div className="text-sm text-neutral-400">Enter a code to join an existing session</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setMode('solo')}
              className="w-full p-4 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-purple-500 hover:bg-neutral-800 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎹</span>
                <div>
                  <div className="font-bold">Solo Practice</div>
                  <div className="text-sm text-neutral-400">Jam by yourself</div>
                </div>
              </div>
            </button>

            <div className="pt-4 border-t border-neutral-800 mt-6">
              <p className="text-xs text-neutral-600 text-center mb-3">
                🤖 For OpenClaw agents: Use the API to connect programmatically
              </p>
              <div className="bg-neutral-900 rounded-lg p-3 font-mono text-xs text-neutral-400">
                <div className="text-green-400 mb-1"># Register your agent</div>
                <div>POST /api/band-bot/register</div>
                <div className="text-neutral-600 mt-2">{`{ name, instrument, style, gateway, sessionKey }`}</div>
              </div>
            </div>
          </div>
        )}

        {/* Host Setup */}
        {mode === 'host' && !currentJam && (
          <div className="space-y-6">
            <button onClick={resetAll} className="text-neutral-500 hover:text-white text-sm">
              ← Back
            </button>
            
            <h2 className="text-xl font-bold text-center">Host a Jam Session</h2>
            
            {/* Agent Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Your Name / Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Milo, Anders, or your name"
                  className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-white focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Gateway URL (optional)</label>
                <input
                  type="text"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  placeholder="e.g. https://your-gateway.ts.net"
                  className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-white focus:outline-none text-sm"
                />
                <p className="text-xs text-neutral-600 mt-1">For OpenClaw agents to receive callbacks</p>
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Pick a Style</label>
              <div className="grid grid-cols-4 gap-2">
                {MUSIC_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedStyle === style.id 
                        ? `${style.bg} ring-2 ring-white` 
                        : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                  >
                    <div className="text-xl">{style.emoji}</div>
                    <div className="text-xs mt-1">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Your Instrument</label>
              <div className="grid grid-cols-5 gap-2">
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstrument(inst.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedInstrument === inst.id 
                        ? 'bg-white text-black' 
                        : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                  >
                    <div className="text-xl">{inst.emoji}</div>
                    <div className="text-[10px] mt-1">{inst.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={createJam}
              disabled={!agentName || !selectedStyle || !selectedInstrument}
              className="w-full py-4 rounded-lg bg-green-600 font-bold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎤 Create Jam Session
            </button>
          </div>
        )}

        {/* Join Setup */}
        {mode === 'join' && !currentJam && (
          <div className="space-y-6">
            <button onClick={resetAll} className="text-neutral-500 hover:text-white text-sm">
              ← Back
            </button>
            
            <h2 className="text-xl font-bold text-center">Join a Jam</h2>
            
            {/* Jam Code */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Jam Code</label>
              <input
                type="text"
                value={jamCode}
                onChange={(e) => setJamCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="w-full p-4 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-white focus:outline-none text-center text-2xl font-mono tracking-widest"
              />
            </div>

            {/* Agent Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Your Name / Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Milo, Bobby, or your name"
                  className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-white focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Gateway URL (optional)</label>
                <input
                  type="text"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  placeholder="e.g. https://your-gateway.ts.net"
                  className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-white focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Instrument */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Your Instrument</label>
              <div className="grid grid-cols-5 gap-2">
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstrument(inst.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedInstrument === inst.id 
                        ? 'bg-white text-black' 
                        : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                  >
                    <div className="text-xl">{inst.emoji}</div>
                    <div className="text-[10px] mt-1">{inst.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={joinJam}
              disabled={!jamCode || !agentName || !selectedInstrument}
              className="w-full py-4 rounded-lg bg-blue-600 font-bold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎸 Join Jam
            </button>
          </div>
        )}

        {/* Active Jam Session */}
        {mode === 'jam' && currentJam && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block px-4 py-2 rounded-lg bg-neutral-800 font-mono text-2xl tracking-widest mb-2">
                {currentJam.id}
              </div>
              <h2 className="text-2xl font-bold">{currentJam.name}</h2>
              <p className="text-neutral-500">
                {selectedStyleData?.emoji} Share this code to invite others
              </p>
            </div>

            {/* Players */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-400">Players ({currentJam.players.length})</h3>
              {currentJam.players.map((player) => {
                const inst = INSTRUMENTS.find(i => i.name === player.instrument);
                return (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-lg border flex items-center gap-3 ${
                      player.id === myAgentId 
                        ? 'bg-neutral-800 border-green-600' 
                        : 'bg-neutral-900 border-neutral-800'
                    }`}
                  >
                    <div className="text-2xl">{inst?.emoji || '🎵'}</div>
                    <div className="flex-1">
                      <div className="font-bold">
                        {player.name}
                        {player.id === myAgentId && <span className="ml-2 text-xs text-green-400">YOU</span>}
                        {player.gateway && <span className="ml-2 text-xs text-blue-400">🤖 AGENT</span>}
                      </div>
                      <div className="text-sm text-neutral-400">{player.instrument}</div>
                      {player.contribution && (
                        <div className="text-sm text-yellow-400 mt-1">{player.contribution}</div>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      player.status === 'playing' ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'
                    }`} />
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={playContribution}
                className="flex-1 py-4 rounded-lg bg-green-600 font-bold hover:bg-green-500 transition-all active:scale-95"
              >
                🎵 Play!
              </button>
              <button
                onClick={resetAll}
                className="px-6 py-4 rounded-lg bg-neutral-800 border border-neutral-700 font-bold hover:bg-neutral-700 transition-all"
              >
                Leave
              </button>
            </div>

            {/* API Info */}
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-400 mb-2">🤖 Connect via API</h4>
              <div className="font-mono text-xs text-neutral-500 space-y-1">
                <div><span className="text-green-400">POST</span> /api/band-bot/join</div>
                <div className="text-neutral-600">{`{ code: "${currentJam.id}", name, instrument, gateway }`}</div>
                <div className="mt-2"><span className="text-blue-400">POST</span> /api/band-bot/play</div>
                <div className="text-neutral-600">{`{ code: "${currentJam.id}", agentId, action: "riff" }`}</div>
              </div>
            </div>
          </div>
        )}

        {/* Solo Mode */}
        {mode === 'solo' && (
          <div className="space-y-6">
            <button onClick={resetAll} className="text-neutral-500 hover:text-white text-sm">
              ← Back
            </button>
            
            <h2 className="text-xl font-bold text-center">Solo Practice</h2>
            
            {!selectedInstrument ? (
              <div className="grid grid-cols-5 gap-2">
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstrument(inst.id)}
                    className="p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-all"
                  >
                    <div className="text-2xl">{inst.emoji}</div>
                    <div className="text-xs mt-1">{inst.name}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="text-6xl">{selectedInstrumentData?.emoji}</div>
                <h3 className="text-xl font-bold">{selectedInstrumentData?.name}</h3>
                
                <div className="grid grid-cols-4 gap-2">
                  {[0, 2, 4, 5, 7, 9, 11, 12].map((note) => (
                    <button
                      key={note}
                      onClick={() => selectedInstrumentData && playNote(selectedInstrumentData, note, 0.3)}
                      className="p-4 rounded-lg bg-neutral-800 hover:bg-white hover:text-black transition-all active:scale-95 font-mono"
                    >
                      {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'][note === 12 ? 7 : [0, 2, 4, 5, 7, 9, 11].indexOf(note)]}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setSelectedInstrument(null)}
                  className="text-neutral-500 hover:text-white text-sm"
                >
                  Change instrument
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-neutral-700 text-xs border-t border-neutral-800">
        Band Bot • Let AI agents jam together
      </footer>
    </main>
  );
}
