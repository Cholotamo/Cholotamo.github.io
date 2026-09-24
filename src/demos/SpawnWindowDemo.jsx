import React, { useState, useEffect } from 'react';

/**
 * Example embedded demo demonstrating configurable arguments from Google Sheets.
 * Props can be passed via Google Sheet `demo_config` JSON column.
 * e.g., {"title": "SWARM_NODE_01", "spawnX": 20, "spawnY": 15, "pingMs": 35}
 */
export default function SpawnWindowDemo({
  title = 'SUBROUTINE_TERMINAL',
  spawnX = 10,
  spawnY = 10,
  pingMs = 45,
  status = 'ONLINE',
}) {
  const [posX, setPosX] = useState(spawnX);
  const [posY, setPosY] = useState(spawnY);
  const [logs, setLogs] = useState([
    `[INIT] ${title} INITIALIZED`,
    `[ORIGIN] COORD: [X: ${spawnX}%, Y: ${spawnY}px]`,
    `[METRIC] PING LATENCY: ${pingMs}ms`,
  ]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 9999);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRespawn = (customX, customY) => {
    const nextX = customX !== undefined ? customX : Math.floor(Math.random() * 40);
    const nextY = customY !== undefined ? customY : Math.floor(Math.random() * 30);
    setPosX(nextX);
    setPosY(nextY);
    setLogs((prev) => [
      `[EVENT] RE-ANCHORED TO [X: ${nextX}%, Y: ${nextY}px]`,
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="mt-8 border border-border bg-background p-4 font-mono text-xs max-w-2xl">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-3 text-silver">
        <span className="tracking-widest flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-silver"></span>
          DEMO :: {title}
        </span>
        <span className="text-muted tracking-wider">
          STATUS: <span className="text-silver">{status}</span> | TICK: {String(tick).padStart(4, '0')}
        </span>
      </div>

      {/* Interactive area showing positioning based on arguments */}
      <div className="relative h-36 bg-[#0e0c0a] border border-border overflow-hidden mb-3 p-2">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#705a42_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        {/* Spawned window */}
        <div
          style={{
            transform: `translate(${posX * 2}px, ${posY}px)`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="border border-border-active bg-background p-2 inline-block shadow-none select-none"
        >
          <div className="text-[10px] text-silver border-b border-border pb-1 mb-1 font-bold">
            ▸ WINDOW_NODE [X:{posX} Y:{posY}]
          </div>
          <div className="text-[10px] text-muted">
            ARG_LATENCY: {pingMs}ms
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        <div className="text-muted text-[11px]">
          CONFIGURED VIA SHEET: <span className="text-silver">posX={posX}</span>, <span className="text-silver">posY={posY}</span>
        </div>
        <button
          type="button"
          onClick={() => handleRespawn()}
          className="border border-border px-3 py-1 hover:border-offwhite hover:text-offwhite text-silver transition-colors cursor-pointer"
        >
          RE-TRIGGER POSITION FUNCT()
        </button>
      </div>

      {/* Telemetry output */}
      <div className="mt-3 bg-[#080605] border border-border/60 p-2 text-[10px] text-muted space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="tracking-wider">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
