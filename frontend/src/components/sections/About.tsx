'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '50+', label: 'Projects Completed' },
  { value: '2+', label: 'Years Experience' },
  { value: '100%', label: 'Client Satisfaction' },
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 md:scroll-mt-28 relative py-12 md:py-24 px-6 bg-[#07050e] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#9333ea]/10 rounded-full blur-[130px]" />

      <div className="relative max-w-2xl mx-auto text-center">

        {/* Top label pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#a855f7]/40 bg-[#150d33] shadow-[0_0_16px_rgba(168,85,247,0.2)] mb-5"
        >
          <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc] animate-pulse" />
          <span className="text-white text-xs font-bold tracking-wider uppercase">
            About Me
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-7 leading-tight"
        >
          Who is Sakthivel?
        </motion.h2>

        {/* Bio text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#94a3b8] text-[15px] sm:text-base leading-[1.85] mb-10"
        >
          I'm a video editor specializing in{' '}
          <span className="text-[#c084fc] font-semibold">VSL (Video Sales Letter)</span> videos
          and high-converting video ads. I combine engaging storytelling, dynamic motion graphics,
          smooth transitions, and strategic editing to capture attention, keep viewers engaged, and{' '}
          <span className="text-white font-semibold">turn viewers into customers.</span> My goal
          is to help brands and businesses communicate their message effectively and drive more
          sales through powerful video content.
        </motion.p>

        {/* Thin divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-[#a855f7] to-transparent mx-auto mb-10 origin-center"
        />

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-8 sm:gap-14"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#c084fc]">
                {stat.value}
              </span>
              <span className="text-[11px] sm:text-xs text-[#64748b] font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
