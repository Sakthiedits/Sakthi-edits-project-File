'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { WHATSAPP_URL } from '@/utils/whatsapp';

const NAV_LINKS = [
  { label: 'Home',     href: '#hero'     },
  { label: 'About',    href: '#about'    },
  { label: 'My Works', href: '#work'     },
  { label: 'Services', href: '#services' },
  { label: 'Contact',  href: '#contact'  },
];

const SECTION_IDS = ['hero', 'about', 'work', 'services', 'contact'];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const activeSection = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMenuOpen(false);
      const id = href.replace('#', '');
      requestAnimationFrame(() => {
        if (id === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    [],
  );

  return (
    <>
      {/* ── Header Bar ── */}
      <header
        className={[
          'fixed z-[70] transition-all duration-300',
          // Mobile: edge-to-edge top bar with no bottom border
          'top-0 left-0 right-0 w-full border-none',
          scrolled
            ? 'bg-[#06050b]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent',
          // Desktop: floating luxury glass capsule
          'md:top-5 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[92%] md:max-w-5xl md:rounded-full',
          scrolled
            ? 'md:bg-[#080514]/90 md:backdrop-blur-2xl md:border md:border-[#3d247d]/80 md:shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(168,85,247,0.18)]'
            : 'md:bg-[#0a0718]/75 md:backdrop-blur-xl md:border md:border-[#2d1b5e]/60 md:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(147,51,234,0.1)]',
        ].join(' ')}
      >
        <nav className="relative w-full px-5 md:px-6 flex items-center justify-between h-16 md:h-14">

          {/* Brand */}
          <a
            href="#"
            onClick={(e) => scrollToSection(e, '#hero')}
            className="flex items-center select-none group"
            aria-label="Sakthiedits – back to top"
          >
            <span className="font-black tracking-tight text-lg sm:text-xl text-white group-hover:scale-[1.02] transition-transform">
              SAKTHI<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#e879f9]">EDITS</span>
            </span>
          </a>

          {/* Desktop links — Center Aligned Floating Pill */}
          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-1 bg-[#120a28]/60 border border-[#2b1854]/60 rounded-full p-1 backdrop-blur-md shadow-inner">
              {NAV_LINKS.map(({ label, href }) => {
                const id = href.replace('#', '');
                const isActive = activeSection === id;
                return (
                  <li key={id}>
                    <a
                      href={href}
                      onClick={(e) => scrollToSection(e, href)}
                      className={[
                        'px-4 py-1.5 rounded-full text-xs transition-all duration-200 block select-none tracking-wide',
                        isActive
                          ? 'text-white bg-gradient-to-r from-[#7c3aed]/40 to-[#a855f7]/30 border border-[#a855f7]/40 shadow-[0_0_12px_rgba(168,85,247,0.35)] font-bold'
                          : 'text-[#94a3b8] hover:text-white hover:bg-white/5 font-medium',
                      ].join(' ')}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Desktop Right CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full shadow-[0_0_20px_rgba(147,51,234,0.45)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Book Call
            </a>
          </div>

          {/* Mobile hamburger — circular toggle matching reference */}
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-full border border-[#a855f7]/50 bg-[#160c33] text-white hover:border-[#c084fc] hover:bg-[#201048] active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={22} className="text-white transition-transform duration-150" />
            ) : (
              <Menu size={22} className="text-[#c084fc] transition-transform duration-150" />
            )}
          </button>
        </nav>
      </header>

      {/* ── Mobile Floating Glass Menu + Backdrop (Matches reference UI) ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop — sits at z-[60] behind header z-[70] */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="md:hidden fixed inset-0 z-[60] bg-black/80 will-change-opacity"
              onClick={() => setMenuOpen(false)}
            />

            {/* Floating rounded glass card — sits at z-[65] */}
            <motion.div
              key="menu-card"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="md:hidden fixed top-20 left-4 right-4 max-w-sm mx-auto z-[65] rounded-3xl bg-gradient-to-b from-[#130b2c] via-[#0d0722] to-[#080516] border border-[#2d1c5a] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(147,51,234,0.18)] p-6 sm:p-7 overflow-hidden will-change-transform transform-gpu"
            >
              {/* Subtle ambient glow inside card */}
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#9333ea]/15 rounded-full blur-[60px]" />

              {/* Centered navigation links — No Book Call button */}
              <ul className="relative z-10 flex flex-col items-center gap-1.5">
                {NAV_LINKS.map(({ label, href }) => {
                  const id = href.replace('#', '');
                  const isActive = activeSection === id;
                  return (
                    <li key={id} className="w-full text-center">
                      <a
                        href={href}
                        onClick={(e) => scrollToSection(e, href)}
                        className={[
                          'block w-full py-3 px-4 rounded-2xl text-base font-bold transition-all duration-150 tracking-wide',
                          isActive
                            ? 'text-[#c084fc] bg-[#a855f7]/15 border border-[#a855f7]/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'text-[#cbd5e1] hover:text-white hover:bg-white/5 active:bg-white/10',
                        ].join(' ')}
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
