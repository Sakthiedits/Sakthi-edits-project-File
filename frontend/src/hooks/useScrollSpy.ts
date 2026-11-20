import { useState, useEffect } from 'react';

/**
 * `useScrollSpy` — tracks which section is currently in view.
 * Uses a smooth, high-precision scroll tracker with requestAnimationFrame
 * that accurately activates sections (including short sections like About).
 *
 * @param sectionIds      - Array of element `id` strings in DOM order.
 * @param offsetOrOptions - Optional offset or configuration options.
 * @returns The `id` string of the currently active section.
 */
export function useScrollSpy(
  sectionIds: string[],
  _offsetOrOptions?: number | { rootMargin?: string; offset?: number },
): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] || 'hero');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    let ticking = false;

    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 1. If at top of the page, activate the first section (hero/home)
      if (scrollY < 120) {
        setActiveId(sectionIds[0]);
        return;
      }

      // 2. If at bottom of the page, activate the last section (contact)
      if (scrollY + windowHeight >= documentHeight - 60) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      // 3. Focal line: roughly 32% down the viewport, where the user's eyes focus on the section
      const focalLine = scrollY + Math.min(windowHeight * 0.35, 300);

      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (top <= focalLine) {
            current = id;
          }
        }
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Run on mount
    updateActiveSection();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionIds.join(',')]);

  return activeId;
}

export default useScrollSpy;
