import React from 'react';

export default function Blinker({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline bg-offwhite text-background ml-1 animate-blink select-none ${className}`}
    >
      {'\u00A0'}
    </span>
  );
}
