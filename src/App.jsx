import React, { useState, useEffect, useRef } from 'react';

const PROJECTS = [
  {
    id: '01',
    title: 'AUTONOMOUS REASONING SWARM',
    category: 'AGENTIC ARCHITECTURE',
    year: '2026',
    description:
      'A multi-agent cognitive architecture featuring decentralized consensus, dynamic task decomposition, and self-correcting tool-use loops.',
    tags: ['MULTI-AGENT', 'TOOL EXECUTION', 'STATE SYNCHRONIZATION'],
    metrics: '99.4% EXECUTION COMPLETION | ZERO RECURSION TRAPS',
    link: '#',
  },
  {
    id: '02',
    title: 'AGENT MEMORY GRAPH ENGINE',
    category: 'KNOWLEDGE & RETRIEVAL',
    year: '2025',
    description:
      'Persistent episodic and semantic memory pipeline for long-horizon agent execution, backed by graph traversal and vector indexing.',
    tags: ['GRAPH RAG', 'EPISODIC MEMORY', 'LATENCY OPTIMIZATION'],
    metrics: '<45MS RETRIEVAL | 10M+ TRACE TRAVERSAL',
    link: '#',
  },
  {
    id: '03',
    title: 'REAL-TIME MULTIMODAL COPILOT',
    category: 'STREAMING & INFERENCE',
    year: '2025',
    description:
      'Sub-200ms latency voice and visual reasoning pipeline utilizing bidirectional streaming sockets and speculative action planning.',
    tags: ['STREAMING API', 'VOICE/VISION', 'SPECULATIVE EXECUTION'],
    metrics: '180MS TIME-TO-FIRST-ACTION | DUPLEX AUDIO',
    link: '#',
  },
  {
    id: '04',
    title: 'AGENT EVALUATION HARNESS',
    category: 'BENCHMARKING & RELIABILITY',
    year: '2024',
    description:
      'Deterministic sandbox environment for stress-testing agent robustness against prompt injection, loop traps, and tool hallucinations.',
    tags: ['EVALUATION', 'SANDBOXING', 'SAFETY GUARDS'],
    metrics: '5,000+ ADVERSARIAL TRAJECTORIES TESTED',
    link: '#',
  },
];

const EXPERTISE = [
  {
    area: '01 | ARCHITECTURE',
    title: 'AGENTIC WORKFLOWS',
    detail: 'Autonomous planning, reflection loops, multi-agent orchestration, and deterministic fallback trees.',
  },
  {
    area: '02 | INTERFACES',
    title: 'TOOL SYNTHESIS',
    detail: 'Dynamic API binding, sandboxed code execution, schema validation, and structured output extraction.',
  },
  {
    area: '03 | FOUNDATIONS',
    title: 'MODEL FINE-TUNING & EVALS',
    detail: 'Domain adaptation, synthetic trajectory generation, reward modeling, and adversarial robustness tests.',
  },
];

function Blinker({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline bg-offwhite text-background ml-1 animate-blink select-none ${className}`}
    >
      {'\u00A0'}
    </span>
  );
}

function SplitText({ text, className = '', onHover, onLeave }) {
  if (!text) return null;
  const words = text.split(' ');
  return (
    <span className={`inline ${className}`}>
      {words.map((word, wIdx) => (
        <React.Fragment key={wIdx}>
          <span className="inline whitespace-nowrap">
            {word.split('').map((char, cIdx) => (
              <span
                key={cIdx}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                className="inline hover:bg-offwhite hover:text-background cursor-default transition-none"
              >
                {char}
              </span>
            ))}
          </span>
          {wIdx < words.length - 1 && (
            <span
              onMouseEnter={onHover}
              onMouseLeave={onLeave}
              className="inline hover:bg-offwhite hover:text-background cursor-default transition-none"
            >
              {' '}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

const SECTION_NAMES = [
  'hero',
  'system-01',
  'system-02',
  'system-03',
  'system-04',
  'focus-areas',
  'transmission',
];

const CORE_NAMES = ['core-01', 'core-02', 'core-03'];

function FloatingCLI({ containerRef, horizontalContainerRef, activeSection }) {
  const [display, setDisplay] = useState({ text: '', submitAnim: false });
  const anchoredIndexRef = useRef(0);
  const horizontalAnchoredIndexRef = useRef(0);
  const submitTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Vertical scroll effect
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    // Initialize anchored index based on current scroll position
    const vh = container.clientHeight || window.innerHeight;
    anchoredIndexRef.current = Math.round(container.scrollTop / vh);

    let rafId;
    const handleScrollUpdate = () => {
      if (isSubmittingRef.current) return;

      const scrollY = container.scrollTop;
      const currentVh = container.clientHeight || window.innerHeight;
      const exactIndex = scrollY / currentVh;
      const nearestIndex = Math.round(exactIndex);
      const isSnapped = Math.abs(exactIndex - nearestIndex) < 0.02;

      if (isSnapped) {
        if (nearestIndex !== anchoredIndexRef.current) {
          // Reached destination page! Submit animation
          isSubmittingRef.current = true;
          const isDown = nearestIndex > anchoredIndexRef.current;
          const targetName = SECTION_NAMES[nearestIndex] || 'section';
          const commandStr = isDown ? `cd ./${targetName}` : `cd ../${targetName}`;

          setDisplay({ text: commandStr, submitAnim: true });

          if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
          submitTimeoutRef.current = setTimeout(() => {
            anchoredIndexRef.current = nearestIndex;
            isSubmittingRef.current = false;
            setDisplay({ text: '', submitAnim: false });
          }, 350);
        } else {
          // Snapped back to starting page
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
        }
      } else {
        // In transit between sections
        if (Math.abs(exactIndex - anchoredIndexRef.current) > 1.1) {
          anchoredIndexRef.current = Math.floor(exactIndex);
        }

        const offset = exactIndex - anchoredIndexRef.current;
        let targetIndex;
        let progress;
        let commandStr = '';

        if (offset > 0) {
          targetIndex = anchoredIndexRef.current + 1;
          if (targetIndex < SECTION_NAMES.length) {
            progress = Math.min(Math.max(offset, 0), 1);
            commandStr = `cd ./${SECTION_NAMES[targetIndex]}`;
          }
        } else if (offset < 0) {
          targetIndex = anchoredIndexRef.current - 1;
          if (targetIndex >= 0) {
            progress = Math.min(Math.max(Math.abs(offset), 0), 1);
            commandStr = `cd ../${SECTION_NAMES[targetIndex]}`;
          }
        }

        if (commandStr) {
          const charsToType = Math.floor(progress * commandStr.length);
          const newText = commandStr.substring(0, charsToType);
          setDisplay((prev) => {
            if (prev.text !== newText || prev.submitAnim) {
              return { text: newText, submitAnim: false };
            }
            return prev;
          });
        } else {
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
        }
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
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, [containerRef]);

  // Horizontal scroll effect (core competencies on mobile)
  useEffect(() => {
    const hContainer = horizontalContainerRef?.current;
    if (!hContainer) return;

    // Reset horizontal anchor based on initial scrollLeft
    const updateInitialAnchor = () => {
      const children = hContainer.children;
      if (children && children.length >= 2) {
        const step = children[1].offsetLeft - children[0].offsetLeft;
        if (step > 0) {
          horizontalAnchoredIndexRef.current = Math.max(
            0,
            Math.min(CORE_NAMES.length - 1, Math.round(hContainer.scrollLeft / step))
          );
        }
      }
    };
    updateInitialAnchor();

    let rafId;
    const handleHorizontalScrollUpdate = () => {
      if (isSubmittingRef.current) return;
      if (activeSection !== 'expertise') return;

      const scrollX = hContainer.scrollLeft;
      const children = hContainer.children;
      if (!children || children.length < 2) return;

      const step = children[1].offsetLeft - children[0].offsetLeft;
      if (!step || step <= 0) return;

      const exactIndex = scrollX / step;
      const nearestIndex = Math.max(0, Math.min(CORE_NAMES.length - 1, Math.round(exactIndex)));
      const isSnapped = Math.abs(exactIndex - nearestIndex) < 0.03;

      if (isSnapped) {
        if (nearestIndex !== horizontalAnchoredIndexRef.current) {
          // Reached destination core competency!
          isSubmittingRef.current = true;
          const isRight = nearestIndex > horizontalAnchoredIndexRef.current;
          const targetName = CORE_NAMES[nearestIndex] || 'core';
          const commandStr = isRight ? `cd ./${targetName}` : `cd ../${targetName}`;

          setDisplay({ text: commandStr, submitAnim: true });

          if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
          submitTimeoutRef.current = setTimeout(() => {
            horizontalAnchoredIndexRef.current = nearestIndex;
            isSubmittingRef.current = false;
            setDisplay({ text: '', submitAnim: false });
          }, 350);
        } else {
          // Snapped back to starting competency
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
        }
      } else {
        // In transit between core competencies
        if (Math.abs(exactIndex - horizontalAnchoredIndexRef.current) > 1.1) {
          horizontalAnchoredIndexRef.current = Math.floor(exactIndex);
        }

        const offset = exactIndex - horizontalAnchoredIndexRef.current;
        let targetIndex;
        let progress;
        let commandStr = '';

        if (offset > 0) {
          targetIndex = horizontalAnchoredIndexRef.current + 1;
          if (targetIndex < CORE_NAMES.length) {
            progress = Math.min(Math.max(offset, 0), 1);
            commandStr = `cd ./${CORE_NAMES[targetIndex]}`;
          }
        } else if (offset < 0) {
          targetIndex = horizontalAnchoredIndexRef.current - 1;
          if (targetIndex >= 0) {
            progress = Math.min(Math.max(Math.abs(offset), 0), 1);
            commandStr = `cd ../${CORE_NAMES[targetIndex]}`;
          }
        }

        if (commandStr) {
          const charsToType = Math.floor(progress * commandStr.length);
          const newText = commandStr.substring(0, charsToType);
          setDisplay((prev) => {
            if (prev.text !== newText || prev.submitAnim) {
              return { text: newText, submitAnim: false };
            }
            return prev;
          });
        } else {
          setDisplay((prev) => (prev.text !== '' ? { text: '', submitAnim: false } : prev));
        }
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
  }, [horizontalContainerRef, activeSection]);

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

export default function App() {
  const containerRef = useRef(null);
  const focusContainerRef = useRef(null);
  const cardsRef = useRef([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeFocusIndex, setActiveFocusIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const handleHover = () => setIsHovering(true);
  const handleLeave = () => setIsHovering(false);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 600);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hContainer = focusContainerRef.current;
    if (!hContainer) return;

    const handleFocusScroll = () => {
      const children = hContainer.children;
      if (!children || children.length < 2) return;
      const step = children[1].offsetLeft - children[0].offsetLeft;
      if (!step || step <= 0) return;
      const exactIndex = hContainer.scrollLeft / step;
      const nearest = Math.max(0, Math.min(EXPERTISE.length - 1, Math.round(exactIndex)));
      setActiveFocusIndex(nearest);
    };

    hContainer.addEventListener('scroll', handleFocusScroll, { passive: true });
    return () => hContainer.removeEventListener('scroll', handleFocusScroll);
  }, []);

  const scrollToCompetency = (index) => {
    const hContainer = focusContainerRef.current;
    if (!hContainer) return;
    const children = hContainer.children;
    if (children && children[index]) {
      children[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) setActiveSection(id);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const sections = document.querySelectorAll('section[data-section-id]');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`scroll-container h-[100dvh] w-full overflow-y-auto snap-y snap-mandatory bg-background text-muted ${
        isScrolling ? 'is-scrolling' : ''
      }`}
    >
      <FloatingCLI
        containerRef={containerRef}
        horizontalContainerRef={focusContainerRef}
        activeSection={activeSection}
      />
      {/* 01. Hero Section */}
      <section
        data-section-id="hero"
        className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto cursor-default"
      >
        <p
          className={`text-sm md:text-base tracking-widest uppercase mb-8 transition-colors duration-300 ${
            activeSection === 'hero' ? 'text-silver' : 'text-muted'
          }`}
        >
          <SplitText
            text="| AI SOLUTIONS DEVELOPER & BUSINESS DRIVER"
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </p>
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.95] uppercase mb-12 transition-colors duration-300 ${
            activeSection === 'hero' ? 'text-offwhite' : 'text-muted'
          }`}
        >
          <SplitText text="CREATIVE" onHover={handleHover} onLeave={handleLeave} />
          <br />
          <SplitText text="AGENTIC" onHover={handleHover} onLeave={handleLeave} />
          <br />
          <span>
            <SplitText text="SOLUTIONS." onHover={handleHover} onLeave={handleLeave} />
          </span>
        </h1>
        <p
          className={`text-xl sm:text-2xl md:text-3xl max-w-4xl leading-relaxed font-normal transition-colors duration-300 ${
            activeSection === 'hero' ? 'text-silver' : 'text-muted'
          }`}
        >
          <SplitText
            text="Specializing in designing AI-driven solutions for real world problems."
            onHover={handleHover}
            onLeave={handleLeave}
          />
          {!isHovering && activeSection === 'hero' && <Blinker />}
        </p>
      </section>

      {/* 02 - 05. Dedicated Project Sections */}
      {PROJECTS.map((project, idx) => {
        const sectionId = `system-${project.id}`;
        const isActive = activeSection === sectionId;
        return (
          <section
            key={project.id}
            data-section-id={sectionId}
            tabIndex={0}
            className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border cursor-default outline-none"
          >
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8">
              <span
                className={`text-xs md:text-sm tracking-widest uppercase transition-colors duration-300 ${
                  isActive ? 'text-silver' : 'text-muted'
                }`}
              >
                <SplitText
                  text={`| SYSTEM ${project.id} OF 04 — ${project.category}`}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              </span>
              <span
                className={`text-xs md:text-sm tracking-widest uppercase mt-2 md:mt-0 transition-colors duration-300 ${
                  isActive ? 'text-silver' : 'text-muted'
                }`}
              >
                <SplitText
                  text={`ARCHIVE | ${project.year}`}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              </span>
            </div>

            <h2
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight transition-colors duration-300 mb-8 leading-[0.95] ${
                isActive ? 'text-offwhite' : 'text-muted'
              }`}
            >
              <SplitText text={project.title} onHover={handleHover} onLeave={handleLeave} />
            </h2>

            <p
              className={`text-lg sm:text-xl md:text-2xl max-w-4xl leading-relaxed mb-10 transition-colors duration-300 ${
                isActive ? 'text-silver' : 'text-muted'
              }`}
            >
              <SplitText
                text={project.description}
                onHover={handleHover}
                onLeave={handleLeave}
              />
              {!isHovering && isActive && <Blinker />}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className={`border px-3 py-1 text-xs tracking-wider uppercase transition-colors duration-300 ${
                    isActive
                      ? 'text-offwhite border-border-active'
                      : 'text-muted border-border'
                  }`}
                >
                  <SplitText text={tag} onHover={handleHover} onLeave={handleLeave} />
                </span>
              ))}
            </div>

            <div
              className={`pt-6 border-t border-border flex items-center justify-between text-xs tracking-widest uppercase transition-colors duration-300 ${
                isActive ? 'text-silver' : 'text-muted'
              }`}
            >
              <span>
                <SplitText
                  text={`METRIC: ${project.metrics}`}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              </span>
              <span className={isActive ? 'text-offwhite' : 'text-muted'}>
                [ 0{idx + 1} / 04 ] &darr;
              </span>
            </div>
          </section>
        );
      })}

      {/* 06. Focus Areas Section */}
      {(() => {
        const isActive = activeSection === 'expertise';
        return (
          <section
            id="expertise"
            data-section-id="expertise"
            className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border cursor-default"
          >
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 md:mb-20">
              <h2
                className={`text-4xl md:text-6xl font-bold uppercase tracking-tight transition-colors duration-300 ${
                  isActive ? 'text-offwhite' : 'text-muted'
                }`}
              >
                <SplitText text="FOCUS AREAS" onHover={handleHover} onLeave={handleLeave} />
              </h2>
              <div className="flex items-center justify-between mt-4 md:mt-0">
                <span
                  className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? 'text-silver' : 'text-muted'
                  }`}
                >
                  <SplitText
                    text="[ CORE COMPETENCIES ]"
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                </span>
                <span
                  className={`md:hidden text-xs font-mono tracking-widest transition-colors duration-300 ${
                    isActive ? 'text-offwhite' : 'text-muted'
                  }`}
                >
                  [ 0{activeFocusIndex + 1} / 03 ]
                </span>
              </div>
            </div>

            <div
              ref={focusContainerRef}
              className="relative flex md:grid md:grid-cols-3 gap-8 md:gap-16 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none w-full scroll-smooth hide-scrollbar touch-pan-x overscroll-x-contain pb-6 md:pb-0"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {EXPERTISE.map((item, idx) => {
                const isItemActive = isActive && (!isMobile || activeFocusIndex === idx);
                return (
                  <div
                    key={item.area}
                    ref={(el) => (cardsRef.current[idx] = el)}
                    tabIndex={0}
                    className="w-full md:w-auto shrink-0 md:shrink snap-center md:snap-align-none flex flex-col justify-between cursor-default outline-none transition-colors duration-300"
                  >
                    <div>
                      <span
                        className={`text-xs tracking-widest block mb-4 transition-colors duration-300 ${
                          isItemActive ? 'text-silver' : 'text-muted'
                        }`}
                      >
                        <SplitText
                          text={item.area}
                          onHover={handleHover}
                          onLeave={handleLeave}
                        />
                      </span>
                      <h3
                        className={`text-2xl font-bold uppercase tracking-tight mb-6 transition-colors duration-300 ${
                          isItemActive ? 'text-offwhite' : 'text-muted'
                        }`}
                      >
                        <SplitText
                          text={item.title}
                          onHover={handleHover}
                          onLeave={handleLeave}
                        />
                      </h3>
                      <p
                        className={`text-base leading-relaxed transition-colors duration-300 ${
                          isItemActive ? 'text-silver' : 'text-muted'
                        }`}
                      >
                        <SplitText
                          text={item.detail}
                          onHover={handleHover}
                          onLeave={handleLeave}
                        />
                        {!isHovering &&
                          isItemActive &&
                          (isMobile ? true : idx === EXPERTISE.length - 1) && (
                            <Blinker />
                          )}
                      </p>
                    </div>

                    {/* Mobile bottom indicator & navigation */}
                    <div
                      className={`mt-10 pt-4 border-t border-border flex md:hidden items-center justify-between text-xs tracking-widest uppercase transition-colors duration-300 ${
                        isItemActive ? 'text-silver' : 'text-muted'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => scrollToCompetency(Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="hover:text-offwhite transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default"
                      >
                        &larr; PREV
                      </button>
                      <span className={isItemActive ? 'text-offwhite' : 'text-muted'}>
                        [ 0{idx + 1} / 03 ]
                      </span>
                      <button
                        type="button"
                        onClick={() => scrollToCompetency(Math.min(EXPERTISE.length - 1, idx + 1))}
                        disabled={idx === EXPERTISE.length - 1}
                        className="hover:text-offwhite transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default"
                      >
                        NEXT &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* 07. Contact & Transmission Section with Footer */}
      {(() => {
        const isActive = activeSection === 'contact';
        return (
          <section
            id="contact"
            data-section-id="contact"
            className="min-h-[100dvh] snap-start flex flex-col justify-between px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border pt-20 pb-12 cursor-default"
          >
            <div>
              <p
                className={`text-xs tracking-widest uppercase mb-6 transition-colors duration-300 ${
                  isActive ? 'text-silver' : 'text-muted'
                }`}
              >
                <SplitText
                  text="| INITIATE TRANSMISSION"
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              </p>
              <h2
                className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight transition-colors duration-300 mb-12 ${
                  isActive ? 'text-offwhite' : 'text-muted'
                }`}
              >
                <SplitText
                  text="LET'S BUILD THE"
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
                <br />
                <span>
                  <SplitText
                    text="NEXT PARADIGM."
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                  {!isHovering && isActive && <Blinker />}
                </span>
              </h2>
              <div
                className={`flex flex-wrap gap-8 text-base md:text-xl transition-colors duration-300 ${
                  isActive ? 'text-silver' : 'text-muted'
                }`}
              >
                <a
                  href="mailto:contact@example.com"
                  className="border-b border-border pb-1 hover:border-offwhite hover:text-offwhite focus:border-offwhite focus:text-offwhite transition-colors"
                >
                  <SplitText text="EMAIL →" onHover={handleHover} onLeave={handleLeave} />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-border pb-1 hover:border-offwhite hover:text-offwhite focus:border-offwhite focus:text-offwhite transition-colors"
                >
                  <SplitText
                    text="GITHUB →"
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-border pb-1 hover:border-offwhite hover:text-offwhite focus:border-offwhite focus:text-offwhite transition-colors"
                >
                  <SplitText
                    text="X | TWITTER →"
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-border pb-1 hover:border-offwhite hover:text-offwhite focus:border-offwhite focus:text-offwhite transition-colors"
                >
                  <SplitText
                    text="LINKEDIN →"
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                </a>
              </div>
            </div>

            {/* Footer */}
            <footer
              className={`pt-16 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs tracking-widest uppercase space-y-4 sm:space-y-0 transition-colors duration-300 ${
                isActive ? 'text-silver' : 'text-muted'
              }`}
            >
              <div>
                <span>
                  &copy; {new Date().getFullYear()} | ALL PROTOCOLS RESERVED
                </span>
              </div>
              <div>
                <span>MONOSPACE | NO_OS_UI | SNAP_Y | 0_RADIUS</span>
              </div>
            </footer>
          </section>
        );
      })()}
    </div>
  );
}
