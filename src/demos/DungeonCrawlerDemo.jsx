import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './dungeon-crawler-text.js';

/**
 * DungeonCrawlerDemo
 * 
 * Tailored to use the modular Web Component (<dungeon-terminal>):
 * - Renders a zero-row-footprint trigger button inside the project slide.
 * - On trigger, mounts <dungeon-terminal> directly inside the document scroll flow.
 * - Positioned absolutely so it scrolls naturally with document flow as users browse sections.
 * - Dual-terminal ecosystem: boots text adventure and spawns real-time synchronized ASCII map scanner.
 * - Configurable via Google Sheets `demo_config`: width, height, title, prompt, autoOpen.
 */
export default function DungeonCrawlerDemo({
  title = 'GENERATIVE EVOLUTION ENGINE',
  prompt = 'loremaster >',
  width = '450px',
  height = '450px',
  autoOpen = false,
  top = null,
  left = '40px',
}) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const terminalRef = useRef(null);
  const [scrollContainer, setScrollContainer] = useState(null);
  const [spawnTop, setSpawnTop] = useState(60);

  // Locate the portfolio scroll container on mount
  useEffect(() => {
    const container = document.querySelector('.scroll-container') || document.body;
    setScrollContainer(container);
  }, []);

  const handleLaunch = () => {
    if (scrollContainer) {
      // Calculate position relative to current scroll position so terminal opens in view
      const currentScroll = scrollContainer === document.body 
        ? window.scrollY 
        : scrollContainer.scrollTop;
      const computedTop = top !== null ? top : currentScroll + 70;
      setSpawnTop(computedTop);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Attach terminal-close listener to handle [X] button from the Web Component
  useEffect(() => {
    const termEl = terminalRef.current;
    if (!termEl) return;

    const onClose = (e) => {
      e.preventDefault();
      setIsOpen(false);
    };

    termEl.addEventListener('terminal-close', onClose);
    return () => {
      termEl.removeEventListener('terminal-close', onClose);
    };
  }, [isOpen]);

  return (
    <>
      {/* 1. Sleek inline trigger button that takes zero disruptive space in project rows */}
      <div className="my-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLaunch}
          className="group inline-flex items-center gap-3 border border-border hover:border-offwhite bg-[#0e0c0a] hover:bg-[#16120e] px-4 py-2.5 text-xs font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer text-silver hover:text-offwhite shadow-sm"
        >
          <span
            className={`w-2 h-2 transition-colors ${
              isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-silver group-hover:bg-offwhite'
            }`}
          />
          <span>
            {isOpen
              ? '[ TERMINAL ACTIVE :: FOCUS ]'
              : `[ ▶ LAUNCH TERMINAL :: ${title} ]`}
          </span>
          <span className="text-muted text-[10px] ml-1">▸ TERMINAL</span>
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-silver text-[11px] font-mono tracking-wider uppercase underline underline-offset-4 cursor-pointer"
          >
            [ CLOSE TERMINAL ]
          </button>
        )}
      </div>

      {/* 2. Mounts <dungeon-terminal> directly into the scroll flow via React Portal */}
      {isOpen &&
        scrollContainer &&
        createPortal(
          <dungeon-terminal
            ref={terminalRef}
            window-title={title}
            prompt={prompt}
            width={width}
            height={height}
            top={`${spawnTop}px`}
            left={left}
            style={{
              top: `${spawnTop}px`,
              left: left,
            }}
          />,
          scrollContainer
        )}
    </>
  );
}
