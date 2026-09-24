import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_SECTION_NAMES = [
  'hero',
  'system-01',
  'system-02',
  'system-03',
  'system-04',
  'focus-areas',
  'transmission',
];

const DEFAULT_CORE_NAMES = ['core-01', 'core-02', 'core-03'];

export default function FloatingCLI({
  containerRef,
  horizontalContainerRef,
  activeSection,
  sectionNames = DEFAULT_SECTION_NAMES,
  coreNames = DEFAULT_CORE_NAMES,
}) {
  const [display, setDisplay] = useState({ text: '', submitAnim: false });
  const anchoredIndexRef = useRef(0);
  const horizontalAnchoredIndexRef = useRef(0);
  const submitTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Keep a ref for activeSection so horizontal listeners do not re-bind on vertical scroll
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Clean up any pending timer on component unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Vertical scroll effect with boundary-based transition detection
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    // Helper to determine which section covers the viewport center
    const getActiveSectionIndex = (scrollY) => {
      const sections = container.querySelectorAll('section[data-section-id]');
      if (!sections || sections.length === 0) return 0;
      const vh = container.clientHeight || window.innerHeight;
      const centerY = scrollY + vh / 2;
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop;
        const bottom = top + sections[i].offsetHeight;
        if (centerY >= top && centerY <= bottom) {
          return i;
        }
      }
      return 0;
    };

    anchoredIndexRef.current = getActiveSectionIndex(container.scrollTop);

    let rafId;
    const handleScrollUpdate = () => {
      if (isSubmittingRef.current) return;

      const scrollY = container.scrollTop;
      const vh = container.clientHeight || window.innerHeight;
      const sections = container.querySelectorAll('section[data-section-id]');
      if (!sections || sections.length < 2) return;

      const snapThreshold = Math.max(20, vh * 0.035);

      // Check all boundary transition zones between section k-1 and section k
      let activeBoundary = null;
      for (let k = 1; k < sections.length; k++) {
        const secTop = sections[k].offsetTop;
        const start = secTop - vh;
        const end = secTop;

        // Active if scroll is within the boundary transition window (with threshold buffer)
        if (scrollY >= start - snapThreshold && scrollY <= end + snapThreshold) {
          activeBoundary = { k, start, end };
          break;
        }
      }

      // If we are in a resting zone outside of any boundary transition
      if (!activeBoundary) {
        anchoredIndexRef.current = getActiveSectionIndex(scrollY);
        setDisplay((prev) =>
          prev.text !== '' && !prev.submitAnim ? { text: '', submitAnim: false } : prev
        );
        return;
      }

      const { k, start, end } = activeBoundary;
      const isMovingDown = anchoredIndexRef.current < k;

      if (isMovingDown) {
        // Scrolling DOWN towards section k
        const targetName = sectionNames[k] || `section-${k}`;
        const commandStr = `cd ./${targetName}`;

        // Check if snapped at destination (end)
        if (Math.abs(scrollY - end) <= snapThreshold) {
          if (anchoredIndexRef.current !== k) {
            isSubmittingRef.current = true;
            setDisplay({ text: commandStr, submitAnim: true });
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = setTimeout(() => {
              anchoredIndexRef.current = k;
              isSubmittingRef.current = false;
              setDisplay({ text: '', submitAnim: false });
            }, 350);
          } else {
            setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          }
          return;
        }

        // Check if snapped back to start
        if (scrollY <= start + snapThreshold) {
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          return;
        }

        // In-flight progress entering section k
        const progress = Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
        const charsToType = Math.floor(progress * commandStr.length);
        const newText = commandStr.substring(0, charsToType);
        setDisplay((prev) => {
          if (prev.text !== newText || prev.submitAnim) {
            return { text: newText, submitAnim: false };
          }
          return prev;
        });
      } else {
        // Scrolling UP towards section k - 1
        const targetName =
          sectionNames[k - 1] || (k - 1 === 0 ? 'hero' : `section-${k - 1}`);
        const commandStr = `cd ../${targetName}`;

        // Check if snapped at destination (start)
        if (Math.abs(scrollY - start) <= snapThreshold) {
          if (anchoredIndexRef.current !== k - 1) {
            isSubmittingRef.current = true;
            setDisplay({ text: commandStr, submitAnim: true });
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = setTimeout(() => {
              anchoredIndexRef.current = k - 1;
              isSubmittingRef.current = false;
              setDisplay({ text: '', submitAnim: false });
            }, 350);
          } else {
            setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          }
          return;
        }

        // Check if snapped back to end
        if (scrollY >= end - snapThreshold) {
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          return;
        }

        // In-flight progress returning to section k - 1
        const progress = Math.min(Math.max((end - scrollY) / (end - start), 0), 1);
        const charsToType = Math.floor(progress * commandStr.length);
        const newText = commandStr.substring(0, charsToType);
        setDisplay((prev) => {
          if (prev.text !== newText || prev.submitAnim) {
            return { text: newText, submitAnim: false };
          }
          return prev;
        });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScrollUpdate);
    };

    container.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef, sectionNames]);

  // Horizontal scroll effect (core competencies on mobile)
  useEffect(() => {
    const hContainer = horizontalContainerRef?.current;
    if (!hContainer) return;

    const getActiveCoreIndex = (scrollX) => {
      const children = hContainer.children;
      if (!children || children.length === 0) return 0;
      const vw = hContainer.clientWidth || window.innerWidth;
      const centerX = scrollX + vw / 2;
      for (let i = 0; i < children.length; i++) {
        const left = children[i].offsetLeft;
        const right = left + children[i].offsetWidth;
        if (centerX >= left && centerX <= right) {
          return i;
        }
      }
      return 0;
    };

    horizontalAnchoredIndexRef.current = getActiveCoreIndex(hContainer.scrollLeft);

    let rafId;
    const handleHorizontalScrollUpdate = () => {
      if (isSubmittingRef.current) return;
      if (activeSectionRef.current !== 'expertise') return;

      const scrollX = hContainer.scrollLeft;
      const vw = hContainer.clientWidth || window.innerWidth;
      const children = hContainer.children;
      if (!children || children.length < 2) return;

      const snapThreshold = Math.max(15, vw * 0.04);

      let activeBoundary = null;
      for (let k = 1; k < children.length; k++) {
        const childLeft = children[k].offsetLeft;
        const start = childLeft - vw;
        const end = childLeft;

        if (scrollX >= start - snapThreshold && scrollX <= end + snapThreshold) {
          activeBoundary = { k, start, end };
          break;
        }
      }

      if (!activeBoundary) {
        horizontalAnchoredIndexRef.current = getActiveCoreIndex(scrollX);
        setDisplay((prev) =>
          prev.text !== '' && !prev.submitAnim ? { text: '', submitAnim: false } : prev
        );
        return;
      }

      const { k, start, end } = activeBoundary;
      const isMovingRight = horizontalAnchoredIndexRef.current < k;

      if (isMovingRight) {
        const targetName = coreNames[k] || `core-${k}`;
        const commandStr = `cd ./${targetName}`;

        if (Math.abs(scrollX - end) <= snapThreshold) {
          if (horizontalAnchoredIndexRef.current !== k) {
            isSubmittingRef.current = true;
            setDisplay({ text: commandStr, submitAnim: true });
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = setTimeout(() => {
              horizontalAnchoredIndexRef.current = k;
              isSubmittingRef.current = false;
              setDisplay({ text: '', submitAnim: false });
            }, 350);
          } else {
            setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          }
          return;
        }

        if (scrollX <= start + snapThreshold) {
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          return;
        }

        const progress = Math.min(Math.max((scrollX - start) / (end - start), 0), 1);
        const charsToType = Math.floor(progress * commandStr.length);
        const newText = commandStr.substring(0, charsToType);
        setDisplay((prev) => {
          if (prev.text !== newText || prev.submitAnim) {
            return { text: newText, submitAnim: false };
          }
          return prev;
        });
      } else {
        const targetName = coreNames[k - 1] || `core-${k - 1}`;
        const commandStr = `cd ../${targetName}`;

        if (Math.abs(scrollX - start) <= snapThreshold) {
          if (horizontalAnchoredIndexRef.current !== k - 1) {
            isSubmittingRef.current = true;
            setDisplay({ text: commandStr, submitAnim: true });
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = setTimeout(() => {
              horizontalAnchoredIndexRef.current = k - 1;
              isSubmittingRef.current = false;
              setDisplay({ text: '', submitAnim: false });
            }, 350);
          } else {
            setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          }
          return;
        }

        if (scrollX >= end - snapThreshold) {
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
          return;
        }

        const progress = Math.min(Math.max((end - scrollX) / (end - start), 0), 1);
        const charsToType = Math.floor(progress * commandStr.length);
        const newText = commandStr.substring(0, charsToType);
        setDisplay((prev) => {
          if (prev.text !== newText || prev.submitAnim) {
            return { text: newText, submitAnim: false };
          }
          return prev;
        });
      }
    };

    const onHScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleHorizontalScrollUpdate);
    };

    hContainer.addEventListener('scroll', onHScroll, { passive: true });

    return () => {
      hContainer.removeEventListener('scroll', onHScroll);
      cancelAnimationFrame(rafId);
    };
  }, [horizontalContainerRef, coreNames]);

  if (!display.text && !display.submitAnim) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-6 left-6 md:top-8 md:left-12 z-50 pointer-events-none font-mono text-xs md:text-sm tracking-wider uppercase transition-all duration-300 ease-out select-none ${
        display.submitAnim
          ? 'scale-110 -translate-y-1 opacity-0 text-offwhite'
          : 'scale-100 translate-y-0 opacity-100 text-offwhite'
      }`}
    >
      <span className="text-muted mr-2">~ $</span>
      <span>{display.text}</span>
      {!display.submitAnim && (
        <span className="inline-block bg-offwhite w-[1ch] h-[1.1em] ml-1 align-middle animate-blink" />
      )}
    </div>
  );
}
