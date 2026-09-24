import React from 'react';
import SplitText from './SplitText';
import Blinker from './Blinker';

export default function FocusSection({
  expertise = [],
  activeSection,
  activeFocusIndex,
  isMobile,
  isHovering,
  handleHover,
  handleLeave,
  focusContainerRef,
  cardsRef,
  scrollToCompetency,
}) {
  const isActive = activeSection === 'expertise';
  const totalCount = expertise.length;
  const totalFormatted = String(totalCount).padStart(2, '0');

  return (
    <section
      id="expertise"
      data-section-id="expertise"
      className="min-h-[100dvh] snap-start flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border cursor-default py-12"
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
            [ {String(activeFocusIndex + 1).padStart(2, '0')} / {totalFormatted} ]
          </span>
        </div>
      </div>

      <div
        ref={focusContainerRef}
        className={`relative flex md:grid ${
          totalCount <= 2
            ? 'md:grid-cols-2'
            : totalCount === 3
            ? 'md:grid-cols-3'
            : 'md:grid-cols-4'
        } gap-8 md:gap-16 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none w-full scroll-smooth hide-scrollbar touch-pan-x overscroll-x-contain pb-6 md:pb-0`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {expertise.map((item, idx) => {
          const isItemActive = isActive && (!isMobile || activeFocusIndex === idx);
          return (
            <div
              key={item.area || idx}
              ref={(el) => {
                if (cardsRef?.current) cardsRef.current[idx] = el;
              }}
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
                    (isMobile ? true : idx === expertise.length - 1) && (
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
                  [ {String(idx + 1).padStart(2, '0')} / {totalFormatted} ]
                </span>
                <button
                  type="button"
                  onClick={() => scrollToCompetency(Math.min(expertise.length - 1, idx + 1))}
                  disabled={idx === expertise.length - 1}
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
}
