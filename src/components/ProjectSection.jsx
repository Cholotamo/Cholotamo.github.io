import React, { useState, useEffect, useRef } from 'react';
import SplitText from './SplitText';
import Blinker from './Blinker';
import { DemoRenderer } from '../demos/DemoRegistry';

export default function ProjectSection({
  project,
  index,
  totalProjects,
  activeSection,
  isHovering,
  handleHover,
  handleLeave,
  onRegisterContainer,
}) {
  const sectionId = `system-${project.id}`;
  const isActive = activeSection === sectionId;

  const totalFormatted = String(totalProjects).padStart(2, '0');
  const indexFormatted = String(index + 1).padStart(2, '0');

  const pagesContainerRef = useRef(null);
  const pageCardsRef = useRef([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Normalize pages array for backwards compatibility
  const rawPages =
    Array.isArray(project.pages) && project.pages.length > 0
      ? project.pages
      : [
          {
            pageTitle: project.pageTitle || '',
            description: project.description || '',
            tags: project.tags || [],
            metrics: project.metrics || '',
            link: project.link || '#',
            demoId: project.demoId || '',
            demoConfig: project.demoConfig || '',
          },
        ];

  // Register the horizontal pages container with the parent orchestration layer
  useEffect(() => {
    if (onRegisterContainer && pagesContainerRef.current) {
      onRegisterContainer(project.id, pagesContainerRef.current);
    }
    return () => {
      if (onRegisterContainer) {
        onRegisterContainer(project.id, null);
      }
    };
  }, [project.id, onRegisterContainer]);

  // Track active page index on horizontal scroll
  useEffect(() => {
    const container = pagesContainerRef.current;
    if (!container || rawPages.length < 2) return;

    const handleScroll = () => {
      const scrollX = container.scrollLeft;
      const width = container.clientWidth || 1;
      const nearest = Math.max(
        0,
        Math.min(rawPages.length - 1, Math.round(scrollX / width))
      );
      setActivePageIndex(nearest);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [rawPages.length]);

  const scrollToPage = (pIdx) => {
    const container = pagesContainerRef.current;
    if (!container) return;
    const target = pageCardsRef.current[pIdx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  return (
    <section
      data-section-id={sectionId}
      tabIndex={0}
      className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border cursor-default outline-none py-12"
    >
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8">
        <span
          className={`text-xs md:text-sm tracking-widest uppercase transition-colors duration-300 ${
            isActive ? 'text-silver' : 'text-muted'
          }`}
        >
          <SplitText
            text={`| SYSTEM ${project.id} OF ${totalFormatted} — ${project.category}`}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </span>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          {rawPages.length > 1 && (
            <span
              className={`text-xs md:text-sm font-mono tracking-widest uppercase transition-colors duration-300 ${
                isActive ? 'text-offwhite' : 'text-muted'
              }`}
            >
              [ PAGE {String(activePageIndex + 1).padStart(2, '0')} / {String(rawPages.length).padStart(2, '0')} ]
            </span>
          )}
          <span
            className={`text-xs md:text-sm tracking-widest uppercase transition-colors duration-300 ${
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
      </div>

      {/* Static Project Title */}
      <h2
        className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight transition-colors duration-300 mb-8 leading-[0.95] ${
          isActive ? 'text-offwhite' : 'text-muted'
        }`}
      >
        <SplitText text={project.title} onHover={handleHover} onLeave={handleLeave} />
      </h2>

      {/* Horizontal Scrollable Pages Container */}
      <div
        ref={pagesContainerRef}
        className="relative flex overflow-x-auto snap-x snap-mandatory w-full scroll-smooth hide-scrollbar touch-pan-x gap-8 md:gap-16 pb-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {rawPages.map((page, pIdx) => {
          const pageTags = Array.isArray(page.tags)
            ? page.tags
            : typeof page.tags === 'string'
            ? page.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : [];

          const isPageActive = isActive && activePageIndex === pIdx;

          return (
            <div
              key={pIdx}
              ref={(el) => {
                if (pageCardsRef.current) pageCardsRef.current[pIdx] = el;
              }}
              tabIndex={0}
              className="w-full shrink-0 snap-center flex flex-col justify-center cursor-default outline-none transition-colors duration-300"
            >
              {page.pageTitle && (
                <div
                  className={`text-xs md:text-sm font-mono tracking-widest uppercase mb-4 transition-colors duration-300 ${
                    isPageActive ? 'text-silver' : 'text-muted'
                  }`}
                >
                  [ {page.pageTitle} ]
                </div>
              )}

              <p
                className={`text-lg sm:text-xl md:text-2xl max-w-4xl leading-relaxed mb-8 transition-colors duration-300 ${
                  isPageActive ? 'text-silver' : 'text-muted'
                }`}
              >
                <SplitText
                  text={page.description}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
                {!isHovering && isPageActive && <Blinker />}
              </p>

              {/* Render Tags for this page */}
              {pageTags.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {pageTags.map((tag) => (
                    <span
                      key={tag}
                      className={`border px-3 py-1 text-xs tracking-wider uppercase transition-colors duration-300 ${
                        isPageActive
                          ? 'text-offwhite border-border-active'
                          : 'text-muted border-border'
                      }`}
                    >
                      <SplitText text={tag} onHover={handleHover} onLeave={handleLeave} />
                    </span>
                  ))}
                </div>
              )}

              {/* Render Embedded JS Demo if configured */}
              {page.demoId && (
                <div
                  className={`mb-8 transition-opacity duration-300 ${
                    isPageActive ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <DemoRenderer
                    demoId={page.demoId}
                    demoConfig={page.demoConfig}
                  />
                </div>
              )}

              {/* Metric & In-system Navigation Controls */}
              <div
                className={`pt-6 border-t border-border flex items-center justify-between text-xs tracking-widest uppercase transition-colors duration-300 ${
                  isPageActive ? 'text-silver' : 'text-muted'
                }`}
              >
                <span>
                  {page.metrics ? (
                    <SplitText
                      text={`METRIC: ${page.metrics}`}
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  ) : (
                    <span className="text-muted">SYSTEM ONLINE</span>
                  )}
                </span>

                {rawPages.length > 1 && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => scrollToPage(Math.max(0, pIdx - 1))}
                      disabled={pIdx === 0}
                      className={`hover:text-offwhite transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default ${
                        isPageActive ? 'text-silver' : 'text-muted'
                      }`}
                    >
                      &larr; PREV
                    </button>
                    <span className={isPageActive ? 'text-offwhite' : 'text-muted'}>
                      [ {String(pIdx + 1).padStart(2, '0')} / {String(rawPages.length).padStart(2, '0')} ]
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToPage(Math.min(rawPages.length - 1, pIdx + 1))}
                      disabled={pIdx === rawPages.length - 1}
                      className={`hover:text-offwhite transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default ${
                        isPageActive ? 'text-silver' : 'text-muted'
                      }`}
                    >
                      NEXT &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Section Position Indicator */}
      <div
        className={`pt-4 border-t border-border flex items-center justify-between text-xs tracking-widest uppercase transition-colors duration-300 ${
          isActive ? 'text-silver' : 'text-muted'
        }`}
      >
        <span className="text-muted">SYSTEM {project.id}</span>
        <span className={isActive ? 'text-offwhite' : 'text-muted'}>
          [ {indexFormatted} / {totalFormatted} ] &darr;
        </span>
      </div>
    </section>
  );
}
