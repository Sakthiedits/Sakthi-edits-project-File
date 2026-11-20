'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Activity,
  MessageSquare,
  Focus,
  Star,
  Target,
} from 'lucide-react';

interface Principle {
  icon: React.ElementType;
  title: string;
  description: string;
}

const principles: Principle[] = [
  {
    icon: BookOpen,
    title: 'Storytelling First',
    description:
      "Every edit starts with understanding the story and the audience it's meant for.",
  },
  {
    icon: Activity,
    title: 'Audience-Focused Pacing',
    description:
      'Editing rhythm tailored to keep viewers engaged from start to finish.',
  },
  {
    icon: MessageSquare,
    title: 'Clear Communication',
    description: 'We keep the process simple, from brief to delivery.',
  },
  {
    icon: Focus,
    title: 'Attention to Detail',
    description:
      'Every frame, transition, and sound element is intentional.',
  },
  {
    icon: Star,
    title: 'Visual Polish',
    description:
      'Motion graphics and visual elements that elevate the production.',
  },
  {
    icon: Target,
    title: 'Marketing-Focused',
    description:
      'Editing decisions made with the goal of effective communication in mind.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

function CardContent({ principle }: { principle: Principle }) {
  const Icon = principle.icon;
  return (
    <div className="group relative bg-gradient-to-b from-[#110a26] to-[#090616] border border-[#231845] p-6 rounded-2xl hover:border-[#a855f7]/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300 flex flex-col gap-3.5 h-full text-left">
      {/* Icon & Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#1b0d3d] border border-[#3b1f7a]/60 flex items-center justify-center group-hover:bg-[#7c3aed]/25 group-hover:border-[#a855f7] transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.2)] shrink-0">
          <Icon
            size={20}
            className="text-[#c084fc] group-hover:text-[#e879f9] transition-colors"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <h3 className="text-white font-bold text-base group-hover:text-[#e879f9] transition-colors">
          {principle.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[#94a3b8] text-sm leading-relaxed pl-1">
        {principle.description}
      </p>
    </div>
  );
}

export default function WhyWorkWithMe() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.children[index] as HTMLElement;
    if (card) {
      const left = card.offsetLeft - container.offsetLeft;
      container.scrollTo({ left, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.firstElementChild as HTMLElement;
    if (!card) return;
    const cardWidth = card.offsetWidth + 16;
    const newIndex = Math.min(
      principles.length - 1,
      Math.max(0, Math.round(container.scrollLeft / cardWidth))
    );
    setActiveIndex(newIndex);
  };

  // Natural mobile swipe without background timer interruptions

  return (
    <section
      className="relative pt-6 pb-12 md:py-24 px-6 md:px-12 lg:px-20 bg-[#07050e] overflow-hidden"
      aria-label="Why Work With Me"
    >
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-[#9333ea]/10 rounded-full blur-[160px]" />

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Heading — centered on mobile, left on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-2 sm:mb-6 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#a855f7]/40 bg-[#150d33] shadow-[0_0_16px_rgba(168,85,247,0.2)] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc] animate-pulse" />
            <span className="text-white text-xs font-bold tracking-wider uppercase">
              My Approach
            </span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 w-full">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              More Than Just Editing
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#a855f7]/50 to-transparent max-w-xs hidden md:block" />
          </div>
        </motion.div>

        {/* ── Mobile Horizontal Carousel with smooth auto-scroll (< md) ── */}
        <div className="md:hidden mt-6">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => {
              setTimeout(() => setIsInteracting(false), 3000);
            }}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 pt-1 no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="w-[82vw] max-w-[310px] shrink-0 snap-center"
              >
                <CardContent principle={principle} />
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 mt-5">
            {principles.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToCard(i)}
                aria-label={`Go to principle ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? 'w-6 bg-[#c084fc] shadow-[0_0_8px_rgba(192,132,252,0.8)]'
                    : 'w-1.5 bg-[#2d1a54] hover:bg-[#a855f7]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop Grid (>= md) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {principles.map((principle) => (
            <motion.div key={principle.title} variants={itemVariants}>
              <CardContent principle={principle} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
