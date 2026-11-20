'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  service: string;
  details: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  service?: string;
  details?: string;
}

const serviceOptions = [
  'VSL Video Editing',
  'Video Ads',
  'Motion Graphics',
  'Animated Captions & Text',
  'Stock Footage & B-Roll',
  'Sound Design',
  'Transitions & Pacing',
  'Other / Custom Project',
];

const CONNECT_ICONS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/sakthi-vel-0b7557416/', icon: '/linkedin.png' },
  { label: 'Instagram', href: 'https://www.instagram.com/sakthi_himself_/',        icon: '/instagram.png' },
  { label: 'WhatsApp',  href: 'https://wa.me/917695978552',                        icon: '/whatsapp.png' },
];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildWhatsAppUrl(data: FormData): string {
  const lines = [
    `*NEW PROJECT INQUIRY - SAKTHIEDITS*`,
    ``,
    `*Name:* ${data.name.trim()}`,
    `*Email:* ${data.email.trim()}`,
    `*Service:* ${data.service}`,
    ``,
    `*Project Details:*`,
    `${data.details.trim()}`,
    ``,
    `----------------------------------------`,
    `Sent from Sakthiedits Portfolio`,
  ];
  return `https://wa.me/917695978552?text=${encodeURIComponent(lines.join('\n'))}`;
}

export default function Contact() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', service: '', details: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim())    e.name    = 'Name is required.';
    if (!form.email.trim())   e.email   = 'Email is required.';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email.';
    if (!form.service)        e.service = 'Please select a service.';
    if (!form.details.trim()) e.details = 'Project details are required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    window.open(buildWhatsAppUrl(form), '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  }

  const inputBase = `w-full bg-[#0b081a] border border-[#261a4c] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]
    text-white rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[#5f517e]`;

  return (
    <section id="contact" className="scroll-mt-24 md:scroll-mt-28 relative py-12 md:py-24 lg:py-28 px-6 md:px-12 lg:px-20 bg-[#06050b] overflow-hidden">
      {/* Subtle atmospheric ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] opacity-[0.07]"
        style={{ background: 'radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto z-10">

        {/* ── Single grid from top — heading in LEFT, form in RIGHT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Heading + Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-5 items-center lg:items-start text-center lg:text-left w-full"
          >
            {/* CONTACT label — centered on mobile, left on desktop */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#a855f7]/40 bg-[#150d33] shadow-[0_0_16px_rgba(168,85,247,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc] animate-pulse" />
              <span className="text-white text-xs font-bold tracking-wider uppercase">
                Contact
              </span>
            </div>

            {/* Let's Talk heading with right accent line */}
            <div className="flex items-center gap-4 w-full justify-center lg:justify-start">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight shrink-0">
                Let&apos;s Talk
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#a855f7]/50 to-transparent max-w-[160px] hidden md:block" />
            </div>

            {/* Gmail card */}
            <a
              href="mailto:sakthivelvseditor@gmail.com"
              className="w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center gap-4 bg-[#0d0a1c] border border-[#231845] rounded-2xl px-5 py-4 hover:border-[#a855f7]/60 hover:shadow-[0_0_18px_rgba(168,85,247,0.18)] transition-all duration-300 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1b0d3d] border border-[#3b1f7a]/60 flex items-center justify-center shrink-0">
                <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#94a3b8] text-[10px] font-mono tracking-widest uppercase mb-0.5">Gmail</span>
                <span className="text-white font-semibold text-sm truncate">sakthivelvseditor@gmail.com</span>
              </div>
            </a>

            {/* WhatsApp card */}
            <a
              href="https://wa.me/917695978552"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-sm sm:max-w-md lg:max-w-none flex items-center gap-4 bg-[#0d0a1c] border border-[#231845] rounded-2xl px-5 py-4 hover:border-[#a855f7]/60 hover:shadow-[0_0_18px_rgba(168,85,247,0.18)] transition-all duration-300 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1b0d3d] border border-[#3b1f7a]/60 flex items-center justify-center shrink-0">
                <img src="/whatsapp.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[#94a3b8] text-[10px] font-mono tracking-widest uppercase mb-0.5">WhatsApp</span>
                <span className="text-white font-semibold text-sm">+91 76959 78552</span>
              </div>
            </a>

            {/* Connect with me row — centered on mobile, left on desktop */}
            <div className="w-full flex flex-col items-center lg:items-start mt-2">
              <p className="text-[#64748b] text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 font-mono">
                Connect with me:
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                {CONNECT_ICONS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 rounded-xl bg-[#0d0a1c] border border-[#231845] flex items-center justify-center hover:border-[#a855f7]/60 hover:bg-[#a855f7]/10 hover:scale-110 transition-all duration-200"
                  >
                    <img src={icon} alt={label} className="w-6 h-6 object-contain" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Contact Form — top aligns with Let's Talk heading ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="self-stretch flex flex-col lg:pt-[44px] w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto lg:mx-0"
          >
            {submitted ? (
              <div className="flex-1 bg-[#0d0a1c] border border-[#231845] rounded-3xl flex flex-col items-center justify-center gap-5 p-10 text-center shadow-[0_0_35px_rgba(168,85,247,0.12)]">
                <div className="w-16 h-16 rounded-2xl bg-[#1b0d3d] border border-[#a855f7]/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-white text-2xl font-bold">WhatsApp Ready!</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xs">
                  Your message has been pre-filled in WhatsApp. Tap <strong className="text-[#c084fc]">Send</strong> to connect directly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', service: '', details: '' }); }}
                  className="text-[#c084fc] text-sm hover:text-[#e879f9] transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex-1 bg-[#0b0818] border border-[#221842] rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
              >
                {/* Name + Email — side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      id="name" name="name" type="text" autoComplete="name"
                      placeholder="Your Name" value={form.name} onChange={handleChange}
                      className={`${inputBase} ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
                  </div>
                  <div>
                    <input
                      id="email" name="email" type="email" autoComplete="email"
                      placeholder="Email Address" value={form.email} onChange={handleChange}
                      className={`${inputBase} ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                {/* Custom Service Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className={`${inputBase} cursor-pointer flex items-center justify-between text-left ${
                      dropdownOpen ? 'border-[#a855f7] ring-1 ring-[#a855f7]' : errors.service ? 'border-red-500' : ''
                    } ${form.service ? 'text-white' : 'text-[#5f517e]'}`}
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                  >
                    <span className="truncate">
                      {form.service || 'Subject'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[#c084fc] transition-transform duration-200 shrink-0 ml-2 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0e0a22]/98 backdrop-blur-2xl border border-[#2d1b5e] rounded-xl py-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(147,51,234,0.25)] max-h-60 overflow-y-auto"
                      >
                        {serviceOptions.map(opt => {
                          const isSelected = form.service === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setForm(prev => ({ ...prev, service: opt }));
                                setDropdownOpen(false);
                                if (errors.service) {
                                  setErrors(prev => ({ ...prev, service: undefined }));
                                }
                              }}
                              className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#a855f7]/20 text-[#c084fc] font-semibold'
                                  : 'text-[#cbd5e1] hover:bg-[#a855f7]/15 hover:text-white'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={16} className="text-[#c084fc] shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.service && <p className="text-red-400 text-xs mt-1.5">{errors.service}</p>}
                </div>

                {/* Message — flex-1 so it expands to fill remaining height */}
                <div className="flex-1 flex flex-col">
                  <textarea
                    id="details" name="details"
                    placeholder="Your Message"
                    value={form.details} onChange={handleChange}
                    className={`${inputBase} resize-none flex-1 min-h-[100px] ${errors.details ? 'border-red-500' : ''}`}
                  />
                  {errors.details && <p className="text-red-400 text-xs mt-1.5">{errors.details}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#5b21b6] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#7c3aed] text-white font-semibold py-3.5 rounded-xl
                    border border-[#7c3aed]/30 hover:border-[#a855f7]/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_20px_rgba(109,40,217,0.3)]
                    active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer tracking-wide text-sm"
                >
                  Send Message
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
