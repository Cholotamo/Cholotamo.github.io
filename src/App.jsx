import React, { useState, useEffect, useRef, useMemo } from 'react';
import FloatingCLI from './components/FloatingCLI';
import HeroSection from './components/HeroSection';
import ProjectSection from './components/ProjectSection';
import FocusSection from './components/FocusSection';
import ContactSection from './components/ContactSection';
import {
  DEFAULT_PROJECTS,
  DEFAULT_EXPERTISE,
  DEFAULT_SITE_INFO,
} from './data/defaultContent';
import { fetchAllPortfolioData } from './services/sheetsService';

export default function App() {
  const containerRef = useRef(null);
  const focusContainerRef = useRef(null);
  const cardsRef = useRef([]);

  const [siteInfo, setSiteInfo] = useState(DEFAULT_SITE_INFO);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [expertise, setExpertise] = useState(DEFAULT_EXPERTISE);

  const [activeSection, setActiveSection] = useState('hero');
  const [activeFocusIndex, setActiveFocusIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const handleHover = () => setIsHovering(true);
  const handleLeave = () => setIsHovering(false);

  // Dynamic CLI section names based on projects & focus areas
  const sectionNames = useMemo(() => {
    return [
      'hero',
      ...projects.map((p) => `system-${p.id}`),
      'focus-areas',
      'transmission',
    ];
  }, [projects]);

  const coreNames = useMemo(() => {
    return expertise.map((_, idx) => `core-0${idx + 1}`);
  }, [expertise]);

  // Load dynamic data from Google Sheets (or fallback)
  useEffect(() => {
    let isMounted = true;
    fetchAllPortfolioData().then((data) => {
      if (isMounted) {
        if (data.projects?.length > 0) setProjects(data.projects);
        if (data.expertise?.length > 0) setExpertise(data.expertise);
        if (data.siteInfo) setSiteInfo(data.siteInfo);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 600);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hContainer = focusContainerRef.current;
    if (!hContainer) return;

    const handleFocusScroll = () => {
      const children = hContainer.children;
      if (!children || children.length < 2) return;
      const step = children[1].offsetLeft - children[0].offsetLeft;
      if (!step || step <= 0) return;
      const exactIndex = hContainer.scrollLeft / step;
      const nearest = Math.max(0, Math.min(expertise.length - 1, Math.round(exactIndex)));
      setActiveFocusIndex(nearest);
    };

    hContainer.addEventListener('scroll', handleFocusScroll, { passive: true });
    return () => hContainer.removeEventListener('scroll', handleFocusScroll);
  }, [expertise.length]);

  const scrollToCompetency = (index) => {
    const hContainer = focusContainerRef.current;
    if (!hContainer) return;
    const children = hContainer.children;
    if (children && children[index]) {
      children[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) setActiveSection(id);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const sections = document.querySelectorAll('section[data-section-id]');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, [projects.length, expertise.length]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`scroll-container h-[100dvh] w-full overflow-y-auto snap-y snap-mandatory bg-background text-muted ${
        isScrolling ? 'is-scrolling' : ''
      }`}
    >
      <FloatingCLI
        containerRef={containerRef}
        horizontalContainerRef={focusContainerRef}
        activeSection={activeSection}
        sectionNames={sectionNames}
        coreNames={coreNames}
      />

      {/* 01. Hero Section */}
      <HeroSection
        siteInfo={siteInfo}
        activeSection={activeSection}
        isHovering={isHovering}
        handleHover={handleHover}
        handleLeave={handleLeave}
      />

      {/* 02 - N. Dedicated Project Sections (Dynamically Mapped) */}
      {projects.map((project, idx) => (
        <ProjectSection
          key={project.id}
          project={project}
          index={idx}
          totalProjects={projects.length}
          activeSection={activeSection}
          isHovering={isHovering}
          handleHover={handleHover}
          handleLeave={handleLeave}
        />
      ))}

      {/* Focus Areas Section */}
      <FocusSection
        expertise={expertise}
        activeSection={activeSection}
        activeFocusIndex={activeFocusIndex}
        isMobile={isMobile}
        isHovering={isHovering}
        handleHover={handleHover}
        handleLeave={handleLeave}
        focusContainerRef={focusContainerRef}
        cardsRef={cardsRef}
        scrollToCompetency={scrollToCompetency}
      />

      {/* Contact & Transmission Section with Footer */}
      <ContactSection
        siteInfo={siteInfo}
        activeSection={activeSection}
        isHovering={isHovering}
        handleHover={handleHover}
        handleLeave={handleLeave}
      />
    </div>
  );
}
