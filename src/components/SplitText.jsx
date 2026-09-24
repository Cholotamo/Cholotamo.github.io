import React from 'react';

export default function SplitText({ text, className = '', onHover, onLeave }) {
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
