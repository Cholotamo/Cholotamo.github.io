import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import marketAnalysisHtml from './Market_Analysis_Pipeline_Animated_Demo.html?raw';

/**
 * Floating HUD interactive walkthrough for Regional Renewables Market Analysis Pipeline.
 * 
 * - Renders a sleek, zero-footprint button in the project row.
 * - Spawns a floating window that stays on-screen and floats over the portfolio as the user scrolls.
 * - Draggable by titlebar, minimizable into a corner dock, and expandable to fullscreen.
 */
export default function MarketAnalysisDemo({
  title = 'REGIONAL RENEWABLES MARKET ANALYSIS PIPELINE',
  height = 500,
  autoOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Dragging coordinates
  const [pos, setPos] = useState(null); // { x, y }
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });
  const windowRef = useRef(null);
  const iframeRef = useRef(null);

  // Mouse drag handling
  const handleMouseDown = (e) => {
    // Only drag on left click and not on control buttons
    if (e.button !== 0 || e.target.closest('button')) return;
    if (isMaximized) return; // Don't drag while maximized

    const win = windowRef.current;
    if (!win) return;
    const rect = win.getBoundingClientRect();

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: rect.left,
      initY: rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const winW = windowRef.current?.offsetWidth || 760;
      const winH = windowRef.current?.offsetHeight || 500;

      // Keep within viewport bounds
      const minX = 10;
      const maxX = Math.max(minX, window.innerWidth - winW - 10);
      const minY = 10;
      const maxY = Math.max(minY, window.innerHeight - winH - 10);

      const nextX = Math.max(minX, Math.min(maxX, dragRef.current.initX + dx));
      const nextY = Math.max(minY, Math.min(maxY, dragRef.current.initY + dy));

      setPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <>
      {/* 1. Sleek inline trigger button that takes zero disruptive space in project rows */}
      <div className="my-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group inline-flex items-center gap-3 border border-border hover:border-offwhite bg-[#0e0c0a] hover:bg-[#16120e] px-4 py-2.5 text-xs font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer text-silver hover:text-offwhite shadow-sm"
        >
          <span
            className={`w-2 h-2 transition-colors ${
              isOpen && !isMinimized
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-silver group-hover:bg-offwhite'
            }`}
          />
          <span>
            {isOpen && !isMinimized
              ? '[ DEMO ACTIVE :: FOCUS FLOATING WINDOW ]'
              : `[ ▶ LAUNCH FLOATING DEMO :: ${title} ]`}
          </span>
          <span className="text-muted text-[10px] ml-1">▸ HUD OVERLAY</span>
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-silver text-[11px] font-mono tracking-wider uppercase underline underline-offset-4 cursor-pointer"
          >
            [ CLOSE WINDOW ]
          </button>
        )}
      </div>

      {/* 2. Floating Window Portal (rendered outside the scroll container directly into document.body) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          isMinimized ? (
            /* Minimized Dock Pill at Bottom Right */
            <div
              className="fixed bottom-6 right-6 z-[9999] bg-[#0a0806] border border-border shadow-2xl p-3 flex items-center gap-3 font-mono text-xs select-none"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <span className="inline-block w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="text-silver tracking-wider uppercase font-bold text-[11px]">
                DEMO DOCKED: {title}
              </span>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="border border-border px-2 py-0.5 text-muted hover:text-offwhite hover:border-border-active transition-colors uppercase text-[10px] cursor-pointer"
              >
                [ RESTORE ]
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="text-muted hover:text-offwhite px-1 text-xs cursor-pointer"
                title="Close Demo"
              >
                ✕
              </button>
            </div>
          ) : (
            /* Active Floating HUD Window */
            <div
              ref={windowRef}
              style={
                isMaximized
                  ? {
                      position: 'fixed',
                      top: '16px',
                      left: '16px',
                      right: '16px',
                      bottom: '16px',
                      zIndex: 9999,
                    }
                  : pos
                  ? {
                      position: 'fixed',
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      zIndex: 9999,
                    }
                  : {
                      position: 'fixed',
                      bottom: '24px',
                      right: '24px',
                      zIndex: 9999,
                    }
              }
              className={`flex flex-col bg-[#0a0806] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.85)] font-mono text-xs ${
                isMaximized
                  ? 'w-auto h-auto'
                  : 'w-[94vw] sm:w-[680px] md:w-[760px] lg:w-[820px] max-w-[96vw]'
              }`}
            >
              {/* Window Titlebar & Drag Handle */}
              <div
                onMouseDown={handleMouseDown}
                className={`flex items-center justify-between border-b border-border bg-[#120e0a] px-3 py-2 select-none ${
                  isMaximized ? 'cursor-default' : 'cursor-move'
                }`}
              >
                <div className="flex items-center gap-2 text-silver truncate pr-2">
                  <span className="text-muted tracking-tight text-xs">⠿</span>
                  <span className="inline-block w-1.5 h-1.5 bg-silver" />
                  <span className="tracking-widest font-bold uppercase truncate text-[11px] sm:text-xs">
                    {title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted shrink-0">
                  <span className="hidden md:inline text-[10px] tracking-wider text-muted mr-2">
                    [ DRAGGABLE HUD ]
                  </span>
                  
                  {/* Minimize Button */}
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="hover:text-offwhite hover:border-border px-1.5 py-0.5 border border-transparent text-[11px] cursor-pointer"
                    title="Minimize into floating dock"
                  >
                    —
                  </button>

                  {/* Maximize / Restore Button */}
                  <button
                    type="button"
                    onClick={toggleMaximize}
                    className="hover:text-offwhite hover:border-border px-1.5 py-0.5 border border-transparent text-[11px] cursor-pointer"
                    title={isMaximized ? 'Restore Window' : 'Maximize Window'}
                  >
                    {isMaximized ? '❐' : '⛶'}
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="hover:text-red-400 hover:border-red-900/50 px-1.5 py-0.5 border border-transparent text-xs cursor-pointer font-bold ml-1"
                    title="Close Window"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Window Body: Interactive Iframe */}
              <div
                className="relative w-full bg-[#0a0806] overflow-hidden"
                style={{
                  height: isMaximized ? 'calc(100% - 36px)' : formattedHeight,
                }}
              >
                {/* Pointer events overlay while dragging to prevent iframe capturing mouse events */}
                {isDragging && <div className="absolute inset-0 z-50 cursor-move" />}

                <iframe
                  ref={iframeRef}
                  srcDoc={marketAnalysisHtml}
                  title={title}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                  allow="fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>

              {/* Status footer bar */}
              <div className="flex items-center justify-between border-t border-border/80 bg-[#0c0907] px-3 py-1 text-[10px] text-muted tracking-wider uppercase select-none">
                <span className="truncate">
                  STATUS: <span className="text-silver">ONLINE</span> | CONTROLS: SPACE/ARROWS/F
                </span>
                <span className="hidden sm:inline">
                  FLOATING WINDOW RUNTIME
                </span>
              </div>
            </div>
          ),
          document.body
        )}
    </>
  );
}
