import React from 'react';
import SplitText from './SplitText';
import Blinker from './Blinker';

export default function HeroSection({
  siteInfo,
  activeSection,
  isHovering,
  handleHover,
  handleLeave,
}) {
  const isActive = activeSection === 'hero';

  const subtitle = siteInfo?.heroSubtitle || '| AI SOLUTIONS DEVELOPER & BUSINESS DRIVER';
  const titleLines = siteInfo?.heroTitleLines || ['CREATIVE', 'AGENTIC', 'SOLUTIONS.'];
  const description =
    siteInfo?.heroDescription ||
    'Specializing in designing AI-driven solutions for real world problems.';

  return (
    <section
      data-section-id="hero"
      className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto cursor-default"
    >
      <p
        className={`text-sm md:text-base tracking-widest uppercase mb-8 transition-colors duration-300 ${
          isActive ? 'text-silver' : 'text-muted'
        }`}
      >
        <SplitText text={subtitle} onHover={handleHover} onLeave={handleLeave} />
      </p>
      <h1
        className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.95] uppercase mb-12 transition-colors duration-300 ${
          isActive ? 'text-offwhite' : 'text-muted'
        }`}
      >
        {titleLines.map((line, idx) => (
          <React.Fragment key={idx}>
            {idx === titleLines.length - 1 ? (
              <span>
                <SplitText text={line} onHover={handleHover} onLeave={handleLeave} />
              </span>
            ) : (
              <>
                <SplitText text={line} onHover={handleHover} onLeave={handleLeave} />
                <br />
              </>
            )}
          </React.Fragment>
        ))}
      </h1>
      <p
        className={`text-xl sm:text-2xl md:text-3xl max-w-4xl leading-relaxed font-normal transition-colors duration-300 ${
          isActive ? 'text-silver' : 'text-muted'
        }`}
      >
        <SplitText text={description} onHover={handleHover} onLeave={handleLeave} />
        {!isHovering && isActive && <Blinker />}
      </p>
    </section>
  );
}
