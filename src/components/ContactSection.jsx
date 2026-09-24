import React from 'react';
import SplitText from './SplitText';
import Blinker from './Blinker';

export default function ContactSection({
  siteInfo,
  activeSection,
  isHovering,
  handleHover,
  handleLeave,
}) {
  const isActive = activeSection === 'contact';

  const tag = siteInfo?.contactTag || '| INITIATE TRANSMISSION';
  const line1 = siteInfo?.contactHeadingLine1 || "LET'S BUILD THE";
  const line2 = siteInfo?.contactHeadingLine2 || 'NEXT PARADIGM.';
  const links = siteInfo?.socialLinks || [
    { label: 'EMAIL →', url: 'mailto:contact@example.com' },
    { label: 'GITHUB →', url: 'https://github.com' },
    { label: 'X | TWITTER →', url: 'https://x.com' },
    { label: 'LINKEDIN →', url: 'https://linkedin.com' },
  ];
  const footerLeft = siteInfo?.footerTextLeft || 'ALL PROTOCOLS RESERVED';
  const footerRight =
    siteInfo?.footerTextRight || 'MONOSPACE | NO_OS_UI | SNAP_Y | 0_RADIUS';

  return (
    <section
      id="contact"
      data-section-id="contact"
      className="min-h-[100dvh] snap-start flex flex-col justify-between px-6 md:px-16 lg:px-24 max-w-7xl mx-auto border-t border-border pt-20 pb-12 cursor-default"
    >
      <div>
        <p
          className={`text-xs tracking-widest uppercase mb-6 transition-colors duration-300 ${
            isActive ? 'text-silver' : 'text-muted'
          }`}
        >
          <SplitText text={tag} onHover={handleHover} onLeave={handleLeave} />
        </p>
        <h2
          className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight transition-colors duration-300 mb-12 ${
            isActive ? 'text-offwhite' : 'text-muted'
          }`}
        >
          <SplitText text={line1} onHover={handleHover} onLeave={handleLeave} />
          <br />
          <span>
            <SplitText text={line2} onHover={handleHover} onLeave={handleLeave} />
            {!isHovering && isActive && <Blinker />}
          </span>
        </h2>
        <div
          className={`flex flex-wrap gap-8 text-base md:text-xl transition-colors duration-300 ${
            isActive ? 'text-silver' : 'text-muted'
          }`}
        >
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target={link.url?.startsWith('http') ? '_blank' : undefined}
              rel={link.url?.startsWith('http') ? 'noreferrer' : undefined}
              className="border-b border-border pb-1 hover:border-offwhite hover:text-offwhite focus:border-offwhite focus:text-offwhite transition-colors"
            >
              <SplitText
                text={link.label}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`pt-16 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs tracking-widest uppercase space-y-4 sm:space-y-0 transition-colors duration-300 ${
          isActive ? 'text-silver' : 'text-muted'
        }`}
      >
        <div>
          <span>
            &copy; {new Date().getFullYear()} | {footerLeft}
          </span>
        </div>
        <div>
          <span>{footerRight}</span>
        </div>
      </footer>
    </section>
  );
}
