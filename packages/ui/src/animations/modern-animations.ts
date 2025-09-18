/**
 * Modern UI Animations for Astral Core V2
 * Smooth, accessible animations following mental health app best practices
 */

// Animation keyframes - can be used with any CSS-in-JS solution
// If using @emotion/react, import { keyframes } from '@emotion/react'
// For now, we'll define keyframes as template strings

// Timing functions for natural motion
export const easings = {
  // Standard easing curves
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  // Smooth, calming easings for mental health context
  gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  smooth: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounce: 'cubic-bezier(0.87, -0.41, 0.19, 1.44)',
} as const;

// Duration presets (in milliseconds)
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
  // Specific use cases
  ripple: 600,
  fade: 200,
  slide: 350,
  expand: 400,
  collapse: 350,
} as const;

// Keyframe animations as CSS strings
export const animations = {
  // Fade animations
  fadeIn: `
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,
  
  fadeOut: `
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  `,

  // Scale animations
  scaleIn: `
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,

  scaleOut: `
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0);
      opacity: 0;
    }
  `,

  // Slide animations
  slideInFromLeft: `
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,

  slideInFromRight: `
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,

  slideInFromTop: `
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,

  slideInFromBottom: `
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,

  // Gentle pulse for attention (non-aggressive)
  gentlePulse: `
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  `,

  // Breathing animation for relaxation exercises
  breathe: `
    0% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.7;
    }
  `,

  // Ripple effect for interactive elements
  ripple: `
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  `,

  // Shimmer for loading states
  shimmer: `
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  `,

  // Float animation for subtle movement
  float: `
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  `,

  // Success checkmark animation
  checkmark: `
    0% {
      stroke-dashoffset: 100;
    }
    100% {
      stroke-dashoffset: 0;
    }
  `,

  // Smooth rotation for loading spinners
  rotate: `
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `,

  // Wave animation for water/calm themes
  wave: `
    0% {
      transform: translateX(0) translateZ(0) scaleY(1);
    }
    50% {
      transform: translateX(-25%) translateZ(0) scaleY(0.5);
    }
    100% {
      transform: translateX(-50%) translateZ(0) scaleY(1);
    }
  `,
};

// Transition presets
export const transitions = {
  // Base transitions
  all: (duration = durations.normal, easing = easings.standard) =>
    `all ${duration}ms ${easing}`,
  
  opacity: (duration = durations.fast, easing = easings.standard) =>
    `opacity ${duration}ms ${easing}`,
  
  transform: (duration = durations.normal, easing = easings.standard) =>
    `transform ${duration}ms ${easing}`,
  
  // Common combinations
  fade: `opacity ${durations.fade}ms ${easings.standard}`,
  
  slide: `transform ${durations.slide}ms ${easings.decelerate}`,
  
  scale: `transform ${durations.normal}ms ${easings.gentle}`,
  
  // Expand/Collapse for accordions
  expand: `max-height ${durations.expand}ms ${easings.decelerate}, opacity ${durations.fast}ms ${easings.standard}`,
  
  collapse: `max-height ${durations.collapse}ms ${easings.accelerate}, opacity ${durations.fast}ms ${easings.standard}`,
  
  // Color transitions (for theme switching)
  colors: `background-color ${durations.normal}ms ${easings.standard}, color ${durations.normal}ms ${easings.standard}, border-color ${durations.normal}ms ${easings.standard}`,
  
  // Shadow transitions (for elevation changes)
  shadow: `box-shadow ${durations.normal}ms ${easings.standard}`,
  
  // All properties with performance optimization
  allSafe: `opacity ${durations.normal}ms ${easings.standard}, transform ${durations.normal}ms ${easings.standard}, filter ${durations.normal}ms ${easings.standard}`,
};

// Animation utilities
export const animationUtils = {
  // Apply animation with accessibility considerations
  applyAnimation: (
    element: HTMLElement,
    animation: string,
    duration: number = durations.normal,
    easing: string = easings.standard
  ) => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip or simplify animation for users who prefer reduced motion
      element.style.transition = `opacity ${duration / 2}ms ${easing}`;
    } else {
      element.style.animation = `${animation} ${duration}ms ${easing}`;
    }
  },

  // Stagger animations for lists
  staggerChildren: (
    container: HTMLElement,
    childSelector: string,
    animation: string,
    staggerDelay: number = 50
  ) => {
    const children = container.querySelectorAll(childSelector);
    children.forEach((child, index) => {
      (child as HTMLElement).style.animationDelay = `${index * staggerDelay}ms`;
      (child as HTMLElement).style.animation = animation;
    });
  },

  // Intersection Observer for scroll animations
  observeForAnimation: (
    elements: NodeListOf<Element> | Element[],
    animationClass: string,
    options: IntersectionObserverInit = {}
  ) => {
    const defaultOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    }, defaultOptions);

    elements.forEach((element) => observer.observe(element));

    return observer;
  },

  // Smooth scroll with easing
  smoothScrollTo: (
    target: HTMLElement | number,
    duration: number = durations.slow,
    easing = easings.decelerate
  ) => {
    const startPosition = window.pageYOffset;
    const targetPosition = typeof target === 'number' ? target : target.offsetTop;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const easingFunction = (t: number): number => {
      // Convert CSS easing to mathematical function
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const scrollAnimation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easingFunction(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);

      if (elapsedTime < duration) {
        requestAnimationFrame(scrollAnimation);
      }
    };

    requestAnimationFrame(scrollAnimation);
  },

  // Debounced resize observer for responsive animations
  createResizeObserver: (
    callback: ResizeObserverCallback,
    debounceDelay: number = 100
  ): ResizeObserver => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(entries, observer), debounceDelay);
    };

    return new ResizeObserver(debouncedCallback);
  },
};

// CSS-in-JS helper for applying animations
export const animationStyles = {
  // Fade in on mount
  fadeInOnMount: {
    animation: `${animations.fadeIn} ${durations.normal}ms ${easings.standard}`,
  },

  // Scale in on mount
  scaleInOnMount: {
    animation: `${animations.scaleIn} ${durations.normal}ms ${easings.gentle}`,
  },

  // Slide in variants
  slideInLeft: {
    animation: `${animations.slideInFromLeft} ${durations.slide}ms ${easings.decelerate}`,
  },
  slideInRight: {
    animation: `${animations.slideInFromRight} ${durations.slide}ms ${easings.decelerate}`,
  },
  slideInTop: {
    animation: `${animations.slideInFromTop} ${durations.slide}ms ${easings.decelerate}`,
  },
  slideInBottom: {
    animation: `${animations.slideInFromBottom} ${durations.slide}ms ${easings.decelerate}`,
  },

  // Loading animation
  loading: {
    animation: `${animations.rotate} ${durations.slowest}ms linear infinite`,
  },

  // Shimmer effect
  shimmer: {
    background: 'linear-gradient(to right, #f0f0f0 8%, #f8f8f8 18%, #f0f0f0 33%)',
    backgroundSize: '800px 100px',
    animation: `${animations.shimmer} 1.5s linear infinite`,
  },

  // Breathing animation for mindfulness
  breathing: {
    animation: `${animations.breathe} 4000ms ${easings.smooth} infinite`,
  },

  // Floating animation
  floating: {
    animation: `${animations.float} 3000ms ${easings.smooth} infinite`,
  },

  // Pulse for notifications
  pulse: {
    animation: `${animations.gentlePulse} 2000ms ${easings.gentle} infinite`,
  },
};

// React hooks for animations (if using React)
export const useAnimation = {
  // Hook for intersection observer animations
  useScrollAnimation: (animationClass: string, options?: IntersectionObserverInit) => {
    const ref = typeof window !== 'undefined' ? require('react').useRef(null) : { current: null };
    const { useEffect } = typeof window !== 'undefined' ? require('react') : { useEffect: () => {} };

    useEffect(() => {
      if (!ref.current) return;

      const observer = animationUtils.observeForAnimation(
        [ref.current],
        animationClass,
        options
      );

      return () => observer.disconnect();
    }, [animationClass, options]);

    return ref;
  },

  // Hook for reduced motion preference
  usePrefersReducedMotion: () => {
    const { useState, useEffect } = typeof window !== 'undefined' ? require('react') : { useState: () => [false], useEffect: () => {} };
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
  },
};

// Export animation presets for common UI patterns
export const presets = {
  // Modal animations
  modal: {
    overlay: {
      entering: { opacity: 0 },
      entered: { opacity: 1, transition: transitions.fade },
      exiting: { opacity: 0, transition: transitions.fade },
      exited: { opacity: 0 },
    },
    content: {
      entering: { transform: 'scale(0.9)', opacity: 0 },
      entered: { transform: 'scale(1)', opacity: 1, transition: transitions.all() },
      exiting: { transform: 'scale(0.9)', opacity: 0, transition: transitions.all() },
      exited: { transform: 'scale(0.9)', opacity: 0 },
    },
  },

  // Drawer animations
  drawer: {
    left: {
      entering: { transform: 'translateX(-100%)' },
      entered: { transform: 'translateX(0)', transition: transitions.slide },
      exiting: { transform: 'translateX(-100%)', transition: transitions.slide },
      exited: { transform: 'translateX(-100%)' },
    },
    right: {
      entering: { transform: 'translateX(100%)' },
      entered: { transform: 'translateX(0)', transition: transitions.slide },
      exiting: { transform: 'translateX(100%)', transition: transitions.slide },
      exited: { transform: 'translateX(100%)' },
    },
  },

  // Accordion animations
  accordion: {
    collapsed: { maxHeight: 0, opacity: 0, overflow: 'hidden' },
    expanded: { maxHeight: '1000px', opacity: 1, transition: transitions.expand },
    collapsing: { maxHeight: 0, opacity: 0, transition: transitions.collapse },
  },

  // Toast/Notification animations
  toast: {
    entering: { transform: 'translateY(100%)', opacity: 0 },
    entered: { 
      transform: 'translateY(0)', 
      opacity: 1, 
      transition: `transform ${durations.slide}ms ${easings.decelerate}, opacity ${durations.fade}ms ${easings.standard}`,
    },
    exiting: { transform: 'translateY(100%)', opacity: 0, transition: transitions.all() },
    exited: { transform: 'translateY(100%)', opacity: 0 },
  },

  // Tab animations
  tab: {
    inactive: { opacity: 0, display: 'none' },
    activating: { opacity: 0, display: 'block' },
    active: { opacity: 1, display: 'block', transition: transitions.fade },
    deactivating: { opacity: 0, transition: transitions.fade },
  },
};

export default {
  easings,
  durations,
  animations,
  transitions,
  animationUtils,
  animationStyles,
  useAnimation,
  presets,
};