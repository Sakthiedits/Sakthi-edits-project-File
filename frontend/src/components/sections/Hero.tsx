'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Camera,
  Layers,
  Zap,
  Sparkles,
  Cpu,
  ArrowDown,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/utils/whatsapp';

export default function Hero() {
  const [flipped, setFlipped] = useState(false);

  function handleViewMyWorks() {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleBookCall() {
    window.open(
      getWhatsAppUrl("Hi Sakthi, I'd like to book a call for a video editing project."),
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <section
      id="hero"
      className="relative pt-20 sm:pt-28 pb-10 sm:pb-16 flex flex-col items-center overflow-hidden bg-[#06050b]"
    >
      {/* ── Atmospheric Ambient Radial Glows (single on mobile, full on desktop) ── */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[350px] sm:h-[500px] bg-[#7c3aed]/15 rounded-full blur-[40px] sm:blur-[140px]" style={{ willChange: 'auto' }} />
      <div className="pointer-events-none absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#9333ea]/10 rounded-full blur-[90px] hidden sm:block" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#c084fc]/8 rounded-full blur-[100px] hidden sm:block" />

      {/* ── Subtle Dot Grid Overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(192, 132, 252, 0.4) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── FLOATING NEON BADGES (as seen in reference design) ── */}
      {/* Top Left — Cyan Film Reel */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:flex absolute top-36 left-16 xl:left-28 w-14 h-14 rounded-2xl bg-[#0f0b24]/80 border border-[#06b6d4]/40 items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-md z-20"
      >
        <Film className="w-6 h-6 text-[#22d3ee]" />
      </motion.div>

      {/* Mid Left — Magenta AI / Brain */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="hidden lg:flex absolute top-[52%] left-12 xl:left-24 w-14 h-14 rounded-2xl bg-[#0f0b24]/80 border border-[#f43f5e]/40 items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.3)] backdrop-blur-md z-20"
      >
        <Cpu className="w-6 h-6 text-[#fb7185]" />
      </motion.div>

      {/* Bottom Left — Emerald Layers */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="hidden lg:flex absolute bottom-36 left-20 xl:left-32 w-14 h-14 rounded-2xl bg-[#0f0b24]/80 border border-[#10b981]/40 items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)] backdrop-blur-md z-20"
      >
        <Layers className="w-6 h-6 text-[#34d399]" />
      </motion.div>

      {/* Top Right — Cyan Camera */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="hidden lg:flex absolute top-36 right-16 xl:right-28 w-14 h-14 rounded-2xl bg-[#0f0b24]/80 border border-[#06b6d4]/40 items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-md z-20"
      >
        <Camera className="w-6 h-6 text-[#22d3ee]" />
      </motion.div>

      {/* Mid Right — Amber Lightning */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        className="hidden lg:flex absolute top-[48%] right-12 xl:right-24 w-14 h-14 rounded-2xl bg-[#0f0b24]/80 border border-[#f59e0b]/40 items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)] backdrop-blur-md z-20"
      >
        <Zap className="w-6 h-6 text-[#fbbf24]" />
      </motion.div>

      {/* Bottom Right — Purple Sparkles */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="hidden lg:flex absolute bottom-36 right-20 xl:right-32 w-14 h-14 rounded-2xl bg-[#0f0b24]/80 border border-[#c084fc]/40 items-center justify-center shadow-[0_0_25px_rgba(192,132,252,0.3)] backdrop-blur-md z-20"
      >
        <Sparkles className="w-6 h-6 text-[#c084fc]" />
      </motion.div>

      {/* ── Main Hero Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">

        {/* Main Bold Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.08] text-balance mb-4 sm:mb-6"
        >
          Professional <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333ea] via-[#c084fc] to-[#f472b6] drop-shadow-[0_0_35px_rgba(192,132,252,0.45)]">
            Video Editor
          </span>{' '}
          <br className="sm:hidden" />
          <span className="inline-flex items-center gap-2">
            <span className="text-white/60 font-serif italic text-3xl sm:text-5xl lg:text-6xl">&amp;</span>{' '}
            <span>VSL Specialist</span>
          </span>
        </motion.h1>

        {/* Supporting Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-lg md:text-xl text-[#94a3b8] max-w-2xl text-balance leading-relaxed mb-5 sm:mb-8"
        >
          Cinematic edits. High-converting VSLs. Motion-driven storytelling that captures attention and turns viewers into customers.
        </motion.p>

        {/* Dual Call-To-Action Buttons — Compact & Neatly Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-12 z-20 mx-auto"
        >
          {/* Left Button: View My Works (with animated revolving white border light beam) */}
          <button
            type="button"
            onClick={handleViewMyWorks}
            className="relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            {/* Subtle base border track */}
            <span className="absolute inset-0 rounded-full bg-[#27194a]" />

            {/* Rotating White Light Beam traveling around the border */}
            <span
              className="absolute inset-[-250%] animate-border-beam pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(255,255,255,0.2) 305deg, rgba(255,255,255,0.7) 335deg, #ffffff 360deg)',
              }}
            />

            {/* Subtle luminous glow blur layer */}
            <span
              className="absolute inset-[-250%] animate-border-beam pointer-events-none blur-[3px] opacity-70"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(255,255,255,0.2) 305deg, rgba(255,255,255,0.8) 335deg, #ffffff 360deg)',
              }}
            />

            {/* Inner Button Surface */}
            <span className="relative z-10 inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#0b061a] group-hover:bg-[#120a2b] transition-colors font-medium text-xs sm:text-sm tracking-wide text-white whitespace-nowrap">
              View My Works
            </span>
          </button>

          {/* Right Button: Book a Call */}
          <button
            type="button"
            onClick={handleBookCall}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide text-white bg-gradient-to-r from-[#7c3aed] via-[#9333ea] to-[#a855f7] shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer group whitespace-nowrap"
          >
            <span>Book a Call</span>
          </button>
        </motion.div>

        {/* ── SIGNATURE CENTER FEATURED CARD (Matches reference image) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-3xl rounded-3xl border border-[#261852] bg-gradient-to-b from-[#130b2e] via-[#0b071c] to-[#07050e] p-4 sm:p-8 relative shadow-[0_20px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(147,51,234,0.18)] overflow-hidden -mt-2 sm:mt-0"
        >
          {/* Subtle neon glow inside card */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#9333ea]/20 rounded-full blur-[100px]" />

          {/* Glowing Neon "V" Laser Beam Contour */}
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="neonVBeam" x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%"   stopColor="#c084fc" stopOpacity="0.85" />
                <stop offset="60%"  stopColor="#9333ea" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#e879f9" stopOpacity="0.9" />
              </linearGradient>
              <filter id="neonVGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Left curved wing */}
            <path
              d="M 0 0 Q 22 55, 50 96"
              stroke="url(#neonVBeam)"
              strokeWidth="1.2"
              fill="none"
              filter="url(#neonVGlow)"
              className="opacity-75"
            />
            {/* Right curved wing */}
            <path
              d="M 100 0 Q 78 55, 50 96"
              stroke="url(#neonVBeam)"
              strokeWidth="1.2"
              fill="none"
              filter="url(#neonVGlow)"
              className="opacity-75"
            />
          </svg>

          {/* Card Content Area */}
          <div className="relative z-10 flex flex-col items-center justify-center py-4 sm:py-6 w-full">

            {/* Main Balanced Trio: Pr on Left, Photo in Center, Ae on Right */}
            <div className="relative flex items-center justify-center gap-3 sm:gap-6 md:gap-8 w-full">
              {/* Electric lightning branches behind the trio */}
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              >
                <path
                  d="M100 20 L90 80 L120 90 L85 170"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  fill="none"
                  className="animate-pulse"
                />
                <path
                  d="M50 40 L65 75 L55 90 L70 140"
                  stroke="#a855f7"
                  strokeWidth="1"
                  fill="none"
                  className="opacity-60"
                />
                <path
                  d="M150 40 L135 80 L145 95 L130 150"
                  stroke="#a855f7"
                  strokeWidth="1"
                  fill="none"
                  className="opacity-60"
                />
              </svg>

              {/* Left: Premiere Pro Neon Badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ willChange: 'transform' }}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border-2 border-[#9333ea] shadow-[0_0_25px_rgba(147,51,234,0.45)] overflow-hidden group hover:scale-105 transition-all shrink-0 z-10"
              >
                <img
                  src="/premiere-pro.png"
                  alt="Adobe Premiere Pro"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Center: 3D Flip Photo Circle */}
              <div
                className="relative my-2 z-10 shrink-0 cursor-pointer"
                style={{ perspective: '900px' }}
                onClick={() => setFlipped(f => !f)}
                title="Tap to flip!"
              >
                {/* Pulsing glow rings behind the circle */}
                <span className="absolute inset-0 rounded-full animate-ping bg-[#a855f7]/20 pointer-events-none" style={{ animationDuration: '2.5s' }} />
                <span className="absolute -inset-1 rounded-full bg-[#9333ea]/15 blur-md pointer-events-none" />
                <span className="absolute -inset-2.5 rounded-full bg-[#c084fc]/10 blur-lg pointer-events-none" />

                {/* Flip Card */}
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                  className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48"
                >
                  {/* ── FRONT: Photo ── */}
                  <div
                    style={{ backfaceVisibility: 'hidden' }}
                    className="absolute inset-0 rounded-full overflow-hidden shadow-[0_0_55px_rgba(147,51,234,0.7)]"
                  >
                    <img
                      src="/sakthi-hero.jpg"
                      alt="Sakthivel - Creative VSL Editor"
                      className="w-full h-full object-cover object-[center_20%]"
                    />
                    {/* Subtle inner gloss ring */}
                    <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                  </div>

                  {/* ── BACK: Info Card ── */}
                  <div
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1a0a3a] via-[#120728] to-[#0a0518] border-2 border-[#a855f7]/60 shadow-[0_0_55px_rgba(147,51,234,0.7)] flex flex-col items-center justify-center gap-1 p-3"
                  >
                    <span className="text-[10px] sm:text-xs text-[#c084fc] font-mono tracking-widest uppercase opacity-80">VSL Editor</span>
                    <span className="text-sm sm:text-base font-black text-white text-center leading-tight">Sakthivel</span>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#a855f7] to-transparent my-0.5" />
                    <span className="text-[9px] sm:text-[10px] text-[#94a3b8] text-center leading-snug font-medium">High-Converting<br/>Video Ads</span>
                    <span className="mt-1 text-base">🎬</span>
                  </div>
                </motion.div>

                {/* Floating pill badge under the circle */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 sm:px-4 py-1 rounded-full bg-[#0d0722]/95 border border-[#9333ea]/60 shadow-[0_4px_18px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-1.5 z-20 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-white uppercase">Sakthivel</span>
                  <span className="text-[9px] sm:text-[10px] text-[#c084fc] font-medium">| VSL Editor</span>
                </div>
              </div>

              {/* Right: CapCut Badge */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                style={{ willChange: 'transform' }}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border-2 border-[#a855f7] shadow-[0_0_25px_rgba(168,85,247,0.45)] overflow-hidden group hover:scale-105 transition-all shrink-0 z-10"
              >
                <img
                  src="/capcut-icon.webp"
                  alt="CapCut"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Clean bottom V funnel with unobtrusive scroll indicator */}
            <div className="mt-8 flex flex-col items-center gap-1 opacity-70 z-10">
              <span className="text-[10px] tracking-[0.25em] text-[#c084fc] font-mono uppercase">
                Scroll
              </span>
              <ArrowDown size={14} className="text-[#c084fc] animate-bounce" />
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
