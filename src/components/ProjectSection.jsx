import React from 'react';
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
}) {
  const sectionId = `system-${project.id}`;
  const isActive = activeSection === sectionId;

  const totalFormatted = String(totalProjects).padStart(2, '0');
  const indexFormatted = String(index + 1).padStart(2, '0');

  // Ensure tags is always an array
  const tagsList = Array.isArray(project.tags)
    ? project.tags
    : typeof project.tags === 'string'
    ? project.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <section
      data-section-id={sectionId}
      tabIndex={0}
      className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border cursor-default outline-none py-12"
    >
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
        className={`text-lg sm:text-xl md:text-2xl max-w-4xl leading-relaxed mb-8 transition-colors duration-300 ${
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

      {/* Render Tags */}
      {tagsList.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {tagsList.map((tag) => (
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
      )}

      {/* Render Embedded JS Demo if configured */}
      {project.demoId && (
        <div className="mb-8">
          <DemoRenderer
            demoId={project.demoId}
            demoConfig={project.demoConfig}
          />
        </div>
      )}

      {/* Metric and Section Position Indicator */}
      <div
        className={`pt-6 border-t border-border flex items-center justify-between text-xs tracking-widest uppercase transition-colors duration-300 ${
          isActive ? 'text-silver' : 'text-muted'
        }`}
      >
        <span>
          {project.metrics ? (
            <SplitText
              text={`METRIC: ${project.metrics}`}
              onHover={handleHover}
              onLeave={handleLeave}
            />
          ) : (
            <span className="text-muted">SYSTEM ONLINE</span>
          )}
        </span>
        <span className={isActive ? 'text-offwhite' : 'text-muted'}>
          [ {indexFormatted} / {totalFormatted} ] &darr;
        </span>
      </div>
    </section>
  );
}
