'use client';

import { useCallback } from 'react';

const EXPLORE_LINKS = [
  { label: 'About',    href: '#about'    },
  { label: 'My Works', href: '#work'     },
  { label: 'Services', href: '#services' },
  { label: 'Contact',  href: '#contact'  },
];

const SOCIAL_LINKS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/sakthi-vel-0b7557416/', icon: '/linkedin.png' },
  { label: 'WhatsApp',  href: 'https://wa.me/917695978552',                        icon: '/whatsapp.png' },
  { label: 'Instagram', href: 'https://www.instagram.com/sakthi_himself_/',        icon: '/instagram.png' },
  { label: 'Gmail',     href: 'mailto:sakthivelvseditor@gmail.com',                icon: '/gmail.png' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const id = href.replace('#', '');
      if (id === 'hero') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [],
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#05040a] border-t border-[#1d1833]/60 relative">
      {/* Desktop subtle ambient background glow */}
      <div className="pointer-events-none absolute -bottom-24 left-1/4 w-[500px] h-[300px] bg-[#9333ea]/5 rounded-full blur-[140px] hidden md:block" />

      <div className="max-w-2xl md:max-w-6xl lg:max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-6 md:pb-8 relative z-10">

        {/* ── Main Top Section (Stacked on Mobile, Split Left/Right on Desktop) ── */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-12 lg:gap-20 mb-8 md:mb-14">

          {/* Left Side: Brand + Tagline */}
          <div className="md:max-w-md">
            <div className="mb-2 md:mb-3">
              <a href="#" onClick={(e) => scrollToSection(e, '#hero')} className="inline-block">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  Sakthivel<span className="text-[#a855f7]">.</span>
                </h2>
              </a>
            </div>

            <p className="text-[#64748b] md:text-[#94a3b8] text-sm md:text-base leading-relaxed max-w-xs md:max-w-sm">
              Building cinematic, high-converting VSL videos and powerful video ads.
            </p>
          </div>

          {/* Right Side: Explore + Connect Columns */}
          <div className="grid grid-cols-2 gap-8 md:gap-16 lg:gap-24 w-full md:w-auto">

            {/* Column 1: Explore */}
            <div>
              <p className="text-[#64748b] text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase mb-4 md:mb-5 font-mono">
                Explore
              </p>
              <ul className="flex flex-col gap-3 md:gap-3.5">
                {EXPLORE_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      onClick={(e) => scrollToSection(e, href)}
                      className="text-[#94a3b8] hover:text-white text-sm md:text-base font-medium transition-colors duration-200"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Connect */}
            <div>
              <p className="text-[#64748b] text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase mb-4 md:mb-5 font-mono">
                Connect
              </p>
              {/* 2×2 grid on mobile, horizontal row on desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3.5 w-fit">
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={label === 'Gmail' ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-xl bg-[#0f0b20] border border-[#1d1833] flex items-center justify-center hover:border-[#a855f7]/60 hover:bg-[#a855f7]/15 hover:scale-110 transition-all duration-200 shadow-sm"
                  >
                    <img src={icon} alt={label} className="w-6 h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 object-contain" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Divider Line ── */}
        <div className="h-px bg-[#1d1833]/80 mb-6 md:mb-8" />

        {/* ── Bottom Section (Centered 2-line on Mobile, Split Single-line + ScrollTop on Desktop) ── */}
        <div className="flex flex-col md:flex-row items-center md:justify-between text-center md:text-left gap-4">
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-xs text-[#64748b]">
            <span>© {currentYear} Sakthivel. All rights reserved.</span>
            <span className="hidden md:inline text-[#2d2050] font-bold">|</span>
            <span>
              Designed &amp; Developed by{' '}
              <span className="text-[#a855f7] font-medium">Sakthivel</span>.
            </span>
          </div>

          {/* Back-To-Top Button (Mobile + Desktop) */}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0d091e] border border-[#221644] hover:border-[#a855f7] text-[#94a3b8] hover:text-white transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] group cursor-pointer text-xs"
            title="Back to top"
          >
            <span>Back to top</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200 text-[#c084fc]"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>

      </div>
    </footer>
  );
}
