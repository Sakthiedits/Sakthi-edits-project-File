'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Play,
  Layers,
  Type,
  Volume2,
  TrendingUp,
  Sparkles,
  Scissors,
} from 'lucide-react';

// Play sound effect using Web Audio API (synthesized cinematic whoosh/riser)
const playAudioFX = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.32);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(3200, now + 0.18);
    filter.frequency.linearRampToValueAtTime(800, now + 0.32);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Graceful fallback
  }
};

const CAPTION_WORDS = [
  { text: 'STOP', color: 'text-white' },
  { text: 'SCROLLING', color: 'text-[#facc15] bg-[#facc15]/20 border border-[#facc15]/40 shadow-[0_0_12px_rgba(250,204,21,0.4)]' },
  { text: 'START', color: 'text-white' },
  { text: 'CONVERTING', color: 'text-[#38bdf8] bg-[#38bdf8]/20 border border-[#38bdf8]/40 shadow-[0_0_12px_rgba(56,189,248,0.4)]' },
];

export default function Services() {
  const [captionIndex, setCaptionIndex] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Cycle caption highlight for the Animated Captions card
  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % CAPTION_WORDS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleTestSound = () => {
    setIsPlayingSound(true);
    playAudioFX();
    setTimeout(() => setIsPlayingSound(false), 500);
  };

  return (
    <section
      id="services"
      className="scroll-mt-20 md:scroll-mt-24 relative py-8 md:py-12 lg:py-14 px-4 sm:px-6 md:px-10 lg:px-14 bg-[#06050b] overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 left-10 w-[450px] h-[350px] bg-[#7c3aed]/10 rounded-full blur-[40px] md:blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-[450px] h-[350px] bg-[#ec4899]/10 rounded-full blur-[40px] md:blur-[160px]" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* ── Compact Section Header (Fits in 1 screen) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6 md:mb-7 flex flex-col md:flex-row md:items-end justify-between gap-3 text-center md:text-left"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a855f7]/40 bg-[#150d33] shadow-[0_0_12px_rgba(168,85,247,0.2)] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc] animate-pulse" />
              <span className="text-white text-[11px] font-bold tracking-wider uppercase">
                My Services
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                What I <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#f472b6] drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">Do</span>
              </h2>
            </div>
          </div>

          <p className="text-[#94a3b8] text-xs sm:text-sm max-w-md text-center md:text-right leading-relaxed">
            High-retention editing, cinematic sound design, kinetic motion graphics, and viral pacing engineered to convert.
          </p>
        </motion.div>

        {/* ── MOBILE VIEW: Clean Scrollable Card List (< md) ── */}
        <div className="md:hidden flex flex-col gap-4 pb-10">

          {/* Card 1: VSL Video Editing */}
          <div className="bg-gradient-to-b from-[#130a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/90 p-4 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_12px_rgba(168,85,247,0.10)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1d0e40] border border-[#4c2299]/70 flex items-center justify-center text-[#c084fc] shrink-0">
                  <Film size={15} />
                </div>
                <h3 className="text-white font-bold text-sm leading-none">VSL Video Editing</h3>
              </div>
              <div className="flex items-center gap-1 bg-[#180d38] border border-[#3b1a78] px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-[#4ade80] shrink-0">
                <TrendingUp size={10} /><span>94% Ret</span>
              </div>
            </div>
            <div className="relative bg-[#080512] border border-[#261345] rounded-lg p-1.5 overflow-hidden select-none">
              <div className="flex items-center justify-between text-[8px] font-mono text-[#64748b] pb-1 mb-1 border-b border-[#1c0d33]">
                <span className="text-[#a855f7] font-bold">TC 00:02:14</span>
                <span className="text-[#4ade80] font-semibold">● 4K RENDERED</span>
              </div>
              <div className="relative flex flex-col gap-1">
                <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#ec4899] via-[#c084fc] to-[#7c3aed] shadow-[0_0_6px_#c084fc] z-20 pointer-events-none animate-playhead">
                  <div className="w-1.5 h-1.5 bg-[#ec4899] rounded-full -ml-[2px] shadow-[0_0_4px_#ec4899]" />
                </div>
                <div className="flex items-center gap-1 h-3.5">
                  <span className="text-[7px] font-mono font-bold text-[#c084fc] w-3 shrink-0">V1</span>
                  <div className="flex-1 bg-[#4c1d95]/70 border border-[#7c3aed]/40 rounded text-[7px] font-mono text-[#e9d5ff] px-1 truncate flex items-center">Hook_Cut.mov</div>
                  <div className="flex-1 bg-[#3730a3]/70 border border-[#4f46e5]/40 rounded text-[7px] font-mono text-[#c7d2fe] px-1 truncate flex items-center">Problem & Pitch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sound Design & SFX */}
          <div className="bg-gradient-to-b from-[#130a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/90 p-4 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_12px_rgba(244,114,182,0.10)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2b0e35] border border-[#7a1c5d]/70 flex items-center justify-center text-[#f472b6] shrink-0">
                  <Volume2 size={15} className={isPlayingSound ? 'animate-bounce' : ''} />
                </div>
                <h3 className="text-white font-bold text-sm leading-none">Sound Design & SFX</h3>
              </div>
              <div className="text-[9px] font-mono font-bold text-[#4ade80] bg-[#180d38] border border-[#3b1a78] px-2 py-0.5 rounded-full shrink-0">-2.4 dB PEAK</div>
            </div>
            <div className="bg-[#090514] border border-[#261345] rounded-lg p-1.5 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-end gap-1 h-6 flex-1 px-1">
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-1" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-2" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#f472b6] rounded-t animate-eq-3" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-4" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#c084fc] rounded-t animate-eq-5" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-2" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#f472b6] rounded-t animate-eq-1" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-4" />
              </div>
              <button type="button" onClick={handleTestSound} className="py-1 px-2.5 bg-gradient-to-r from-[#7c3aed]/30 to-[#ec4899]/30 border border-[#f472b6]/40 rounded-md text-[10px] font-bold text-white flex items-center gap-1 active:scale-95 shrink-0">
                <Sparkles size={10} className="text-[#f472b6]" />
                {isPlayingSound ? 'Playing...' : 'Test SFX'}
              </button>
            </div>
          </div>

          {/* Card 3: Motion Graphics */}
          <div className="bg-gradient-to-b from-[#130a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/90 p-4 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_12px_rgba(168,85,247,0.10)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#220e45] border border-[#58219e]/70 flex items-center justify-center text-[#c084fc] shrink-0">
                  <Layers size={15} />
                </div>
                <h3 className="text-white font-bold text-sm leading-none">Motion Graphics</h3>
              </div>
              <div className="text-[9px] font-mono font-bold text-[#c084fc] bg-[#180d38] border border-[#3b1a78] px-2 py-0.5 rounded-full shrink-0">60 FPS</div>
            </div>
            <div className="bg-[#090514] border border-[#261345] rounded-lg p-1.5 flex items-center justify-between h-[46px] shadow-inner relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 200 40">
                <path d="M 10 30 C 60 30, 70 8, 190 8" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="70" cy="18" r="2.5" fill="#c084fc" className="animate-pulse" />
              </svg>
              <div className="relative w-8 h-8 [perspective:400px]">
                <div className="w-full h-full border-2 border-[#c084fc] bg-[#7c3aed]/20 rounded-md shadow-[0_0_10px_rgba(192,132,252,0.5)] animate-iso-spin [transform-style:preserve-3d] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 border border-[#e879f9] rounded bg-[#a855f7]/40" />
                </div>
              </div>
              <div className="text-right z-10">
                <span className="text-[9px] font-mono font-bold text-[#c084fc] block">Cubic Easing</span>
                <span className="text-[8px] font-mono text-[#94a3b8]">60 FPS Spline</span>
              </div>
            </div>
          </div>

          {/* Card 4: Animated Captions */}
          <div className="bg-gradient-to-b from-[#130a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/90 p-4 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.10)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#281a0e] border border-[#7a4c17]/70 flex items-center justify-center text-[#facc15] shrink-0">
                  <Type size={15} />
                </div>
                <h3 className="text-white font-bold text-sm leading-none">Animated Captions</h3>
              </div>
              <div className="text-[9px] font-mono font-bold text-[#facc15] bg-[#180d38] border border-[#3b1a78] px-2 py-0.5 rounded-full shrink-0">⚡ Hormozi</div>
            </div>
            <div className="bg-[#090514] border border-[#2e2040] rounded-lg p-1.5 flex items-center justify-center gap-1.5 h-[46px] shadow-inner select-none">
              {CAPTION_WORDS.map((item, idx) => {
                const isActive = idx === captionIndex;
                return (
                  <span key={item.text} className={`text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded transition-all duration-200 ${isActive ? `${item.color} scale-105` : 'text-[#64748b] bg-white/5 scale-95'}`}>
                    {item.text}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Card 5: Video Ads & Pacing */}
          <div className="bg-gradient-to-b from-[#130a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/90 p-4 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_12px_rgba(74,222,128,0.10)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0f281a] border border-[#1b6339]/70 flex items-center justify-center text-[#4ade80] shrink-0">
                  <Play size={15} />
                </div>
                <h3 className="text-white font-bold text-sm leading-none">Video Ads & Pacing</h3>
              </div>
              <div className="text-[9px] font-mono font-bold text-[#4ade80] bg-[#180d38] border border-[#3b1a78] px-2 py-0.5 rounded-full shrink-0">+38% vs Avg</div>
            </div>
            <div className="bg-[#090514] border border-[#1d3527] rounded-lg p-1.5 flex flex-col justify-between h-[46px] shadow-inner">
              <div className="flex items-center justify-between text-[8px] font-mono">
                <span className="text-[#94a3b8]">3-SEC HOOK RATE</span>
                <span className="text-white font-bold">86.4% Retention</span>
              </div>
              <div className="w-full bg-[#1b2b22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-full w-[86%] rounded-full shadow-[0_0_6px_#4ade80]" />
              </div>
              <div className="flex items-center justify-between text-[8px] font-mono text-[#c084fc]">
                <span className="flex items-center gap-0.5"><Scissors size={9} /> Frame-Accurate Cuts</span>
                <span className="text-[#4ade80] font-bold">3.8x ROAS</span>
              </div>
            </div>
          </div>

        </div>


        {/* ── DESKTOP VIEW: Single-Screen Balanced 2x3 Grid (>= md) ── */}
        {/* Exactly 2 rows of 3 columns, perfectly aligned on 1 screen without scrolling */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">

          {/* ══════════════════════════════════════════════
              CARD 1: VSL Video Editing (Featured 2-Column Flagship)
              ══════════════════════════════════════════════ */}
          <div className="relative group md:col-span-2 lg:col-span-2 bg-gradient-to-b from-[#120a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/80 hover:border-[#a855f7]/70 rounded-2xl p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(168,85,247,0.22)] transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Row: Icon + Title + Stat Badge */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#1d0e40] border border-[#4c2299]/70 flex items-center justify-center text-[#c084fc] shadow-[0_0_12px_rgba(168,85,247,0.25)] shrink-0">
                    <Film size={18} />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg">
                    VSL Video Editing
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-[#180d38] border border-[#3b1a78] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#4ade80] shrink-0">
                  <TrendingUp size={11} />
                  <span>94% Ret</span>
                </div>
              </div>

              <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 mb-3">
                Structuring Video Sales Letters with psychological narrative pacing, multi-track visual overlays, and clear call-to-actions.
              </p>
            </div>

            {/* Visual: Mini NLE Multi-Track Timeline with Continuous Playhead */}
            <div className="relative bg-[#080512] border border-[#261345] rounded-xl p-2.5 overflow-hidden select-none">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#64748b] pb-1.5 mb-1.5 border-b border-[#1c0d33]">
                <span className="text-[#a855f7] font-bold">TC 00:02:14</span>
                <span className="text-[#4ade80] font-semibold">● 4K RENDERED</span>
              </div>

              <div className="relative flex flex-col gap-1.5">
                {/* Moving Playhead Laser */}
                <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#ec4899] via-[#c084fc] to-[#7c3aed] shadow-[0_0_10px_#c084fc] z-20 pointer-events-none animate-playhead">
                  <div className="w-2 h-2 bg-[#ec4899] rounded-full -ml-[3px] -mt-0.5 shadow-[0_0_6px_#ec4899]" />
                </div>

                {/* V2 Track */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-bold text-[#c084fc] w-4 shrink-0">V2</span>
                  <div className="flex-1 flex gap-1 h-4">
                    <div className="flex-1 bg-[#4c1d95]/70 border border-[#7c3aed]/40 rounded text-[8px] font-mono text-[#e9d5ff] flex items-center px-1.5 truncate">
                      Hook_Visual.mov
                    </div>
                    <div className="w-16 bg-[#581c87]/70 border border-[#a855f7]/40 rounded text-[8px] font-mono text-[#f3e8ff] flex items-center px-1.5 truncate">
                      3D Mockup
                    </div>
                  </div>
                </div>

                {/* V1 Track */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-bold text-[#818cf8] w-4 shrink-0">V1</span>
                  <div className="flex-1 flex gap-1 h-4">
                    <div className="w-2/5 bg-[#312e81]/70 border border-[#6366f1]/40 rounded text-[8px] font-mono text-[#c7d2fe] flex items-center px-1.5 truncate">
                      A-Roll Cut
                    </div>
                    <div className="flex-1 bg-[#3730a3]/70 border border-[#4f46e5]/40 rounded text-[8px] font-mono text-[#c7d2fe] flex items-center px-1.5 truncate">
                      Problem & Pitch
                    </div>
                  </div>
                </div>

                {/* A1 Track */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-bold text-[#38bdf8] w-4 shrink-0">A1</span>
                  <div className="flex-1 bg-[#0e3b5e]/70 border border-[#0284c7]/40 rounded h-4 px-1.5 flex items-center justify-between">
                    <span className="text-[8px] font-mono text-[#bae6fd]">VO_Master_Clean.wav</span>
                    <div className="flex items-center gap-0.5 h-2">
                      <div className="w-0.5 h-full bg-[#38bdf8] rounded-full" />
                      <div className="w-0.5 h-1.5 bg-[#38bdf8] rounded-full" />
                      <div className="w-0.5 h-full bg-[#38bdf8] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════
              CARD 2: High-Converting Video Ads & Pacing
              ══════════════════════════════════════════════ */}
          <div className="relative group bg-gradient-to-b from-[#120a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/80 hover:border-[#4ade80]/70 rounded-2xl p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(74,222,128,0.22)] transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#0f281a] border border-[#1b6339]/70 flex items-center justify-center text-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.25)] shrink-0">
                    <Play size={18} />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg">
                    Video Ads & Pacing
                  </h3>
                </div>

                <div className="text-[10px] font-mono font-bold text-[#4ade80] bg-[#180d38] border border-[#3b1a78] px-2.5 py-0.5 rounded-full shrink-0">
                  +38% vs Avg
                </div>
              </div>

              <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 mb-3">
                Short-form & paid ads crafted with scroll-stopping 3-second hooks, dynamic speed-ramps, and frame-accurate pacing.
              </p>
            </div>

            {/* Visual: Hook Rate Progress + Speed Ramp Tag */}
            <div className="bg-[#090514] border border-[#1d3527] rounded-xl p-2.5 flex flex-col justify-between h-[68px] shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-[#94a3b8]">3-SEC HOOK RATE</span>
                <span className="text-white font-bold">86.4% Retention</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1b2b22] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#4ade80] to-[#22c55e] h-full w-[86%] rounded-full shadow-[0_0_8px_#4ade80]" />
              </div>

              {/* Transition pacing badge */}
              <div className="flex items-center justify-between text-[8px] font-mono text-[#c084fc]">
                <span className="flex items-center gap-1">
                  <Scissors size={10} /> Frame-Accurate Cuts
                </span>
                <span className="text-[#4ade80] font-bold">3.8x ROAS</span>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════
              CARD 3: Sound Design & Audio FX
              ══════════════════════════════════════════════ */}
          <div className="relative group bg-gradient-to-b from-[#120a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/80 hover:border-[#f472b6]/70 rounded-2xl p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(244,114,182,0.22)] transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#2b0e35] border border-[#7a1c5d]/70 flex items-center justify-center text-[#f472b6] shadow-[0_0_12px_rgba(236,72,153,0.25)] shrink-0">
                    <Volume2 size={18} className={isPlayingSound ? 'animate-bounce' : ''} />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg">
                    Sound Design & SFX
                  </h3>
                </div>

                <div className="text-[10px] font-mono font-bold text-[#4ade80] bg-[#180d38] border border-[#3b1a78] px-2.5 py-0.5 rounded-full shrink-0">
                  -2.4 dB PEAK
                </div>
              </div>

              <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 mb-3">
                Surgically placed whooshes, impacts, cinematic risers, and atmospheric audio layering for maximum emotional punch.
              </p>
            </div>

            {/* Visual: 12-Band Equalizer + Test SFX Button */}
            <div className="bg-[#090514] border border-[#261345] rounded-xl p-2.5 flex flex-col justify-between gap-2 shadow-inner">
              {/* 12-Band Bouncing Bars */}
              <div className="flex items-end justify-between gap-1 h-8 px-1">
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-1 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-2 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#f472b6] rounded-t animate-eq-3 shadow-[0_0_6px_rgba(244,114,182,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-4 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#c084fc] rounded-t animate-eq-5 shadow-[0_0_6px_rgba(192,132,252,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-2 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#f472b6] rounded-t animate-eq-1 shadow-[0_0_6px_rgba(244,114,182,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-4 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#c084fc] rounded-t animate-eq-3 shadow-[0_0_6px_rgba(192,132,252,0.3)]" />
                <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#ec4899] rounded-t animate-eq-5 shadow-[0_0_6px_rgba(236,72,153,0.3)]" />
              </div>

              {/* Click to test SFX */}
              <button
                type="button"
                onClick={handleTestSound}
                className="w-full py-1.5 px-2 bg-gradient-to-r from-[#7c3aed]/25 to-[#ec4899]/25 hover:from-[#7c3aed]/45 hover:to-[#ec4899]/45 border border-[#f472b6]/40 hover:border-[#f472b6] rounded-lg text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-[0_0_10px_rgba(244,114,182,0.15)] active:scale-95"
              >
                <Sparkles size={12} className="text-[#f472b6]" />
                {isPlayingSound ? 'Playing Whoosh...' : 'Click To Test SFX'}
              </button>
            </div>
          </div>


          {/* ══════════════════════════════════════════════
              CARD 3: Motion Graphics & 3D
              ══════════════════════════════════════════════ */}
          <div className="relative group bg-gradient-to-b from-[#120a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/80 hover:border-[#a855f7]/70 rounded-2xl p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(168,85,247,0.22)] transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#220e45] border border-[#58219e]/70 flex items-center justify-center text-[#c084fc] shadow-[0_0_12px_rgba(168,85,247,0.25)] shrink-0">
                    <Layers size={18} />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg">
                    Motion Graphics
                  </h3>
                </div>

                <div className="text-[10px] font-mono font-bold text-[#c084fc] bg-[#180d38] border border-[#3b1a78] px-2.5 py-0.5 rounded-full shrink-0">
                  60 FPS
                </div>
              </div>

              <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 mb-3">
                Custom visual elements, kinetic graphics, lower-thirds, callouts, and 3D kinetic assets that elevate production value.
              </p>
            </div>

            {/* Visual: 3D Rotating Isometric Neon Geometry + Spline Curve */}
            <div className="bg-[#090514] border border-[#261345] rounded-xl p-2.5 flex items-center justify-between h-[68px] shadow-inner relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 200 60">
                <path d="M 10 50 C 60 50, 70 10, 190 10" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="70" cy="28" r="3" fill="#c084fc" className="animate-pulse" />
              </svg>

              <div className="relative w-11 h-11 [perspective:400px]">
                <div className="w-full h-full border-2 border-[#c084fc] bg-[#7c3aed]/20 rounded-lg shadow-[0_0_15px_rgba(192,132,252,0.5)] animate-iso-spin [transform-style:preserve-3d] flex items-center justify-center">
                  <div className="w-5 h-5 border border-[#e879f9] rounded bg-[#a855f7]/40" />
                </div>
              </div>

              <div className="text-right z-10">
                <span className="text-[10px] font-mono font-bold text-[#c084fc] block">Cubic Easing</span>
                <span className="text-[9px] font-mono text-[#94a3b8]">Smooth Spline</span>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════
              CARD 4: Animated Captions & Text
              ══════════════════════════════════════════════ */}
          <div className="relative group bg-gradient-to-b from-[#120a28] via-[#0b061a] to-[#070414] border border-[#2d1b5a]/80 hover:border-[#facc15]/70 rounded-2xl p-4 lg:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(250,204,21,0.22)] transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Top Row */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#281a0e] border border-[#7a4c17]/70 flex items-center justify-center text-[#facc15] shadow-[0_0_12px_rgba(250,204,21,0.25)] shrink-0">
                    <Type size={18} />
                  </div>
                  <h3 className="text-white font-bold text-base lg:text-lg">
                    Animated Captions
                  </h3>
                </div>

                <div className="text-[10px] font-mono font-bold text-[#facc15] bg-[#180d38] border border-[#3b1a78] px-2.5 py-0.5 rounded-full shrink-0">
                  ⚡ Hormozi
                </div>
              </div>

              <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 mb-3">
                Dynamic, word-by-word animated subtitles with custom glowing highlights, emoji accents, and bounce physics that stop the scroll.
              </p>
            </div>

            {/* Visual: Live Subtitle Word-by-Word Highlight Simulation */}
            <div className="bg-[#090514] border border-[#2e2040] rounded-xl p-2.5 flex items-center justify-center gap-1.5 h-[68px] shadow-inner select-none">
              {CAPTION_WORDS.map((item, idx) => {
                const isActive = idx === captionIndex;
                return (
                  <span
                    key={item.text}
                    className={`text-[11px] font-black tracking-wide uppercase px-2 py-1 rounded transition-all duration-200 ${
                      isActive
                        ? `${item.color} scale-110`
                        : 'text-[#64748b] bg-white/5 scale-95'
                    }`}
                  >
                    {item.text}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
