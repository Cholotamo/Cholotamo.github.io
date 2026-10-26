import React, { useRef } from 'react';
import marketAnalysisHtml from './Market_Analysis_Pipeline_Animated_Demo.html?raw';

/**
 * Embedded interactive walkthrough for Regional Renewables Market Analysis Pipeline.
 * Loaded via raw HTML import and rendered inside a sandboxed iframe.
 *
 * Configurable via Google Sheets `demo_config` JSON column:
 * e.g., {"height": 650, "title": "REGIONAL MARKET ANALYSIS"}
 */
export default function MarketAnalysisDemo({
  title = 'REGIONAL RENEWABLES MARKET ANALYSIS PIPELINE',
  height = 640,
}) {
  const iframeRef = useRef(null);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      }
    }
  };

  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="mt-6 border border-border bg-background p-3 md:p-4 font-mono text-xs w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between border-b border-border pb-2 mb-3 text-silver gap-2">
        <span className="tracking-widest flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-silver"></span>
          DEMO :: {title}
        </span>
        <div className="flex items-center gap-4 text-muted">
          <button
            type="button"
            onClick={handleFullscreen}
            className="hover:text-silver text-muted transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
          >
            [ FULLSCREEN ]
          </button>
          <span className="tracking-wider hidden sm:inline">
            RUNTIME: <span className="text-silver">INTERACTIVE</span>
          </span>
        </div>
      </div>

      <div className="w-full relative overflow-hidden border border-border bg-[#0a0806]">
        <iframe
          ref={iframeRef}
          srcDoc={marketAnalysisHtml}
          title={title}
          style={{
            width: '100%',
            height: formattedHeight,
            border: 'none',
            display: 'block',
          }}
          allow="fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}
