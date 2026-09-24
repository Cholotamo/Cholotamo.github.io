import React, { useEffect, useRef } from 'react';
import SpawnWindowDemo from './SpawnWindowDemo';

/**
 * Demo Registry maps a string ID (specified in Google Sheet `demo_id` column)
 * to either:
 * 1. A React component (which receives the parsed `demo_config` object as props)
 * 2. A vanilla JavaScript setup function: `(domElement, config) => cleanupFunction`
 */
export const DEMO_REGISTRY = {
  'spawn-window': SpawnWindowDemo,
  
  // Example of a pure vanilla JavaScript demo registering directly:
  'vanilla-canvas': {
    type: 'vanilla',
    init: (container, config = {}) => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      canvas.style.border = '1px solid #30271d';
      canvas.style.backgroundColor = '#0a0806';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let animId;
      let angle = 0;
      const speed = config.speed || 0.05;
      const amplitude = config.amplitude || 20;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#705a42';
        ctx.fillRect(
          canvas.width / 2 - 10 + Math.sin(angle) * amplitude,
          canvas.height / 2 - 10,
          20,
          20
        );
        angle += speed;
        animId = requestAnimationFrame(render);
      };
      render();

      // Return cleanup
      return () => {
        cancelAnimationFrame(animId);
        if (container.contains(canvas)) {
          container.removeChild(canvas);
        }
      };
    },
  },
};

/**
 * Universal Demo Renderer
 * Takes demoId and demoConfig (raw JSON string or parsed object)
 * and correctly renders either a React Component or executes a Vanilla JS routine.
 */
export function DemoRenderer({ demoId, demoConfig }) {
  const containerRef = useRef(null);

  // Parse config safely
  let config = {};
  if (typeof demoConfig === 'string' && demoConfig.trim().length > 0) {
    try {
      config = JSON.parse(demoConfig);
    } catch (e) {
      console.warn(`[DemoRenderer] Could not parse demoConfig for "${demoId}":`, e);
    }
  } else if (typeof demoConfig === 'object' && demoConfig !== null) {
    config = demoConfig;
  }

  const DemoEntry = DEMO_REGISTRY[demoId];

  // If entry is vanilla JS runner:
  useEffect(() => {
    if (DemoEntry?.type === 'vanilla' && typeof DemoEntry.init === 'function') {
      const domNode = containerRef.current;
      if (!domNode) return;
      const cleanup = DemoEntry.init(domNode, config);
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [demoId, JSON.stringify(config)]);

  if (!DemoEntry) {
    return null;
  }

  // If entry is a Vanilla JS runner
  if (DemoEntry.type === 'vanilla') {
    return (
      <div className="mt-8 border border-border p-4 bg-background">
        <div className="text-xs text-muted mb-2 font-mono">
          [VANILLA JS RUNTIME :: {demoId}]
        </div>
        <div ref={containerRef} />
      </div>
    );
  }

  // If entry is a React Component
  const ReactComponent = DemoEntry;
  return <ReactComponent {...config} />;
}
