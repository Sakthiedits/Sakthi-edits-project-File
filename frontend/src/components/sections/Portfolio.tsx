import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicProjects } from '@/hooks/useProjects';
import VideoCard from '@/components/video/VideoCard';
import type { Project } from '@/types';

const CARD_WIDTH = 285;
const GAP = 28;
const STEP = CARD_WIDTH + GAP;

function getCardOffset(index: number, active: number, total: number) {
  if (total < 3) return index - active;
  let diff = index - active;
  while (diff > total / 2) diff -= total;
  while (diff < -total / 2) diff += total;
  return diff;
}

export const Portfolio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [unmutedProjectId, setUnmutedProjectId] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevActiveRef = useRef(activeIndex);

  useEffect(() => {
    prevActiveRef.current = activeIndex;
  }, [activeIndex]);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { projects, loading, error, refetch } = usePublicProjects();

  // Dynamically extract categories with existing projects, starting with 'All'
  const availableCategories = [
    'All',
    ...Array.from(new Set(projects.map((p) => p.category))).filter(Boolean),
  ];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? Math.max(0, filteredProjects.length - 1) : prev - 1));
  }, [filteredProjects.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev >= filteredProjects.length - 1 ? 0 : prev + 1));
  }, [filteredProjects.length]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setActiveIndex(0);
    // Mute sound when switching category to keep experience clean
    setUnmutedProjectId(null);
  };

  useEffect(() => {
    if (activeIndex >= filteredProjects.length) {
      setActiveIndex(0);
    }
  }, [filteredProjects.length, activeIndex]);

  useEffect(() => {
    if (isMobile || filteredProjects.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, filteredProjects.length, handlePrev, handleNext]);

  const handleToggleSound = (projectId: number) => {
    // If this project is already unmuted, mute it; otherwise unmute this one and mute all others
    setUnmutedProjectId((prev) => (prev === projectId ? null : projectId));
  };

  return (
    <section id="work" className="scroll-mt-24 pt-16 pb-12 md:pt-28 md:pb-24 bg-[#06050b] relative overflow-hidden">
      {/* Subtle atmospheric background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[#7c3aed]/10 rounded-full blur-[40px] md:blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#a855f7]/40 bg-[#150d33] shadow-[0_0_16px_rgba(168,85,247,0.2)] mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc] animate-pulse" />
            <span className="text-white text-xs font-bold tracking-wider uppercase">
              Portfolio Showcase
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
          >
            My Works
          </motion.h2>

          {/* Filter categories — sleek single horizontal scroll row on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 sm:gap-2.5 mt-5 sm:mt-7 max-w-3xl mx-auto px-1 py-1.5"
          >
            {availableCategories.map((cat) => {
              const count = cat === 'All'
                ? projects.length
                : projects.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white shadow-[0_0_20px_rgba(147,51,234,0.45)] border border-[#c084fc]/50 scale-[1.02]'
                      : 'bg-[#0e0a24]/90 text-[#94a3b8] hover:text-white hover:bg-[#160f38] border border-[#231848]'
                  }`}
                >
                  {cat}
                  {projects.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#181136] text-[#9d94be]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Content Section: Loading, Error, Empty, or Projects */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[9/16] bg-[#0f0a22] border border-[#231848] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-[#231848] rounded-2xl bg-[#0d091e] px-6">
            <Film className="w-10 h-10 text-[#555555] mb-4" />
            <p className="text-sm text-[#9a9590] mb-4">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a0f38] border border-[#a855f7]/40 text-xs font-semibold text-[#c084fc] hover:bg-[#a855f7]/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#261852] rounded-2xl bg-[#0c081e] px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#160e33] border border-[#3b1f7a] flex items-center justify-center mb-4 text-[#c084fc] shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Film className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              {selectedCategory === 'All' ? 'No projects published yet' : `No ${selectedCategory} projects found`}
            </h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-sm mt-1 mb-2 leading-relaxed">
              New video showcases will be published soon. Stay tuned!
            </p>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="mt-3 text-xs text-[#c084fc] underline hover:text-[#e879f9] cursor-pointer"
              >
                View all categories
              </button>
            )}
          </div>
        ) : (
          <>
            {isMobile ? (
              /* ── Mobile View: Ultra-Smooth Clean 2-Column Grid (< md) ── */
              <div className="grid grid-cols-2 gap-3 mt-6 pb-10" style={{ touchAction: 'pan-y' }}>
                {filteredProjects.map((project) => (
                  <div key={project.id} className="col-span-1 w-full">
                    <VideoCard
                      project={project}
                      isUnmuted={unmutedProjectId === project.id}
                      onToggleSound={() => handleToggleSound(project.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* ── Desktop View: Single-Row Centered 3D Coverflow Carousel (>= md) ── */
              <div className="relative w-full mt-6 sm:mt-10 pb-12 select-none">
                {/* Carousel Stage Container */}
                <div className="relative w-full h-[540px] overflow-hidden flex items-center justify-center">
                  {/* Left / Right Vignette gradient fade edges matching reference */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#06050b] via-[#06050b]/80 to-transparent z-25" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#06050b] via-[#06050b]/80 to-transparent z-25" />

                  {/* Left Navigation Arrow */}
                  {filteredProjects.length > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#110a29]/90 backdrop-blur-md border border-[#3d247d] hover:border-[#c084fc] hover:bg-[#1f1147] text-white flex items-center justify-center shadow-[0_0_24px_rgba(0,0,0,0.85),0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer active:scale-90 group"
                      aria-label="Previous video"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#c084fc] group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
                    </button>
                  )}

                  {/* Right Navigation Arrow */}
                  {filteredProjects.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#110a29]/90 backdrop-blur-md border border-[#3d247d] hover:border-[#c084fc] hover:bg-[#1f1147] text-white flex items-center justify-center shadow-[0_0_24px_rgba(0,0,0,0.85),0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer active:scale-90 group"
                      aria-label="Next video"
                    >
                      <ChevronRight className="w-6 h-6 text-[#c084fc] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )}

                  {/* Motion Circular Coverflow Stage */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {filteredProjects.map((project, index) => {
                      const offset = getCardOffset(index, activeIndex, filteredProjects.length);
                      const prevOffset = getCardOffset(index, prevActiveRef.current, filteredProjects.length);
                      const absOffset = Math.abs(offset);
                      const isActive = offset === 0;
                      const isWrapping = Math.abs(offset - prevOffset) > 1.8;

                      return (
                        <motion.div
                          key={project.id}
                          onClick={() => {
                            if (!isActive) {
                              setActiveIndex(index);
                            }
                          }}
                          initial={false}
                          animate={{
                            x: offset * STEP,
                            scale: isActive ? 1.05 : absOffset === 1 ? 0.9 : 0.8,
                            opacity: isActive ? 1 : absOffset === 1 ? 0.65 : absOffset === 2 ? 0.35 : 0,
                            y: isActive ? 0 : absOffset === 1 ? 8 : 16,
                            zIndex: isActive ? 30 : 20 - Math.round(absOffset * 5),
                          }}
                          transition={
                            isWrapping
                              ? { duration: 0 }
                              : {
                                  type: 'spring',
                                  stiffness: 280,
                                  damping: 28,
                                }
                          }
                          style={{
                            position: 'absolute',
                            width: `${CARD_WIDTH}px`,
                            pointerEvents: absOffset <= 2.2 ? 'auto' : 'none',
                          }}
                          className={`
                            transition-shadow duration-300 rounded-2xl
                            ${!isActive ? 'cursor-pointer hover:opacity-85' : ''}
                            ${
                              isActive
                                ? 'shadow-[0_0_40px_rgba(168,85,247,0.45)] ring-2 ring-[#a855f7]/60'
                                : ''
                            }
                          `}
                        >
                          <VideoCard
                            project={project}
                            isUnmuted={unmutedProjectId === project.id}
                            onToggleSound={() => handleToggleSound(project.id)}
                            isActiveCard={isActive}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation Indicators & Counter Pill */}
                <div className="flex flex-col items-center justify-center gap-3 mt-4">
                  {/* Interactive Indicator Pills */}
                  <div className="flex items-center justify-center gap-2">
                    {filteredProjects.map((proj, idx) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          idx === activeIndex
                            ? 'w-8 h-2 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] shadow-[0_0_14px_rgba(168,85,247,0.85)]'
                            : 'w-2 h-2 bg-[#2d1c5a] hover:bg-[#a855f7]/70'
                        }`}
                        aria-label={`Go to video ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Active Project Info Capsule matching reference */}
                  <div className="flex items-center gap-2.5 text-xs font-mono font-semibold text-[#c084fc] tracking-wider uppercase bg-[#120a28]/85 border border-[#2d1b5a] px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                    <span className="font-bold text-white">0{activeIndex + 1}</span>
                    <span className="text-white/30">/</span>
                    <span className="text-[#94a3b8]">0{filteredProjects.length}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white font-sans font-medium text-[11px] truncate max-w-xs">
                      {filteredProjects[activeIndex]?.title}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
