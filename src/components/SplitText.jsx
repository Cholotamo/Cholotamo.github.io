import React, { useState, useEffect } from 'react';
import { useFallback } from '../contexts/FallbackContext';

export default function SplitText({ text, className = '', onHover, onLeave }) {
  const isFallback = useFallback();
  const [currentText, setCurrentText] = useState(text || '');

  useEffect(() => {
    setCurrentText(text || '');
    if (!text || !isFallback) return;

    // Very prominent glitch/decryption effect
    const intervalId = setInterval(() => {
      setCurrentText((prev) => {
        const chars = prev.split('');
        // Target roughly 33% of characters for flipping on every tick
        const flipCount = Math.max(1, Math.floor(chars.length * 0.33));

        let flipped = 0;
        let attempts = 0;
        const maxAttempts = chars.length * 2;

        // Randomly target and flip '0's and '1's
        while (flipped < flipCount && attempts < maxAttempts) {
          const idx = Math.floor(Math.random() * chars.length);
          if (chars[idx] === '0') {
            chars[idx] = '1';
            flipped++;
          } else if (chars[idx] === '1') {
            chars[idx] = '0';
            flipped++;
          }
          attempts++;
        }

        return chars.join('');
      });
    }, 50); // Faster interval for frantic movement

    return () => clearInterval(intervalId);
  }, [text, isFallback]);

  if (!text) return null;
  const words = currentText.split(' ');
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
