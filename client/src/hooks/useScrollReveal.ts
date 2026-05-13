/*
 * SKINPECCABLE GLOWTIQUE — useScrollReveal
 * Adds 'visible' class to elements with 'reveal' class when they enter the viewport
 */

import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
    }, 50);
    return () => clearTimeout(timer);
  }, []);
}
